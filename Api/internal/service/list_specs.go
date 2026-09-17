package service

import (
	"cmp"
	"fmt"
	"strconv"
)

func IntEqualsAny[T any](getters ...func(T) int64) FilterFunc[T] {
	return func(value string) (func(item T) bool, error) {
		expected, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("must be an integer")
		}
		return func(item T) bool {
			for _, get := range getters {
				if get(item) == expected {
					return true
				}
			}
			return false
		}, nil
	}
}

var teamListSpec = ListSpec[*Team]{
	Sorts: map[string]Comparator[*Team]{
		"name":                 ByText(func(t *Team) string { return t.Name }),
		"province":             ByText(func(t *Team) string { return t.Province }),
		"mascot":               ByText(func(t *Team) string { return t.Mascot }),
		"championships_played": ByNumber(func(t *Team) int32 { return t.ChampionshipsPlayed }),
		"championships_won":    ByNumber(func(t *Team) int32 { return t.ChampionshipsWon }),
		"players_count":        ByNumber(func(t *Team) int { return t.PlayersCount }),
		"coaches_count":        ByNumber(func(t *Team) int { return t.CoachesCount }),
	},
	Search: []func(*Team) string{
		func(t *Team) string { return t.Name },
		func(t *Team) string { return t.Province },
		func(t *Team) string { return t.Mascot },
	},
	Filters: map[string]FilterFunc[*Team]{
		"province":                 TextContains(func(t *Team) string { return t.Province }),
		"championships_played_min": IntMin(func(t *Team) int32 { return t.ChampionshipsPlayed }),
		"championships_played_max": IntMax(func(t *Team) int32 { return t.ChampionshipsPlayed }),
		"championships_won_min":    IntMin(func(t *Team) int32 { return t.ChampionshipsWon }),
		"championships_won_max":    IntMax(func(t *Team) int32 { return t.ChampionshipsWon }),
	},
}

var stadiumListSpec = ListSpec[*Stadium]{
	Sorts: map[string]Comparator[*Stadium]{
		"name":     ByText(func(s *Stadium) string { return s.Name }),
		"capacity": ByNumber(func(s *Stadium) int32 { return s.Capacity }),
	},
	Search: []func(*Stadium) string{
		func(s *Stadium) string { return s.Name },
	},
	Filters: map[string]FilterFunc[*Stadium]{
		"capacity_min": IntMin(func(s *Stadium) int32 { return s.Capacity }),
		"capacity_max": IntMax(func(s *Stadium) int32 { return s.Capacity }),
	},
}

var seasonListSpec = ListSpec[*Season]{
	Sorts: map[string]Comparator[*Season]{
		"title":      ByText(func(s *Season) string { return s.StartDate }),
		"start_date": ByText(func(s *Season) string { return s.StartDate }),
		"end_date":   ByText(func(s *Season) string { return s.EndDate }),
	},
	Filters: map[string]FilterFunc[*Season]{
		"start_date_from": DateFrom(func(s *Season) string { return s.StartDate }),
		"start_date_to":   DateTo(func(s *Season) string { return s.StartDate }),
		"end_date_from":   DateFrom(func(s *Season) string { return s.EndDate }),
		"end_date_to":     DateTo(func(s *Season) string { return s.EndDate }),
	},
}

var playerListSpec = ListSpec[*Player]{
	Sorts: map[string]Comparator[*Player]{
		"name":          ByText(func(p *Player) string { return p.Name }),
		"number":        ByNumber(func(p *Player) int32 { return p.Number }),
		"years_in_team": ByNumber(func(p *Player) int32 { return p.YearsInTeam }),
		"position":      ByText(func(p *Player) string { return p.Position }),
		"team_name":     ByText(func(p *Player) string { return p.TeamName }),
	},
	Search: []func(*Player) string{
		func(p *Player) string { return p.Name },
		func(p *Player) string { return p.Position },
		func(p *Player) string { return p.TeamName },
	},
	Filters: map[string]FilterFunc[*Player]{
		"team_id":           IntEquals(func(p *Player) int64 { return p.TeamID }),
		"position":          OneOf(func(p *Player) string { return p.Position }),
		"number":            IntEquals(func(p *Player) int32 { return p.Number }),
		"years_in_team_min": IntMin(func(p *Player) int32 { return p.YearsInTeam }),
		"years_in_team_max": IntMax(func(p *Player) int32 { return p.YearsInTeam }),
	},
}

