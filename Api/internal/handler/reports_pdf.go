package handler

import (
	"bytes"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/football-api/internal/pdf"
	"github.com/go-chi/chi/v5"
)

func (h *ReportsHandler) PDF(w http.ResponseWriter, r *http.Request) {
	key := chi.URLParam(r, "report")
	lang := pdfLang(r)
	doc, filename, status, err := h.buildPDF(r, key, lang)
	if err != nil {
		writeError(w, status, err.Error())
		return
	}

	var buf bytes.Buffer
	if err := pdf.Render(&buf, *doc); err != nil {
		writeError(w, http.StatusInternalServerError, "could not generate pdf")
		return
	}

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=%q", filename))
	w.Header().Set("Content-Length", strconv.Itoa(buf.Len()))
	w.Header().Set("Cache-Control", "no-store")
	_, _ = w.Write(buf.Bytes())
}

func (h *ReportsHandler) buildPDF(r *http.Request, key, lang string) (*pdf.Document, string, int, error) {
	switch key {
	case "standings":
		return h.pdfStandings(r, lang)
	case "matches-between-teams":
		return h.pdfMatchesBetweenTeams(r, lang)
	case "matches-by-date":
		return h.pdfMatchesByDate(r, lang)
	case "coaches-by-experience":
		return h.pdfCoachesByExperience(r, lang)
	case "stadiums-by-attendance":
		return h.pdfStadiumsByAttendance(r, lang)
	case "team-status":
		return h.pdfTeamStatus(r, lang)
	case "all-star-team":
		return h.pdfAllStarTeam(r, lang)
	default:
		return nil, "", http.StatusNotFound, errors.New("unknown report")
	}
}

func pdfFilename(slug string) string {
	return fmt.Sprintf("%s-%s.pdf", slug, time.Now().Format("2006-01-02"))
}

func pdfDateLayout(lang string) string {
	if lang == "en" {
		return "01/02/2006"
	}
	return "02/01/2006"
}

func pdfDate(value, lang string) string {
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return value
	}
	return parsed.Format(pdfDateLayout(lang))
}

func pdfMetricLabel(lang, metric string) string {
	key := "metric." + metric
	label := pt(lang, key)
	if label == key {
		return metric
	}
	return label
}

func pdfReportError(err error) error {
	if errors.Is(err, sql.ErrNoRows) {
		return errors.New("not found")
	}
	return errors.New("internal server error")
}

