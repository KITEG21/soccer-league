package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/football-api/internal/service"
	"github.com/go-chi/chi/v5"
)

type ReportsHandler struct {
	svc *service.ReportsService
}

func NewReportsHandler(svc *service.ReportsService) *ReportsHandler {
	return &ReportsHandler{svc: svc}
}

func parseOptionalInt64(value string) (*int64, error) {
	if value == "" {
		return nil, nil
	}
	id, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return nil, err
	}
	return &id, nil
}

func (h *ReportsHandler) Standings(w http.ResponseWriter, r *http.Request) {
	seasonID, err := strconv.ParseInt(r.URL.Query().Get("seasonId"), 10, 64)
	if err != nil {
		http.Error(w, "invalid seasonId", http.StatusBadRequest)
		return
	}
	rows, err := h.svc.Standings(r.Context(), seasonID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func (h *ReportsHandler) MatchesBetweenTeams(w http.ResponseWriter, r *http.Request) {
	team1ID, err := strconv.ParseInt(r.URL.Query().Get("team1"), 10, 64)
	if err != nil {
		http.Error(w, "invalid team1", http.StatusBadRequest)
		return
	}
	team2ID, err := strconv.ParseInt(r.URL.Query().Get("team2"), 10, 64)
	if err != nil {
		http.Error(w, "invalid team2", http.StatusBadRequest)
		return
	}
	seasonID, err := parseOptionalInt64(r.URL.Query().Get("seasonId"))
	if err != nil {
		http.Error(w, "invalid seasonId", http.StatusBadRequest)
		return
	}
	rows, err := h.svc.MatchesBetweenTeams(r.Context(), team1ID, team2ID, seasonID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func (h *ReportsHandler) MatchesByDate(w http.ResponseWriter, r *http.Request) {
	date := r.URL.Query().Get("date")
	if date == "" {
		http.Error(w, "date is required", http.StatusBadRequest)
		return
	}
	stadiumID, err := parseOptionalInt64(r.URL.Query().Get("stadiumId"))
	if err != nil {
		http.Error(w, "invalid stadiumId", http.StatusBadRequest)
		return
	}
	if stadiumID == nil {
		stadiumID, err = parseOptionalInt64(r.URL.Query().Get("stadium"))
		if err != nil {
			http.Error(w, "invalid stadium", http.StatusBadRequest)
			return
		}
	}
	rows, err := h.svc.MatchesByDate(r.Context(), date, stadiumID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func (h *ReportsHandler) CoachesByExperience(w http.ResponseWriter, r *http.Request) {
	rows, err := h.svc.CoachesByExperience(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func (h *ReportsHandler) StadiumsByAttendance(w http.ResponseWriter, r *http.Request) {
	seasonID, err := strconv.ParseInt(r.URL.Query().Get("seasonId"), 10, 64)
	if err != nil {
		http.Error(w, "invalid seasonId", http.StatusBadRequest)
		return
	}
	rows, err := h.svc.StadiumsByAttendance(r.Context(), seasonID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func (h *ReportsHandler) TeamStatus(w http.ResponseWriter, r *http.Request) {
	teamID, err := strconv.ParseInt(chi.URLParam(r, "teamId"), 10, 64)
	if err != nil {
		http.Error(w, "invalid teamId", http.StatusBadRequest)
		return
	}
	seasonID, err := strconv.ParseInt(r.URL.Query().Get("seasonId"), 10, 64)
	if err != nil {
		http.Error(w, "invalid seasonId", http.StatusBadRequest)
		return
	}
	row, err := h.svc.TeamStatus(r.Context(), teamID, seasonID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(row)
}

func (h *ReportsHandler) AllStarTeam(w http.ResponseWriter, r *http.Request) {
	seasonID, err := strconv.ParseInt(r.URL.Query().Get("seasonId"), 10, 64)
	if err != nil {
		http.Error(w, "invalid seasonId", http.StatusBadRequest)
		return
	}
	rows, err := h.svc.AllStarTeam(r.Context(), seasonID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}
