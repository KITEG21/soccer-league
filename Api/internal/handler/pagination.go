package handler

import (
	"net/http"
	"strconv"

	"github.com/football-api/internal/service"
)

func parsePagination(r *http.Request) (int, int) {
	limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil {
		limit = service.DefaultPageLimit
	}
	offset, err := strconv.Atoi(r.URL.Query().Get("offset"))
	if err != nil {
		offset = 0
	}
	return limit, offset
}
