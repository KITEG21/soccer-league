package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/football-api/internal/store"
)

const (
	AccessTokenTTL  = 15 * time.Minute
	RefreshTokenTTL = 7 * 24 * time.Hour
)

var dummyPasswordHash, _ = bcrypt.GenerateFromPassword([]byte("dummy-password"), bcrypt.DefaultCost)

type AuthService struct {
	store  *store.Queries
	secret []byte
}

func NewAuthService(s *store.Queries, secret string) *AuthService {
	return &AuthService{store: s, secret: []byte(secret)}
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	Role         string `json:"role"`
	Email        string `json:"email"`
}

type AccessClaims struct {
	Sub   int64  `json:"sub"`
	Email string `json:"email"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

func (s *AuthService) Login(ctx context.Context, req LoginRequest) (*TokenPair, error) {
	user, err := s.store.GetUserByEmail(ctx, normalizeEmail(req.Email))
	if errors.Is(err, sql.ErrNoRows) {
		_ = bcrypt.CompareHashAndPassword(dummyPasswordHash, []byte(req.Password))
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	return s.issueTokens(ctx, user)
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*TokenPair, error) {
	if refreshToken == "" {
		return nil, ErrInvalidToken
	}

	hash := hashToken(refreshToken)
	userID, err := s.store.RotateRefreshToken(ctx, hash)
	if errors.Is(err, sql.ErrNoRows) {
		if err := s.revokeOnReuse(ctx, hash); err != nil {
			return nil, err
		}
		return nil, ErrInvalidToken
	}
	if err != nil {
		return nil, err
	}

	user, err := s.store.GetUser(ctx, userID)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrInvalidToken
	}
	if err != nil {
		return nil, err
	}

	return s.issueTokens(ctx, user)
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return nil
	}
	return s.store.RevokeRefreshToken(ctx, hashToken(refreshToken))
}

func (s *AuthService) ParseAccessToken(token string) (*AccessClaims, error) {
	claims := &AccessClaims{}
	_, err := jwt.ParseWithClaims(token, claims, func(*jwt.Token) (interface{}, error) {
		return s.secret, nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}), jwt.WithExpirationRequired())
	if err != nil {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

func (s *AuthService) UserFromToken(ctx context.Context, token string) (*User, error) {
	claims, err := s.ParseAccessToken(token)
	if err != nil {
		return nil, err
	}
	row, err := s.store.GetUser(ctx, claims.Sub)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrInvalidToken
	}
	if err != nil {
		return nil, err
	}
	return toUser(row), nil
}

func (s *AuthService) revokeOnReuse(ctx context.Context, hash string) error {
	token, err := s.store.GetRefreshTokenByHash(ctx, hash)
	if errors.Is(err, sql.ErrNoRows) {
		return nil
	}
	if err != nil {
		return err
	}
	if token.RotatedAt.Valid && !token.RevokedAt.Valid && token.ExpiresAt.After(time.Now()) {
		return s.store.RevokeUserRefreshTokens(ctx, token.UserID)
	}
	return nil
}

func (s *AuthService) issueTokens(ctx context.Context, user store.User) (*TokenPair, error) {
	now := time.Now()
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, AccessClaims{
		Sub:   user.ID,
		Email: user.Email,
		Role:  user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(AccessTokenTTL)),
		},
	}).SignedString(s.secret)
	if err != nil {
		return nil, fmt.Errorf("sign access token: %w", err)
	}

	refreshToken, err := generateRefreshToken()
	if err != nil {
		return nil, err
	}

	err = s.store.CreateRefreshToken(ctx, store.CreateRefreshTokenParams{
		UserID:    user.ID,
		TokenHash: hashToken(refreshToken),
		ExpiresAt: now.Add(RefreshTokenTTL),
	})
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Role:         user.Role,
		Email:        user.Email,
	}, nil
}

func generateRefreshToken() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("generate refresh token: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