var coachListSpec = ListSpec[*Coach]{
	Sorts: map[string]Comparator[*Coach]{
		"name":              ByText(func(c *Coach) string { return c.Name }),
		"number":            ByNumber(func(c *Coach) int32 { return c.Number }),
		"years_in_team":     ByNumber(func(c *Coach) int32 { return c.YearsInTeam }),
		"experience_years":  ByNumber(func(c *Coach) int32 { return c.ExperienceYears }),
		"championships_won": ByNumber(func(c *Coach) int32 { return c.ChampionshipsWon }),
		"team_name":         ByText(func(c *Coach) string { return c.TeamName }),
	},
	Search: []func(*Coach) string{
		func(c *Coach) string { return c.Name },
		func(c *Coach) string { return c.TeamName },
	},
	Filters: map[string]FilterFunc[*Coach]{
		"team_id":               IntEquals(func(c *Coach) int64 { return c.TeamID }),
		"experience_years_min":  IntMin(func(c *Coach) int32 { return c.ExperienceYears }),
		"experience_years_max":  IntMax(func(c *Coach) int32 { return c.ExperienceYears }),
		"championships_won_min": IntMin(func(c *Coach) int32 { return c.ChampionshipsWon }),
		"championships_won_max": IntMax(func(c *Coach) int32 { return c.ChampionshipsWon }),
		"years_in_team_min":     IntMin(func(c *Coach) int32 { return c.YearsInTeam }),
		"years_in_team_max":     IntMax(func(c *Coach) int32 { return c.YearsInTeam }),
	},
}

var matchListSpec = ListSpec[*Match]{
	Sorts: map[string]Comparator[*Match]{
		"match_date":     ByText(func(m *Match) string { return m.MatchDate }),
		"attendance":     ByNumber(func(m *Match) int32 { return m.Attendance }),
		"home_goals":     ByNumber(func(m *Match) int32 { return m.HomeGoals }),
		"away_goals":     ByNumber(func(m *Match) int32 { return m.AwayGoals }),
		"disputed":       ByBool(func(m *Match) bool { return m.Disputed }),
		"home_team_name": ByText(func(m *Match) string { return m.HomeTeamName }),
		"away_team_name": ByText(func(m *Match) string { return m.AwayTeamName }),
		"stadium_name":   ByText(func(m *Match) string { return m.StadiumName }),
		"result": func(a, b *Match) int {
			if diff := cmp.Compare(a.HomeGoals-a.AwayGoals, b.HomeGoals-b.AwayGoals); diff != 0 {
				return diff
			}
			return cmp.Compare(a.HomeGoals, b.HomeGoals)
		},
	},
	Search: []func(*Match) string{
		func(m *Match) string { return m.HomeTeamName },
		func(m *Match) string { return m.AwayTeamName },
		func(m *Match) string { return m.StadiumName },
	},
	Filters: map[string]FilterFunc[*Match]{
		"season_id": IntEquals(func(m *Match) int64 { return m.SeasonID }),
		"team_id": IntEqualsAny(
			func(m *Match) int64 { return m.HomeTeamID },
			func(m *Match) int64 { return m.AwayTeamID },
		),
		"home_team_id":   IntEquals(func(m *Match) int64 { return m.HomeTeamID }),
		"away_team_id":   IntEquals(func(m *Match) int64 { return m.AwayTeamID }),
		"stadium_id":     IntEquals(func(m *Match) int64 { return m.StadiumID }),
		"disputed":       BoolEquals(func(m *Match) bool { return m.Disputed }),
		"date_from":      DateFrom(func(m *Match) string { return m.MatchDate }),
		"date_to":        DateTo(func(m *Match) string { return m.MatchDate }),
		"attendance_min": IntMin(func(m *Match) int32 { return m.Attendance }),
		"attendance_max": IntMax(func(m *Match) int32 { return m.Attendance }),
	},
}

var userListSpec = ListSpec[*User]{
	Sorts: map[string]Comparator[*User]{
		"email":      ByText(func(u *User) string { return u.Email }),
		"role":       ByText(func(u *User) string { return u.Role }),
		"created_at": ByNumber(func(u *User) int64 { return u.CreatedAt.UnixNano() }),
	},
	Search: []func(*User) string{
		func(u *User) string { return u.Email },
	},
	Filters: map[string]FilterFunc[*User]{
		"role": OneOf(func(u *User) string { return u.Role }),
	},
}
