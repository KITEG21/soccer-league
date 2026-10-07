package pdf

import (
	"errors"
	"io"
	"strconv"
	"strings"
	"time"

	"github.com/go-pdf/fpdf"
)

type Align string

const (
	AlignLeft   Align = "L"
	AlignCenter Align = "C"
	AlignRight  Align = "R"
)

type Column struct {
	Title  string
	Weight float64
	Align  Align
}

type Document struct {
	Title    string
	Subtitle string
	Filters  []string
	Columns  []Column
	Rows     [][]string
	EmptyMsg string
	Lang     string
}

type uiText struct {
	generated  string
	pagePrefix string
	pageSuffix string
	empty      string
}

var uiTexts = map[string]uiText{
	"es": {
		generated:  "Generado el ",
		pagePrefix: "Página ",
		pageSuffix: " de {nb}",
		empty:      "No hay datos disponibles",
	},
	"en": {
		generated:  "Generated ",
		pagePrefix: "Page ",
		pageSuffix: " of {nb}",
		empty:      "No data available",
	},
}

func uiTextFor(lang string) uiText {
	if text, ok := uiTexts[lang]; ok {
		return text
	}
	return uiTexts["es"]
}

const (
	orgName = "Soccer League"

	marginLeft   = 12.0
	marginTop    = 14.0
	marginRight  = 12.0
	marginBottom = 18.0

	cellPadX    = 1.4
	cellPadY    = 1.3
	lineHeight  = 4.6
	minInnerW   = 4.0
	emptyRowH   = 12.0
	fontSize    = 9.0
	footerAtTop = -14.0
)

var (
	headerFill = [3]int{31, 41, 55}
	zebraFill  = [3]int{243, 244, 246}
	emptyFill  = [3]int{249, 250, 251}
	lineColor  = [3]int{209, 213, 219}
	accentLine = [3]int{22, 101, 52}
	mutedText  = [3]int{107, 114, 128}
	titleText  = [3]int{17, 24, 39}
	whiteText  = [3]int{255, 255, 255}
)

func Render(w io.Writer, doc Document) error {
	if len(doc.Columns) == 0 {
		return errors.New("pdf: document has no columns")
	}

	f := fpdf.New("P", "mm", "A4", "")
	f.SetCompression(true)
	f.SetMargins(marginLeft, marginTop, marginRight)
	f.SetAutoPageBreak(false, 0)
	f.SetCreator("Soccer League", true)
	f.SetTitle(doc.Title, true)
	f.AliasNbPages("{nb}")

	tr := f.UnicodeTranslatorFromDescriptor("cp1252")
	ui := uiTextFor(doc.Lang)
	generatedAt := time.Now().Format("02/01/2006 15:04")
	pageWidth, _ := f.GetPageSize()
	rightEdge := pageWidth - marginRight

	f.SetHeaderFunc(func() {
		f.SetXY(marginLeft, marginTop)

		f.SetFont("Helvetica", "", 8)
		f.SetTextColor(mutedText[0], mutedText[1], mutedText[2])
		f.Cell(0, 4.5, tr(orgName))
		f.Ln(6)

		f.SetFont("Helvetica", "B", 15)
		f.SetTextColor(titleText[0], titleText[1], titleText[2])
		f.Cell(0, 8, tr(doc.Title))
		f.Ln(9)

		if doc.Subtitle != "" {
			f.SetFont("Helvetica", "", 10)
			f.SetTextColor(mutedText[0], mutedText[1], mutedText[2])
			f.Cell(0, 5, tr(doc.Subtitle))
			f.Ln(6)
		}

		if len(doc.Filters) > 0 {
			f.SetFont("Helvetica", "I", 8)
			f.SetTextColor(mutedText[0], mutedText[1], mutedText[2])
			f.Cell(0, 4.5, tr(strings.Join(doc.Filters, "   |   ")))
			f.Ln(5.5)
		}

		f.SetDrawColor(lineColor[0], lineColor[1], lineColor[2])
		f.SetLineWidth(0.3)
		f.Line(marginLeft, f.GetY(), rightEdge, f.GetY())
		f.Ln(4)
	})

	f.SetFooterFunc(func() {
		f.SetY(footerAtTop)
		f.SetDrawColor(lineColor[0], lineColor[1], lineColor[2])
		f.SetLineWidth(0.3)
		f.Line(marginLeft, f.GetY(), rightEdge, f.GetY())
		f.Ln(2)

		usable := pageWidth - marginLeft - marginRight
		f.SetFont("Helvetica", "", 7.5)
		f.SetTextColor(mutedText[0], mutedText[1], mutedText[2])
		f.CellFormat(usable/2, 4, tr(ui.generated+generatedAt), "", 0, "L", false, 0, "")
		f.CellFormat(usable/2, 4, tr(ui.pagePrefix+strconv.Itoa(f.PageNo())+ui.pageSuffix), "", 0, "R", false, 0, "")
	})

	f.AddPage()

	widths := columnWidths(f, doc.Columns)
	f.SetFont("Helvetica", "", fontSize)
	drawHeaderRow(f, doc.Columns, widths, tr)

	if len(doc.Rows) == 0 {
		msg := doc.EmptyMsg
		if msg == "" {
			msg = ui.empty
		}
		drawEmptyRow(f, widths, msg, tr)
	}

	maxY := 297.0 - marginBottom
	for i, row := range doc.Rows {
		h := measureRow(f, widths, row, tr)
		if f.GetY()+h > maxY {
			f.AddPage()
			f.SetFont("Helvetica", "", fontSize)
			drawHeaderRow(f, doc.Columns, widths, tr)
		}
		drawRow(f, doc.Columns, widths, row, i%2 == 1, tr)
	}

	if f.Error() != nil {
		return f.Error()
	}
	return f.Output(w)
}

