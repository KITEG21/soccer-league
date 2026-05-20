package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
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
	if err := RunMigrations(ctx, dsn); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	return db
}

// RunMigrations checks for and applies pending migrations
func RunMigrations(ctx context.Context, databaseURL string) error {
	migrationDir, err := findMigrationDir()
	if err != nil {
		return err
	}

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

	version, dirty, err := m.Version()
	if err != nil && err != migrate.ErrNilVersion {
		return fmt.Errorf("failed to get migration version: %w", err)
	}

	if dirty {
		if err := recoverDirtyMigration(ctx, db, m, version); err != nil {
			return err
		}
	}

	// Apply migrations
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to apply migrations: %w", err)
	}

	log.Println("Migrations applied successfully")
	return nil
}

func findMigrationDir() (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("failed to get working directory: %w", err)
	}

	checkDirs := []string{wd}
	for i := 0; i < 4; i++ {
		checkDirs = append(checkDirs, filepath.Dir(checkDirs[len(checkDirs)-1]))
	}

	for _, base := range checkDirs {
		candidate := filepath.Join(base, "sql", "migrations")
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			return candidate, nil
		}
	}

	return "", fmt.Errorf("failed to find migrations directory from %s", wd)
}

func recoverDirtyMigration(ctx context.Context, db *sql.DB, m *migrate.Migrate, version uint) error {
	if version != 2 {
		return fmt.Errorf("database is in dirty state at version %d, manual intervention required", version)
	}

	log.Printf("database is in dirty state at version %d; attempting automatic recovery", version)

	if err := applyMigrationTwoFixups(ctx, db); err != nil {
		return err
	}

	if err := m.Force(int(version)); err != nil {
		return fmt.Errorf("failed to force migration version %d after recovery: %w", version, err)
	}

	log.Printf("recovered dirty migration state at version %d", version)
	return nil
}

func applyMigrationTwoFixups(ctx context.Context, db *sql.DB) error {
	if err := renameTableIfNeeded(ctx, db, "futbolista", "footballer"); err != nil {
		return err
	}

	if err := renameColumnIfNeeded(ctx, db, "player", "futbolista_id", "footballer_id"); err != nil {
		return err
	}

	if err := renameColumnIfNeeded(ctx, db, "coach", "futbolista_id", "footballer_id"); err != nil {
		return err
	}

	if err := ensureUniqueIndex(ctx, db, "team", "team_name_unique", "name"); err != nil {
		return err
	}

	if err := ensureUniqueIndex(ctx, db, "stadium", "stadium_name_unique", "name"); err != nil {
		return err
	}

	return nil
}

func renameTableIfNeeded(ctx context.Context, db *sql.DB, oldName, newName string) error {
	oldExists, err := tableExists(ctx, db, oldName)
	if err != nil {
		return err
	}
	newExists, err := tableExists(ctx, db, newName)
	if err != nil {
		return err
	}

	if oldExists && !newExists {
		_, err = db.ExecContext(ctx, fmt.Sprintf("ALTER TABLE %s RENAME TO %s", oldName, newName))
		if err != nil {
			return fmt.Errorf("failed to rename table %s to %s: %w", oldName, newName, err)
		}
		log.Printf("renamed table %s to %s", oldName, newName)
	}

	return nil
}

func renameColumnIfNeeded(ctx context.Context, db *sql.DB, tableName, oldName, newName string) error {
	oldExists, err := columnExists(ctx, db, tableName, oldName)
	if err != nil {
		return err
	}
	newExists, err := columnExists(ctx, db, tableName, newName)
	if err != nil {
		return err
	}

	if oldExists && !newExists {
		_, err = db.ExecContext(ctx, fmt.Sprintf("ALTER TABLE %s RENAME COLUMN %s TO %s", tableName, oldName, newName))
		if err != nil {
			return fmt.Errorf("failed to rename column %s.%s to %s: %w", tableName, oldName, newName, err)
		}
		log.Printf("renamed column %s.%s to %s", tableName, oldName, newName)
	}

	return nil
}

func ensureUniqueIndex(ctx context.Context, db *sql.DB, tableName, indexName, columnName string) error {
	exists, err := uniqueIndexExists(ctx, db, indexName)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	hasDuplicates, err := hasDuplicateValues(ctx, db, tableName, columnName)
	if err != nil {
		return err
	}
	if hasDuplicates {
		log.Printf("skipping unique index %s because %s.%s contains duplicate values", indexName, tableName, columnName)
		return nil
	}

	_, err = db.ExecContext(ctx, fmt.Sprintf("CREATE UNIQUE INDEX IF NOT EXISTS %s ON %s (%s)", indexName, tableName, columnName))
	if err != nil {
		return fmt.Errorf("failed to create unique index %s on %s(%s): %w", indexName, tableName, columnName, err)
	}

	log.Printf("created unique index %s on %s(%s)", indexName, tableName, columnName)
	return nil
}

func tableExists(ctx context.Context, db *sql.DB, tableName string) (bool, error) {
	var exists bool
	err := db.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.tables
			WHERE table_schema = current_schema()
			  AND table_name = $1
		)
	`, tableName).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check whether table %s exists: %w", tableName, err)
	}

	return exists, nil
}

func columnExists(ctx context.Context, db *sql.DB, tableName, columnName string) (bool, error) {
	var exists bool
	err := db.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.columns
			WHERE table_schema = current_schema()
			  AND table_name = $1
			  AND column_name = $2
		)
	`, tableName, columnName).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check whether column %s.%s exists: %w", tableName, columnName, err)
	}

	return exists, nil
}

func uniqueIndexExists(ctx context.Context, db *sql.DB, indexName string) (bool, error) {
	var exists bool
	err := db.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM pg_indexes
			WHERE schemaname = current_schema()
			  AND indexname = $1
		)
	`, indexName).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check whether index %s exists: %w", indexName, err)
	}

	return exists, nil
}

func hasDuplicateValues(ctx context.Context, db *sql.DB, tableName, columnName string) (bool, error) {
	query := fmt.Sprintf(`
		SELECT EXISTS (
			SELECT 1
			FROM %s
			WHERE %s IS NOT NULL
			GROUP BY %s
			HAVING COUNT(*) > 1
		)
	`, tableName, columnName, columnName)

	var exists bool
	err := db.QueryRowContext(ctx, query).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check duplicate values for %s.%s: %w", tableName, columnName, err)
	}

	return exists, nil
}
