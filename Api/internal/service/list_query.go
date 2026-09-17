package service

import (
	"cmp"
	"fmt"
	"slices"
	"strconv"
	"strings"
	"time"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

type SortDirection string

const (
	SortAsc  SortDirection = "asc"
	SortDesc SortDirection = "desc"
)

type ListQuery struct {
	Limit     int
	Offset    int
	Sort      string
	Direction SortDirection
	Search    string
	Filters   map[string]string
}

type Comparator[T any] func(a, b T) int

type FilterFunc[T any] func(value string) (func(item T) bool, error)

type ListSpec[T any] struct {
	Sorts   map[string]Comparator[T]
	Search  []func(item T) string
	Filters map[string]FilterFunc[T]
}

type ListResult[T any] struct {
	Items []T
	Total int
}

func ApplyListQuery[T any](items []T, spec ListSpec[T], query ListQuery) (ListResult[T], error) {
	validationErr := NewValidationError()

	predicates := make([]func(item T) bool, 0, len(query.Filters))
	for key, value := range query.Filters {
		build, ok := spec.Filters[key]
		if !ok {
			validationErr.Add(key, "unknown filter")
			continue
		}
		if strings.TrimSpace(value) == "" {
			continue
		}
		predicate, err := build(strings.TrimSpace(value))
		if err != nil {
			validationErr.Add(key, err.Error())
			continue
		}
		predicates = append(predicates, predicate)
	}

	var compare Comparator[T]
	if query.Sort != "" {
		var ok bool
		if compare, ok = spec.Sorts[query.Sort]; !ok {
			validationErr.Add("sort", "unsupported sort field")
		}
	}
	if query.Direction != "" && query.Direction != SortAsc && query.Direction != SortDesc {
		validationErr.Add("order", "order must be asc or desc")
	}
	if validationErr.HasErrors() {
		return ListResult[T]{}, validationErr
	}

	search := foldText(strings.TrimSpace(query.Search))
	filtered := make([]T, 0, len(items))
	for _, item := range items {
		if matchesSearch(item, spec.Search, search) && matchesAll(item, predicates) {
			filtered = append(filtered, item)
		}
	}

	if compare != nil {
		slices.SortStableFunc(filtered, func(a, b T) int {
			if query.Direction == SortDesc {
				return compare(b, a)
			}
			return compare(a, b)
		})
	}

	page, total := paginateSlice(filtered, query.Limit, query.Offset)
	return ListResult[T]{Items: page, Total: total}, nil
}

func matchesSearch[T any](item T, fields []func(item T) string, search string) bool {
	if search == "" || len(fields) == 0 {
		return true
	}
	for _, field := range fields {
		if strings.Contains(foldText(field(item)), search) {
			return true
		}
	}
	return false
}

func matchesAll[T any](item T, predicates []func(item T) bool) bool {
	for _, predicate := range predicates {
		if !predicate(item) {
			return false
		}
	}
	return true
}

func foldText(value string) string {
	folded, _, err := transform.String(
		transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC),
		value,
	)
	if err != nil {
		folded = value
	}
	return strings.ToLower(folded)
}

func ByText[T any](get func(T) string) Comparator[T] {
	return func(a, b T) int { return cmp.Compare(foldText(get(a)), foldText(get(b))) }
}

func ByNumber[T any, N cmp.Ordered](get func(T) N) Comparator[T] {
	return func(a, b T) int { return cmp.Compare(get(a), get(b)) }
}

func ByBool[T any](get func(T) bool) Comparator[T] {
	return func(a, b T) int {
		return cmp.Compare(boolToInt(get(a)), boolToInt(get(b)))
	}
}

func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

func TextContains[T any](get func(T) string) FilterFunc[T] {
	return func(value string) (func(item T) bool, error) {
		needle := foldText(value)
		return func(item T) bool { return strings.Contains(foldText(get(item)), needle) }, nil
	}
}

func OneOf[T any](get func(T) string) FilterFunc[T] {
	return func(value string) (func(item T) bool, error) {
		allowed := make(map[string]struct{})
		for _, option := range strings.Split(value, ",") {
			if option = strings.TrimSpace(option); option != "" {
				allowed[foldText(option)] = struct{}{}
			}
		}
		return func(item T) bool {
			_, ok := allowed[foldText(get(item))]
			return ok
		}, nil
	}
}

func IntEquals[T any, N ~int32 | ~int64](get func(T) N) FilterFunc[T] {
	return intFilter(get, func(actual, expected int64) bool { return actual == expected })
}

func IntMin[T any, N ~int32 | ~int64](get func(T) N) FilterFunc[T] {
	return intFilter(get, func(actual, bound int64) bool { return actual >= bound })
}

func IntMax[T any, N ~int32 | ~int64](get func(T) N) FilterFunc[T] {
	return intFilter(get, func(actual, bound int64) bool { return actual <= bound })
}

func intFilter[T any, N ~int32 | ~int64](get func(T) N, match func(actual, bound int64) bool) FilterFunc[T] {
	return func(value string) (func(item T) bool, error) {
		bound, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("must be an integer")
		}
		return func(item T) bool { return match(int64(get(item)), bound) }, nil
	}
}

func BoolEquals[T any](get func(T) bool) FilterFunc[T] {
	return func(value string) (func(item T) bool, error) {
		expected, err := strconv.ParseBool(value)
		if err != nil {
			return nil, fmt.Errorf("must be true or false")
		}
		return func(item T) bool { return get(item) == expected }, nil
	}
}

func DateFrom[T any](get func(T) string) FilterFunc[T] {
	return dateFilter(get, func(actual, bound string) bool { return actual >= bound })
}

func DateTo[T any](get func(T) string) FilterFunc[T] {
	return dateFilter(get, func(actual, bound string) bool { return actual <= bound })
}

func dateFilter[T any](get func(T) string, match func(actual, bound string) bool) FilterFunc[T] {
	return func(value string) (func(item T) bool, error) {
		if _, err := time.Parse("2006-01-02", value); err != nil {
			return nil, fmt.Errorf("invalid date format, use yyyy-mm-dd")
		}
		return func(item T) bool {
			actual := get(item)
			return actual != "" && match(actual[:min(len(actual), 10)], value)
		}, nil
	}
}
