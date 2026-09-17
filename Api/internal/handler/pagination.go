package handler

import (
	"net/http"
	"strconv"
	"strings"

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

var reservedListParams = map[string]struct{}{
	"limit":  {},
	"offset": {},
	"sort":   {},
	"order":  {},
	"q":      {},
}

func parseListQuery(r *http.Request) service.ListQuery {
	limit, offset := parsePagination(r)
	values := r.URL.Query()
	filters := make(map[string]string)
	for key, value := range values {
		if _, reserved := reservedListParams[key]; !reserved && len(value) > 0 {
			filters[key] = value[0]
		}
	}
	return service.ListQuery{
		Limit:     limit,
		Offset:    offset,
		Sort:      values.Get("sort"),
		Direction: service.SortDirection(strings.ToLower(values.Get("order"))),
		Search:    values.Get("q"),
		Filters:   filters,
	}
}

func writeListError(w http.ResponseWriter, err error) {
	if service.IsValidationError(err) {
		handleValidationError(w, err)
		return
	}
	writeError(w, http.StatusInternalServerError, "internal server error")
}

type pagedResponse[T any] struct {
	Data   []T `json:"data"`
	Total  int `json:"total"`
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

func newPagedResponse[T any](data []T, total, limit, offset int) pagedResponse[T] {
	return pagedResponse[T]{Data: data, Total: total, Limit: limit, Offset: offset}
}
