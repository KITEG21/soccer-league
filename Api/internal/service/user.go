package service

import (
	"context"
	"database/sql"
	"errors"
	"net/mail"
	"strings"
	"time"
	"unicode/utf8"

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
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateUserRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Role      string `json:"role"`
}

type UpdateUserRequest struct {
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
	Role      *string `json:"role"`
}

func validateUserName(ve *ValidationError, field, value string) {
	if value == "" {
		ve.Add(field, field+" is required")
	} else if utf8.RuneCountInString(value) > 100 {
		ve.Add(field, field+" must be at most 100 characters")
	}
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
	firstName, lastName := strings.TrimSpace(req.FirstName), strings.TrimSpace(req.LastName)
	validateUserName(validationErr, "first_name", firstName)
	validateUserName(validationErr, "last_name", lastName)
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
		FirstName:    firstName,
		LastName:     lastName,
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

func (s *UserService) Update(ctx context.Context, actor *User, id int64, req UpdateUserRequest) (*User, error) {
	if actor.ID == id && req.Role != nil {
		return nil, ErrSelfModification
	}
	current, err := s.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	ve := NewValidationError()
	if req.FirstName != nil {
		current.FirstName = strings.TrimSpace(*req.FirstName)
		validateUserName(ve, "first_name", current.FirstName)
	}
	if req.LastName != nil {
		current.LastName = strings.TrimSpace(*req.LastName)
		validateUserName(ve, "last_name", current.LastName)
	}
	if req.Role != nil {
		current.Role = *req.Role
		if !IsValidRole(current.Role) {
			ve.Add("role", "invalid role")
		}
	}
	if ve.HasErrors() {
		return nil, ve
	}
	row, err := s.store.UpdateUser(ctx, store.UpdateUserParams{
		ID: id, FirstName: current.FirstName, LastName: current.LastName, Role: current.Role,
	})
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
		FirstName: row.FirstName,
		LastName:  row.LastName,
		Email:     row.Email,
		Role:      row.Role,
		CreatedAt: row.CreatedAt,
	}
}
