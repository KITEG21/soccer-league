package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/football-api/internal/db"
	"github.com/football-api/internal/handler"
	"github.com/football-api/internal/service"
	"github.com/football-api/internal/store"
)

func main() {
	ctx := context.Background()

	// Init DB
	dbConn := db.NewDB(ctx)
	defer dbConn.Close()

	// Init sqlc store
	store := store.New(dbConn)

	// Init services
	teamSvc := service.NewTeamService(store)
	stadiumSvc := service.NewStadiumService(store)
	seasonSvc := service.NewSeasonService(store)
	playerSvc := service.NewPlayerService(store)

	// Init handlers
	teamHandler := handler.NewTeamHandler(teamSvc)
	stadiumHandler := handler.NewStadiumHandler(stadiumSvc)
	seasonHandler := handler.NewSeasonHandler(seasonSvc)
	playerHandler := handler.NewPlayerHandler(playerSvc)

	// Init router
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

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

	r.Route("/coaches", func(r chi.Router) {
		r.Post("/", playerHandler.CreateCoach)
		r.Get("/", playerHandler.ListCoaches)
		r.Get("/{id}", playerHandler.GetCoach)
		r.Put("/{id}", playerHandler.UpdateCoach)
		r.Delete("/{id}", playerHandler.DeleteCoach)
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	log.Printf("server starting on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
