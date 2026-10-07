package pdf

import (
	"bytes"
	"strings"
	"testing"
)

func sampleDocument(rows int) Document {
	doc := Document{
		Title:    "Tabla de Posiciones",
		Subtitle: "Liga Nacional de Fútbol",
		Filters:  []string{"Temporada: 05/01/2025 - 30/11/2025"},
		Columns: []Column{
			{Title: "#", Weight: 6, Align: AlignCenter},
			{Title: "Equipo", Weight: 64, Align: AlignLeft},
			{Title: "Puntos", Weight: 12, Align: AlignRight},
		},
	}
	for i := 0; i < rows; i++ {
		doc.Rows = append(doc.Rows, []string{"1", "Equipo de Prueba", "3"})
	}
	return doc
}

func TestRenderProducesValidPDF(t *testing.T) {
	var buf bytes.Buffer
	if err := Render(&buf, sampleDocument(3)); err != nil {
		t.Fatalf("Render returned an error: %v", err)
	}

	content := buf.String()
	if !strings.HasPrefix(content, "%PDF-") {
		t.Fatalf("expected a PDF header, got %q", content[:8])
	}
	if !strings.Contains(content, "%%EOF") {
		t.Fatal("expected a PDF EOF marker")
	}
}

func TestRenderPaginatesLongTables(t *testing.T) {
	var buf bytes.Buffer
	if err := Render(&buf, sampleDocument(80)); err != nil {
		t.Fatalf("Render returned an error: %v", err)
	}

	pages := strings.Count(buf.String(), "/Type /Page")
	if pages < 2 {
		t.Fatalf("expected the table to span at least 2 pages, got %d", pages)
	}
}

func TestRenderEmptyRows(t *testing.T) {
	doc := sampleDocument(0)
	doc.Rows = nil

	var buf bytes.Buffer
	if err := Render(&buf, doc); err != nil {
		t.Fatalf("Render returned an error: %v", err)
	}
	if !strings.HasPrefix(buf.String(), "%PDF-") {
		t.Fatal("expected a PDF header for an empty report")
	}
}

func TestRenderRejectsDocumentWithoutColumns(t *testing.T) {
	var buf bytes.Buffer
	if err := Render(&buf, Document{Title: "Sin columnas"}); err == nil {
		t.Fatal("expected an error for a document without columns")
	}
}
