package service

import (
	"context"
	"database/sql"
	"errors"
	"net/mail"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"

	"github.com/football-api/internal/store"
)

const (
	RoleSuperadmin = "superadmin"
	RoleAdmin      = "admin"
	RoleVisitante  = "visitante"

	minPasswordLength = 8
	maxPasswordLength = 72
)

type UserService struct {
	store *store.Queries
}

func NewUserService(s *store.Queries) *UserService {
	return &UserService{store: s}
}

type User struct {
	ID        int64     `json:"id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateUserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type UpdateUserRoleRequest struct {
	Role string `json:"role"`
}

func IsValidRole(role string) bool {
	switch role {
	case RoleSuperadmin, RoleAdmin, RoleVisitante:
		return true
	}
	return false
}

func (u *User) HasRole(roles ...string) bool {
	for _, role := range roles {
		if u.Role == role {
			return true
		}
	}
	return false
}

func (s *UserService) List(ctx context.Context, query ListQuery) (ListResult[*User], error) {
	rows, err := s.store.ListUsers(ctx)
	if err != nil {
		return ListResult[*User]{}, err
	}
	users := make([]*User, len(rows))
	for i, row := range rows {
		users[i] = toUser(row)
	}
	return ApplyListQuery(users, userListSpec, query)
}

func (s *UserService) Get(ctx context.Context, id int64) (*User, error) {
	row, err := s.store.GetUser(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return toUser(row), nil
}

func (s *UserService) Create(ctx context.Context, req CreateUserRequest) (*User, error) {
	email := normalizeEmail(req.Email)
	validationErr := NewValidationError()
	if email == "" {
		validationErr.Add("email", "email is required")
	} else if addr, err := mail.ParseAddress(email); err != nil || addr.Address != email {
		validationErr.Add("email", "invalid email")
	}
	if len(req.Password) < minPasswordLength {
		validationErr.Add("password", "password must be at least 8 characters")
	} else if len(req.Password) > maxPasswordLength {
		validationErr.Add("password", "password must be at most 72 characters")
	}
	if !IsValidRole(req.Role) {
		validationErr.Add("role", "invalid role")
	}
	if validationErr.HasErrors() {
		return nil, validationErr
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	row, err := s.store.CreateUser(ctx, store.CreateUserParams{
		Email:        email,
		PasswordHash: string(hash),
		Role:         req.Role,
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrEmailTaken
		}
		return nil, err
	}
	return toUser(row), nil
}

func (s *UserService) UpdateRole(ctx context.Context, actor *User, id int64, req UpdateUserRoleRequest) (*User, error) {
	if !IsValidRole(req.Role) {
		validationErr := NewValidationError()
		validationErr.Add("role", "invalid role")
		return nil, validationErr
	}
	if actor.ID == id {
		return nil, ErrSelfModification
	}

	row, err := s.store.UpdateUserRole(ctx, store.UpdateUserRoleParams{ID: id, Role: req.Role})
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return toUser(row), nil
}

func (s *UserService) Delete(ctx context.Context, actor *User, id int64) error {
	if actor.ID == id {
		return ErrSelfModification
	}
	affected, err := s.store.DeleteUser(ctx, id)
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func toUser(row store.User) *User {
	return &User{
		ID:        row.ID,
		Email:     row.Email,
		Role:      row.Role,
		CreatedAt: row.CreatedAt,
	}
}
