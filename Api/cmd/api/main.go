package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/football-api/internal/db"
	"github.com/football-api/internal/handler"
	"github.com/football-api/internal/service"
	"github.com/football-api/internal/store"
)

func main() {
	ctx := context.Background()
	if err := loadEnvFile(); err != nil {
		log.Printf("env file not loaded: %v", err)
	}

	// Init DB (reads from environment variables)
	dbConn := db.NewDB(ctx)
	defer dbConn.Close()

	// Init sqlc store
	store := store.New(dbConn)

	// Init services
	teamSvc := service.NewTeamService(store)
	stadiumSvc := service.NewStadiumService(store)
	seasonSvc := service.NewSeasonService(store)
	playerSvc := service.NewPlayerService(store)
	matchSvc := service.NewMatchService(store)
	playerStatsSvc := service.NewPlayerStatsService(store)
	reportsSvc := service.NewReportsService(store)

	// Init handlers
	teamHandler := handler.NewTeamHandler(teamSvc)
	stadiumHandler := handler.NewStadiumHandler(stadiumSvc)
	seasonHandler := handler.NewSeasonHandler(seasonSvc)
	playerHandler := handler.NewPlayerHandler(playerSvc)
	matchHandler := handler.NewMatchHandler(matchSvc)
	playerStatsHandler := handler.NewPlayerStatsHandler(playerStatsSvc)
	reportsHandler := handler.NewReportsHandler(reportsSvc)

	// Init router
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept,Authorization,Content-Type,X-CSRF-Token")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	// Register API documentation routes
	handler.ServeScalarUI(r)

	// Register routes
	r.Route("/teams", func(r chi.Router) {
		r.Post("/", teamHandler.Create)
		r.Get("/", teamHandler.List)
		r.Get("/{id}", teamHandler.Get)
		r.Put("/{id}", teamHandler.Update)
		r.Delete("/{id}", teamHandler.Delete)
	})

	r.Route("/stadiums", func(r chi.Router) {
		r.Post("/", stadiumHandler.Create)
		r.Get("/", stadiumHandler.List)
		r.Get("/{id}", stadiumHandler.Get)
		r.Put("/{id}", stadiumHandler.Update)
		r.Delete("/{id}", stadiumHandler.Delete)
	})

	r.Route("/seasons", func(r chi.Router) {
		r.Post("/", seasonHandler.Create)
		r.Get("/", seasonHandler.List)
		r.Get("/{id}", seasonHandler.Get)
		r.Put("/{id}", seasonHandler.Update)
		r.Delete("/{id}", seasonHandler.Delete)
	})

	r.Route("/players", func(r chi.Router) {
		r.Post("/", playerHandler.CreatePlayer)
		r.Get("/", playerHandler.ListPlayers)
		r.Get("/{id}", playerHandler.GetPlayer)
		r.Put("/{id}", playerHandler.UpdatePlayer)
		r.Delete("/{id}", playerHandler.DeletePlayer)
	})

	r.Route("/matches", func(r chi.Router) {
		r.Post("/", matchHandler.Create)
		r.Get("/", matchHandler.List)
		r.Get("/{id}", matchHandler.Get)
		r.Put("/{id}", matchHandler.Update)
		r.Delete("/{id}", matchHandler.Delete)
	})

	r.Route("/player-stats", func(r chi.Router) {
		r.Post("/", playerStatsHandler.Create)
		r.Get("/", playerStatsHandler.List)
		r.Get("/{id}", playerStatsHandler.Get)
		r.Put("/{id}", playerStatsHandler.Update)
		r.Delete("/{id}", playerStatsHandler.Delete)
	})

	r.Route("/coaches", func(r chi.Router) {
		r.Post("/", playerHandler.CreateCoach)
		r.Get("/", playerHandler.ListCoaches)
		r.Get("/{id}", playerHandler.GetCoach)
		r.Put("/{id}", playerHandler.UpdateCoach)
		r.Delete("/{id}", playerHandler.DeleteCoach)
	})

	r.Route("/reports", func(r chi.Router) {
		r.Get("/standings", reportsHandler.Standings)
		r.Get("/matches-between-teams", reportsHandler.MatchesBetweenTeams)
		r.Get("/matches-by-date", reportsHandler.MatchesByDate)
		r.Get("/coaches-by-experience", reportsHandler.CoachesByExperience)
		r.Get("/stadiums-by-attendance", reportsHandler.StadiumsByAttendance)
		r.Get("/team-status/{teamId}", reportsHandler.TeamStatus)
		r.Get("/all-star-team", reportsHandler.AllStarTeam)
	})

	// Get port from environment variable or default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Remove any leading colon if present
	port = strings.TrimPrefix(port, ":")

	log.Printf("server starting on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func loadEnvFile() error {
	candidates := []string{
		".env",
		filepath.Join("..", ".env"),
		filepath.Join("..", "..", ".env"),
		filepath.Join("..", "..", "..", ".env"),
	}

	for _, path := range candidates {
		if err := loadEnvFileAt(path); err == nil {
			return nil
		}
	}

	return fmt.Errorf("no .env file found in expected locations")
}

func loadEnvFileAt(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.TrimSpace(value)
		if key == "" {
			continue
		}
		_ = os.Setenv(key, strings.Trim(value, `"`))
	}

	return nil
}