func (h *ReportsHandler) pdfStandings(r *http.Request, lang string) (*pdf.Document, string, int, error) {
	seasonID, err := strconv.ParseInt(r.URL.Query().Get("seasonId"), 10, 64)
	if err != nil {
		return nil, "", http.StatusBadRequest, errors.New("invalid seasonId")
	}

	rows, err := h.svc.Standings(r.Context(), seasonID)
	if err != nil {
		return nil, "", http.StatusInternalServerError, pdfReportError(err)
	}

	doc := &pdf.Document{
		Title:    pt(lang, "standings.title"),
		Subtitle: pt(lang, "subtitle"),
		Filters:  []string{pt(lang, "filter.season") + " " + h.svc.SeasonLabel(r.Context(), seasonID, lang)},
		Columns: []pdf.Column{
			{Title: "#", Weight: 6, Align: pdf.AlignCenter},
			{Title: pt(lang, "col.team"), Weight: 64, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.points"), Weight: 12, Align: pdf.AlignRight},
		},
		Rows: make([][]string, 0, len(rows)),
		Lang: lang,
	}
	for i, row := range rows {
		doc.Rows = append(doc.Rows, []string{
			strconv.Itoa(i + 1),
			row.Name,
			strconv.FormatInt(row.Points, 10),
		})
	}
	return doc, pdfFilename(pt(lang, "file.standings")), http.StatusOK, nil
}

func (h *ReportsHandler) pdfMatchesBetweenTeams(r *http.Request, lang string) (*pdf.Document, string, int, error) {
	query := r.URL.Query()

	team1ID, err := strconv.ParseInt(query.Get("team1"), 10, 64)
	if err != nil {
		return nil, "", http.StatusBadRequest, errors.New("invalid team1")
	}
	team2ID, err := strconv.ParseInt(query.Get("team2"), 10, 64)
	if err != nil {
		return nil, "", http.StatusBadRequest, errors.New("invalid team2")
	}
	var seasonID *int64
	if value := query.Get("seasonId"); value != "" {
		parsed, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return nil, "", http.StatusBadRequest, errors.New("invalid seasonId")
		}
		seasonID = &parsed
	}

	rows, err := h.svc.MatchesBetweenTeams(r.Context(), team1ID, team2ID, seasonID)
	if err != nil {
		return nil, "", http.StatusInternalServerError, pdfReportError(err)
	}

	filters := []string{
		pt(lang, "filter.home_team") + " " + h.svc.TeamLabel(r.Context(), team1ID, lang),
		pt(lang, "filter.away_team") + " " + h.svc.TeamLabel(r.Context(), team2ID, lang),
	}
	if seasonID != nil {
		filters = append(filters, pt(lang, "filter.season")+" "+h.svc.SeasonLabel(r.Context(), *seasonID, lang))
	} else {
		filters = append(filters, pt(lang, "filter.all_seasons"))
	}

	doc := &pdf.Document{
		Title:    pt(lang, "head_to_head.title"),
		Subtitle: pt(lang, "subtitle"),
		Filters:  filters,
		Columns: []pdf.Column{
			{Title: pt(lang, "col.date"), Weight: 16, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.stadium"), Weight: 24, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.home"), Weight: 25, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.result"), Weight: 16, Align: pdf.AlignCenter},
			{Title: pt(lang, "col.away"), Weight: 25, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.assist_home"), Weight: 14, Align: pdf.AlignCenter},
			{Title: pt(lang, "col.assist_away"), Weight: 16, Align: pdf.AlignCenter},
		},
		Rows: make([][]string, 0, len(rows)),
		Lang: lang,
	}
	for _, row := range rows {
		doc.Rows = append(doc.Rows, []string{
			pdfDate(row.MatchDate, lang),
			row.StadiumName,
			row.HomeTeamName,
			fmt.Sprintf("%d - %d", row.HomeGoals, row.AwayGoals),
			row.AwayTeamName,
			strconv.FormatInt(row.HomeAssists, 10),
			strconv.FormatInt(row.AwayAssists, 10),
		})
	}
	return doc, pdfFilename(pt(lang, "file.head_to_head")), http.StatusOK, nil
}

func (h *ReportsHandler) pdfMatchesByDate(r *http.Request, lang string) (*pdf.Document, string, int, error) {
	query := r.URL.Query()

	date := query.Get("date")
	if date == "" {
		return nil, "", http.StatusBadRequest, errors.New("date is required")
	}
	if _, err := time.Parse("2006-01-02", date); err != nil {
		return nil, "", http.StatusBadRequest, errors.New("invalid date format, use yyyy-mm-dd")
	}

	var stadiumID *int64
	if value := query.Get("stadiumId"); value != "" {
		parsed, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return nil, "", http.StatusBadRequest, errors.New("invalid stadiumId")
		}
		stadiumID = &parsed
	}

	rows, err := h.svc.MatchesByDate(r.Context(), date, stadiumID)
	if err != nil {
		return nil, "", http.StatusInternalServerError, pdfReportError(err)
	}

	filters := []string{pt(lang, "filter.date") + " " + pdfDate(date, lang)}
	if stadiumID != nil {
		filters = append(filters, pt(lang, "filter.stadium")+" "+h.svc.StadiumLabel(r.Context(), *stadiumID, lang))
	} else {
		filters = append(filters, pt(lang, "filter.all_stadiums"))
	}

	doc := &pdf.Document{
		Title:    pt(lang, "matches_by_date.title"),
		Subtitle: pt(lang, "subtitle"),
		Filters:  filters,
		Columns: []pdf.Column{
			{Title: pt(lang, "col.date"), Weight: 16, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.stadium"), Weight: 26, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.home"), Weight: 28, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.result"), Weight: 14, Align: pdf.AlignCenter},
			{Title: pt(lang, "col.away"), Weight: 28, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.attendance"), Weight: 16, Align: pdf.AlignRight},
		},
		Rows: make([][]string, 0, len(rows)),
		Lang: lang,
	}
	for _, row := range rows {
		doc.Rows = append(doc.Rows, []string{
			pdfDate(row.MatchDate, lang),
			row.StadiumName,
			row.HomeTeamName,
			fmt.Sprintf("%d - %d", row.HomeGoals, row.AwayGoals),
			row.AwayTeamName,
			strconv.FormatInt(int64(row.Attendance), 10),
		})
	}
	return doc, pdfFilename(pt(lang, "file.matches_by_date")), http.StatusOK, nil
}

func (h *ReportsHandler) pdfCoachesByExperience(r *http.Request, lang string) (*pdf.Document, string, int, error) {
	rows, err := h.svc.CoachesByExperience(r.Context())
	if err != nil {
		return nil, "", http.StatusInternalServerError, pdfReportError(err)
	}

	doc := &pdf.Document{
		Title:    pt(lang, "coaches.title"),
		Subtitle: pt(lang, "subtitle"),
		Columns: []pdf.Column{
			{Title: "#", Weight: 6, Align: pdf.AlignCenter},
			{Title: pt(lang, "col.coach"), Weight: 34, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.number"), Weight: 12, Align: pdf.AlignCenter},
			{Title: pt(lang, "col.team"), Weight: 34, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.years"), Weight: 22, Align: pdf.AlignCenter},
			{Title: pt(lang, "col.championships"), Weight: 24, Align: pdf.AlignCenter},
		},
		Rows: make([][]string, 0, len(rows)),
		Lang: lang,
	}
	for i, row := range rows {
		teamName := row.TeamName
		if teamName == "" {
			teamName = pt(lang, "coach.no_team")
		}
		doc.Rows = append(doc.Rows, []string{
			strconv.Itoa(i + 1),
			row.Name,
			strconv.FormatInt(int64(row.Number), 10),
			teamName,
			strconv.FormatInt(int64(row.ExperienceYears), 10),
			strconv.FormatInt(int64(row.ChampionshipsWon), 10),
		})
	}
	return doc, pdfFilename(pt(lang, "file.coaches")), http.StatusOK, nil
}

func (h *ReportsHandler) pdfStadiumsByAttendance(r *http.Request, lang string) (*pdf.Document, string, int, error) {
	seasonID, err := strconv.ParseInt(r.URL.Query().Get("seasonId"), 10, 64)
	if err != nil {
		return nil, "", http.StatusBadRequest, errors.New("invalid seasonId")
	}

	rows, err := h.svc.StadiumsByAttendance(r.Context(), seasonID)
	if err != nil {
		return nil, "", http.StatusInternalServerError, pdfReportError(err)
	}

	doc := &pdf.Document{
		Title:    pt(lang, "attendance.title"),
		Subtitle: pt(lang, "subtitle"),
		Filters:  []string{pt(lang, "filter.season") + " " + h.svc.SeasonLabel(r.Context(), seasonID, lang)},
		Columns: []pdf.Column{
			{Title: "#", Weight: 6, Align: pdf.AlignCenter},
			{Title: pt(lang, "col.stadium"), Weight: 40, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.capacity"), Weight: 18, Align: pdf.AlignRight},
			{Title: pt(lang, "col.matches"), Weight: 16, Align: pdf.AlignRight},
			{Title: pt(lang, "col.total_att"), Weight: 24, Align: pdf.AlignRight},
			{Title: pt(lang, "col.percentage"), Weight: 20, Align: pdf.AlignRight},
		},
		Rows: make([][]string, 0, len(rows)),
		Lang: lang,
	}
	for i, row := range rows {
		doc.Rows = append(doc.Rows, []string{
			strconv.Itoa(i + 1),
			row.Name,
			strconv.FormatInt(int64(row.Capacity), 10),
			strconv.FormatInt(row.TotalMatches, 10),
			strconv.FormatInt(row.TotalAttendance, 10),
			fmt.Sprintf("%.1f%%", row.AttendancePercentage),
		})
	}
	return doc, pdfFilename(pt(lang, "file.attendance")), http.StatusOK, nil
}

func (h *ReportsHandler) pdfTeamStatus(r *http.Request, lang string) (*pdf.Document, string, int, error) {
	query := r.URL.Query()

	teamID, err := strconv.ParseInt(query.Get("teamId"), 10, 64)
	if err != nil {
		return nil, "", http.StatusBadRequest, errors.New("invalid teamId")
	}
	seasonID, err := strconv.ParseInt(query.Get("seasonId"), 10, 64)
	if err != nil {
		return nil, "", http.StatusBadRequest, errors.New("invalid seasonId")
	}

	row, err := h.svc.TeamStatus(r.Context(), teamID, seasonID)
	if err != nil {
		return nil, "", http.StatusInternalServerError, pdfReportError(err)
	}

	doc := &pdf.Document{
		Title:    pt(lang, "team_status.title"),
		Subtitle: pt(lang, "subtitle"),
		Filters: []string{
			pt(lang, "filter.team") + " " + h.svc.TeamLabel(r.Context(), teamID, lang),
			pt(lang, "filter.season") + " " + h.svc.SeasonLabel(r.Context(), seasonID, lang),
		},
		Columns: []pdf.Column{
			{Title: pt(lang, "col.statistic"), Weight: 40, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.home"), Weight: 18, Align: pdf.AlignCenter},
			{Title: pt(lang, "col.away"), Weight: 18, Align: pdf.AlignCenter},
			{Title: pt(lang, "col.total"), Weight: 18, Align: pdf.AlignCenter},
		},
		Rows: [][]string{
			{pt(lang, "stat.wins"), strconv.FormatInt(row.HomeWins, 10), strconv.FormatInt(row.AwayWins, 10), strconv.FormatInt(row.TotalWins, 10)},
			{pt(lang, "stat.draws"), strconv.FormatInt(row.HomeDraws, 10), strconv.FormatInt(row.AwayDraws, 10), strconv.FormatInt(row.TotalDraws, 10)},
			{pt(lang, "stat.losses"), strconv.FormatInt(row.HomeLosses, 10), strconv.FormatInt(row.AwayLosses, 10), strconv.FormatInt(row.TotalLosses, 10)},
		},
		Lang: lang,
	}
	return doc, pdfFilename(pt(lang, "file.team_status")), http.StatusOK, nil
}

func (h *ReportsHandler) pdfAllStarTeam(r *http.Request, lang string) (*pdf.Document, string, int, error) {
	seasonID, err := strconv.ParseInt(r.URL.Query().Get("seasonId"), 10, 64)
	if err != nil {
		return nil, "", http.StatusBadRequest, errors.New("invalid seasonId")
	}

	rows, err := h.svc.AllStarTeam(r.Context(), seasonID)
	if err != nil {
		return nil, "", http.StatusInternalServerError, pdfReportError(err)
	}

	doc := &pdf.Document{
		Title:    pt(lang, "all_star.title"),
		Subtitle: pt(lang, "subtitle"),
		Filters:  []string{pt(lang, "filter.season") + " " + h.svc.SeasonLabel(r.Context(), seasonID, lang)},
		Columns: []pdf.Column{
			{Title: pt(lang, "col.position"), Weight: 22, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.player"), Weight: 35, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.team"), Weight: 35, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.metric"), Weight: 41, Align: pdf.AlignLeft},
			{Title: pt(lang, "col.value"), Weight: 13, Align: pdf.AlignRight},
		},
		Rows: make([][]string, 0, len(rows)),
		Lang: lang,
	}
	for _, row := range rows {
		doc.Rows = append(doc.Rows, []string{
			pdfPositionLabel(lang, row.Position),
			row.PlayerName,
			row.TeamName,
			pdfMetricLabel(lang, row.MetricName),
			strconv.FormatInt(row.MetricValue, 10),
		})
	}
	return doc, pdfFilename(pt(lang, "file.all_star")), http.StatusOK, nil
}
