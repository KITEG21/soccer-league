package service

import (
	"encoding/json"
	"errors"
	"fmt"
)

var (
	ErrNameConflict = errors.New("name already exists")
	ErrNotFound     = errors.New("resource not found")
)

// ValidationError es una estructura que agrupa todos los errores de validación
type ValidationError struct {
	Errors map[string]string `json:"errors"`
}

// NewValidationError crea un nuevo error de validación
func NewValidationError() *ValidationError {
	return &ValidationError{
		Errors: make(map[string]string),
	}
}

// Add añade un error de validación para un campo específico
func (ve *ValidationError) Add(field, message string) {
	if ve.Errors == nil {
		ve.Errors = make(map[string]string)
	}
	ve.Errors[field] = message
}

// HasErrors retorna true si hay errores
func (ve *ValidationError) HasErrors() bool {
	return len(ve.Errors) > 0
}

// Error implementa la interfaz error
func (ve *ValidationError) Error() string {
	if !ve.HasErrors() {
		return "no validation errors"
	}
	data, _ := json.Marshal(ve.Errors)
	return string(data)
}

// IsValidationError verifica si un error es un ValidationError
func IsValidationError(err error) bool {
	_, ok := err.(*ValidationError)
	return ok
}

// DateRangeOverlapError representa un error de solapamiento de fechas
type DateRangeOverlapError struct {
	Field           string
	OverlappingWith int64
	Message         string
}

func NewDateRangeOverlapError(field string, overlappingID int64, existingStart, existingEnd, newStart, newEnd string) *DateRangeOverlapError {
	msg := fmt.Sprintf(
		"date range conflict: proposed range (%s to %s) overlaps with existing record (ID: %d, range: %s to %s)",
		newStart, newEnd, overlappingID, existingStart, existingEnd,
	)
	return &DateRangeOverlapError{
		Field:           field,
		OverlappingWith: overlappingID,
		Message:         msg,
	}
}

func (droe *DateRangeOverlapError) Error() string {
	return droe.Message
}

// EntityInUseError representa un error cuando se intenta eliminar una entidad que tiene referencias
type EntityInUseError struct {
	EntityType  string
	EntityID    int64
	References  map[string]int // tipo de referencia -> cantidad
	Message     string
}

func NewEntityInUseError(entityType string, entityID int64, refs map[string]int) *EntityInUseError {
	refStr := ""
	for refType, count := range refs {
		if refStr != "" {
			refStr += ", "
		}
		refStr += fmt.Sprintf("%d %s(s)", count, refType)
	}
	msg := fmt.Sprintf(
		"cannot delete %s (ID: %d) because it is referenced by: %s",
		entityType, entityID, refStr,
	)
	return &EntityInUseError{
		EntityType: entityType,
		EntityID:   entityID,
		References: refs,
		Message:    msg,
	}
}

func (eiue *EntityInUseError) Error() string {
	return eiue.Message
}
