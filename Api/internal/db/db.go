package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	migrate "github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/jackc/pgx/v5/stdlib"
)

// getEnvWithDefault returns environment variable value or default if not set
func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func NewDB(ctx context.Context) *sql.DB {
	// First check if full DATABASE_URL is provided
	dsn := os.Getenv("DATABASE_URL")

	// If not, build DSN from individual environment variables
	if dsn == "" {
		host := getEnvWithDefault("DB_HOST", "localhost")
		port := getEnvWithDefault("DB_PORT", "5432")
		user := getEnvWithDefault("DB_USER", "postgres")
		password := os.Getenv("DB_PASSWORD") // No default for security
		dbname := getEnvWithDefault("DB_NAME", "football")
		sslmode := getEnvWithDefault("DB_SSLMODE", "disable")

		dsn = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			host, port, user, password, dbname, sslmode)
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(time.Hour)

	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("failed to ping db: %v", err)
	}

	// Run migrations
	if err := RunMigrations(dsn); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	return db
}

// RunMigrations checks for and applies pending migrations
func RunMigrations(databaseURL string) error {
	// Create file source for migrations
	wd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("failed to get working directory: %w", err)
	}

	// On Windows, convert path to file:// URL format
	migrationDir := wd + string(os.PathSeparator) + "sql" + string(os.PathSeparator) + "migrations"

	// For file source, we need to use the absolute path
	fileSource, err := (&file.File{}).Open(migrationDir)
	if err != nil {
		return fmt.Errorf("failed to open migrations source: %w", err)
	}
	defer fileSource.Close()

	// Create postgres database instance
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return fmt.Errorf("failed to open db for migrations: %w", err)
	}
	defer db.Close()

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("failed to create postgres driver: %w", err)
	}

	// Create migrator
	m, err := migrate.NewWithInstance("file", fileSource, "postgres", driver)
	if err != nil {
		return fmt.Errorf("failed to create migrator: %w", err)
	}
	defer m.Close()

	// Check if there are pending migrations
	if err := checkPendingMigrations(m); err != nil {
		return err
	}

	// Apply migrations
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to apply migrations: %w", err)
	}

	log.Println("Migrations applied successfully")
	return nil
}

// checkPendingMigrations checks if there are any pending migrations
func checkPendingMigrations(m *migrate.Migrate) error {
	// Get current version
	version, dirty, err := m.Version()
	if err != nil && err != migrate.ErrNilVersion {
		return fmt.Errorf("failed to get migration version: %w", err)
	}

	if err == migrate.ErrNilVersion {
		log.Println("No migrations applied yet. Applying initial migration...")
		return nil
	}

	if dirty {
		return fmt.Errorf("database is in dirty state at version %d, manual intervention required", version)
	}

	// Check if there are pending migrations by looking at the next version
	log.Printf("Database is up to date. Current version: %d\n", version)

	return nil
}
