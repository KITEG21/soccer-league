package service

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"strings"
	"testing"

	"github.com/football-api/internal/store"
)

func TestUserNameValidation(t *testing.T) {
	for _, value := range []string{"", strings.Repeat("a", 101)} {
		ve := NewValidationError()
		validateUserName(ve, "first_name", value)
		if !ve.HasErrors() {
			t.Fatalf("invalid name accepted: %q", value)
		}
	}
	ve := NewValidationError()
	validateUserName(ve, "first_name", strings.Repeat("é", 100))
	if ve.HasErrors() {
		t.Fatal("name length must count Unicode characters, not bytes")
	}
}

func TestUserNamesIntegration(t *testing.T) {
	dsn := os.Getenv("HISTORY_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("set HISTORY_TEST_DATABASE_URL to run PostgreSQL integration tests")
	}
	ctx := context.Background()
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer tx.Rollback()
	q := store.New(tx)
	svc := NewUserService(q)
	actor, err := svc.Create(ctx, CreateUserRequest{
		FirstName: "  David Alfonso  ", LastName: "  Hernandez  ",
		Email: "profile-admin@example.com", Password: "Test1234", Role: RoleSuperadmin,
	})
	if err != nil || actor.FirstName != "David Alfonso" || actor.LastName != "Hernandez" {
		t.Fatalf("names were not stored and trimmed: %+v, %v", actor, err)
	}
	user, err := svc.Create(ctx, CreateUserRequest{
		FirstName: "Hasiel", LastName: "Reino Bello", Email: "profile-visitor@example.com",
		Password: "Test1234", Role: RoleVisitante,
	})
	if err != nil {
		t.Fatal(err)
	}
	page, err := svc.List(ctx, ListQuery{Search: "Reino Bello", Sort: "last_name", Limit: 10})
	if err != nil || page.Total != 1 || page.Items[0].ID != user.ID {
		t.Fatalf("names must be searchable and sortable: %+v, %v", page, err)
	}
	firstName, lastName, role := "Isaac Alef", "Garcia Batista", RoleAdmin
	updated, err := svc.Update(ctx, actor, user.ID, UpdateUserRequest{
		FirstName: &firstName, LastName: &lastName, Role: &role,
	})
	if err != nil || updated.FirstName != firstName || updated.LastName != lastName || updated.Role != role {
		t.Fatalf("profile update failed: %+v, %v", updated, err)
	}
	auth := NewAuthService(q, "integration-test-secret")
	tokens, err := auth.Login(ctx, LoginRequest{Email: actor.Email, Password: "Test1234"}, "127.0.0.1")
	if err != nil {
		t.Fatal(err)
	}
	selfName := "David"
	if _, err := svc.Update(ctx, actor, actor.ID, UpdateUserRequest{FirstName: &selfName}); err != nil {
		t.Fatal(err)
	}
	current, err := auth.UserFromToken(ctx, tokens.AccessToken)
	if err != nil || current.FirstName != selfName || current.LastName != "Hernandez" {
		t.Fatalf("the current-user endpoint must see updated names with an existing token: %+v, %v", current, err)
	}
	if _, err := svc.Update(ctx, actor, actor.ID, UpdateUserRequest{Role: &role}); !errors.Is(err, ErrSelfModification) {
		t.Fatalf("self role changes must stay prohibited, got %v", err)
	}
	empty := "   "
	if _, err := svc.Update(ctx, actor, user.ID, UpdateUserRequest{LastName: &empty}); !IsValidationError(err) {
		t.Fatalf("blank surnames must be rejected, got %v", err)
	}
	// Existing users have blank names until an administrator completes their profile.
	var legacyID int64
	if err := tx.QueryRowContext(ctx, "INSERT INTO Users(email,password_hash,role) VALUES ('legacy@example.com','existing-hash','visitante') RETURNING id").Scan(&legacyID); err != nil {
		t.Fatal(err)
	}
	legacy, err := svc.Get(ctx, legacyID)
	if err != nil || legacy.FirstName != "" || legacy.LastName != "" {
		t.Fatalf("existing accounts must remain readable: %+v, %v", legacy, err)
	}
	if _, err := svc.Update(ctx, actor, legacyID, UpdateUserRequest{FirstName: &firstName, LastName: &lastName}); err != nil {
		t.Fatal(err)
	}
}
