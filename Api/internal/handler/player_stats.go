package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/football-api/internal/service"
	"github.com/go-chi/chi/v5"
)

type PlayerStatsHandler struct {
	svc *service.PlayerStatsService
}

func NewPlayerStatsHandler(svc *service.PlayerStatsService) *PlayerStatsHandler {
	return &PlayerStatsHandler{svc: svc}
}

func (h *PlayerStatsHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req service.CreatePlayerStatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	stat, err := h.svc.Create(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(stat)
}

func (h *PlayerStatsHandler) List(w http.ResponseWriter, r *http.Request) {
	if matchIDParam := r.URL.Query().Get("match_id"); matchIDParam != "" {
		matchID, err := strconv.ParseInt(matchIDParam, 10, 64)
		if err != nil {
			http.Error(w, "invalid match_id", http.StatusBadRequest)
			return
		}
		stats, err := h.svc.ListByMatch(r.Context(), matchID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(stats)
		return
	}

	limit, offset := parsePagination(r)
	stats, err := h.svc.List(r.Context(), limit, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func (h *PlayerStatsHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	stat, err := h.svc.Get(r.Context(), id)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stat)
}

func (h *PlayerStatsHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	var req service.UpdatePlayerStatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	if err := h.svc.Update(r.Context(), id, req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *PlayerStatsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	if err := h.svc.Delete(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
