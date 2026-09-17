package handler

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/football-api/internal/service"
)

type contextKey string

const currentUserKey contextKey = "currentUser"

func RequireAuth(auth *service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := bearerToken(r)
			if token == "" {
				writeError(w, http.StatusUnauthorized, "unauthorized")
				return
			}
			user, err := auth.UserFromToken(r.Context(), token)
			if err != nil {
				if errors.Is(err, service.ErrInvalidToken) {
					writeError(w, http.StatusUnauthorized, "unauthorized")
					return
				}
				writeError(w, http.StatusInternalServerError, "internal server error")
				return
			}
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), currentUserKey, user)))
		})
	}
}

func RequirePermission(permission service.Permission) func(http.Handler) http.Handler {
	return authorize(func(*http.Request) service.Permission { return permission })
}

func AuthorizeResource(resource string) func(http.Handler) http.Handler {
	return authorize(func(r *http.Request) service.Permission {
		return service.NewPermission(resource, actionForMethod(r.Method))
	})
}

func authorize(required func(*http.Request) service.Permission) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, ok := CurrentUser(r)
			if !ok {
				writeError(w, http.StatusUnauthorized, "unauthorized")
				return
			}
			if !user.Can(required(r)) {
				writeError(w, http.StatusForbidden, "forbidden")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func actionForMethod(method string) service.Action {
	switch method {
	case http.MethodGet, http.MethodHead, http.MethodOptions:
		return service.ActionRead
	default:
		return service.ActionWrite
	}
}

func CurrentUser(r *http.Request) (*service.User, bool) {
	user, ok := r.Context().Value(currentUserKey).(*service.User)
	return user, ok && user != nil
}

func bearerToken(r *http.Request) string {
	scheme, token, ok := strings.Cut(r.Header.Get("Authorization"), " ")
	if !ok || !strings.EqualFold(scheme, "Bearer") {
		return ""
	}
	return strings.TrimSpace(token)
}
