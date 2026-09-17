package service

import "sort"

type Permission string

type Action string

const (
	ActionRead  Action = "read"
	ActionWrite Action = "write"
)

const (
	ResourceUsers       = "users"
	ResourceTeams       = "teams"
	ResourceStadiums    = "stadiums"
	ResourceSeasons     = "seasons"
	ResourcePlayers     = "players"
	ResourceCoaches     = "coaches"
	ResourceMatches     = "matches"
	ResourcePlayerStats = "player-stats"
	ResourceReports     = "reports"
)

func NewPermission(resource string, action Action) Permission {
	return Permission(resource + ":" + string(action))
}

var leagueResources = []string{
	ResourceTeams,
	ResourceStadiums,
	ResourceSeasons,
	ResourcePlayers,
	ResourceCoaches,
	ResourceMatches,
	ResourcePlayerStats,
}

var rolePermissions = map[string]map[Permission]struct{}{
	RoleSuperadmin: permissionSet(
		grant(leagueResources, ActionRead, ActionWrite),
		grant([]string{ResourceReports}, ActionRead),
		grant([]string{ResourceUsers}, ActionRead, ActionWrite),
	),
	RoleAdmin: permissionSet(
		grant(leagueResources, ActionRead, ActionWrite),
		grant([]string{ResourceReports}, ActionRead),
	),
	RoleVisitante: permissionSet(
		grant(leagueResources, ActionRead),
		grant([]string{ResourceReports}, ActionRead),
	),
}

func grant(resources []string, actions ...Action) []Permission {
	permissions := make([]Permission, 0, len(resources)*len(actions))
	for _, resource := range resources {
		for _, action := range actions {
			permissions = append(permissions, NewPermission(resource, action))
		}
	}
	return permissions
}

func permissionSet(groups ...[]Permission) map[Permission]struct{} {
	set := make(map[Permission]struct{})
	for _, group := range groups {
		for _, permission := range group {
			set[permission] = struct{}{}
		}
	}
	return set
}

func RoleHasPermission(role string, permission Permission) bool {
	_, ok := rolePermissions[role][permission]
	return ok
}

func PermissionsForRole(role string) []string {
	permissions := make([]string, 0, len(rolePermissions[role]))
	for permission := range rolePermissions[role] {
		permissions = append(permissions, string(permission))
	}
	sort.Strings(permissions)
	return permissions
}

func (u *User) Can(permission Permission) bool {
	return RoleHasPermission(u.Role, permission)
}