func columnWidths(f *fpdf.Fpdf, cols []Column) []float64 {
	pageWidth, _ := f.GetPageSize()
	usable := pageWidth - marginLeft - marginRight

	total := 0.0
	for _, col := range cols {
		total += col.Weight
	}
	if total <= 0 {
		total = float64(len(cols))
	}

	widths := make([]float64, len(cols))
	for i, col := range cols {
		weight := col.Weight
		if weight <= 0 {
			weight = 1
		}
		widths[i] = usable * weight / total
	}
	return widths
}

func splitCell(f *fpdf.Fpdf, text string, colWidth float64) [][]byte {
	inner := colWidth - 2*cellPadX
	if inner < minInnerW {
		inner = minInnerW
	}
	if text == "" {
		return [][]byte{{}}
	}
	return f.SplitLines([]byte(text), inner)
}

func measureRow(f *fpdf.Fpdf, widths []float64, cells []string, tr func(string) string) float64 {
	maxLines := 1
	for i, cell := range cells {
		if i >= len(widths) {
			break
		}
		lines := splitCell(f, tr(cell), widths[i])
		if len(lines) > maxLines {
			maxLines = len(lines)
		}
	}
	return float64(maxLines)*lineHeight + 2*cellPadY
}

func drawHeaderRow(f *fpdf.Fpdf, cols []Column, widths []float64, tr func(string) string) {
	x0, y0 := f.GetX(), f.GetY()

	f.SetFont("Helvetica", "B", fontSize)

	titles := make([][]string, len(cols))
	maxLines := 1
	for i, col := range cols {
		lines := splitCell(f, tr(col.Title), widths[i])
		title := make([]string, 0, len(lines))
		for _, line := range lines {
			title = append(title, string(line))
		}
		titles[i] = title
		if len(title) > maxLines {
			maxLines = len(title)
		}
	}
	h := float64(maxLines)*lineHeight + 2*cellPadY

	f.SetFillColor(headerFill[0], headerFill[1], headerFill[2])
	f.SetTextColor(whiteText[0], whiteText[1], whiteText[2])
	f.SetDrawColor(accentLine[0], accentLine[1], accentLine[2])
	f.SetLineWidth(0.4)

	x := x0
	for i, col := range cols {
		w := widths[i]
		f.SetXY(x, y0)
		inner := w - 2*cellPadX
		if inner < minInnerW {
			inner = minInnerW
		}
		f.CellFormat(w, h, "", "B", 0, "L", true, 0, "")
		ty := y0 + cellPadY
		for _, line := range titles[i] {
			f.SetXY(x+cellPadX, ty)
			f.CellFormat(inner, lineHeight, line, "", 0, string(col.Align), false, 0, "")
			ty += lineHeight
		}
		x += w
	}

	f.SetXY(x0, y0+h)
	f.SetFont("Helvetica", "", fontSize)
	f.SetTextColor(titleText[0], titleText[1], titleText[2])
	f.SetDrawColor(lineColor[0], lineColor[1], lineColor[2])
	f.SetLineWidth(0.2)
}

func drawRow(f *fpdf.Fpdf, cols []Column, widths []float64, cells []string, zebraOn bool, tr func(string) string) {
	x0, y0 := f.GetX(), f.GetY()
	h := measureRow(f, widths, cells, tr)

	f.SetDrawColor(lineColor[0], lineColor[1], lineColor[2])
	f.SetLineWidth(0.2)
	if zebraOn {
		f.SetFillColor(zebraFill[0], zebraFill[1], zebraFill[2])
	}

	x := x0
	for i := range cells {
		if i >= len(widths) {
			break
		}
		f.SetXY(x, y0)
		f.CellFormat(widths[i], h, "", "B", 0, "L", zebraOn, 0, "")
		x += widths[i]
	}

	f.SetTextColor(titleText[0], titleText[1], titleText[2])
	x = x0
	for i, cell := range cells {
		if i >= len(widths) {
			break
		}
		w := widths[i]
		inner := w - 2*cellPadX
		if inner < minInnerW {
			inner = minInnerW
		}
		lines := splitCell(f, tr(cell), w)
		ty := y0 + cellPadY
		for _, line := range lines {
			f.SetXY(x+cellPadX, ty)
			f.CellFormat(inner, lineHeight, string(line), "", 0, string(cols[i].Align), false, 0, "")
			ty += lineHeight
		}
		x += w
	}

	f.SetXY(x0, y0+h)
}

func drawEmptyRow(f *fpdf.Fpdf, widths []float64, msg string, tr func(string) string) {
	x0, y0 := f.GetX(), f.GetY()
	total := 0.0
	for _, w := range widths {
		total += w
	}

	f.SetFont("Helvetica", "I", fontSize)
	f.SetFillColor(emptyFill[0], emptyFill[1], emptyFill[2])
	f.SetTextColor(mutedText[0], mutedText[1], mutedText[2])
	f.SetDrawColor(lineColor[0], lineColor[1], lineColor[2])
	f.SetLineWidth(0.2)
	f.SetXY(x0, y0)
	f.CellFormat(total, emptyRowH, tr(msg), "B", 1, "C", true, 0, "")

	f.SetFont("Helvetica", "", fontSize)
	f.SetTextColor(titleText[0], titleText[1], titleText[2])
}
