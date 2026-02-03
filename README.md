# Assessment Generator

A modular system for creating, parsing, and rendering educational assessment questions.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HTML Tools                                      │
├─────────────────────────────────┬───────────────────────────────────────────┤
│   assessment-authoring-tool     │      assessment-selection-tool            │
│   - Question creation/editing   │      - Question bank browsing             │
│   - Rich text editing           │      - Assessment assembly                │
│   - Image upload & resize       │      - Print preview                      │
│   - JSON import/export          │      - PDF export                         │
│   - Preview font controls       │                                           │
│   - Metadata validation         │                                           │
└───────────────┬─────────────────┴───────────────────┬───────────────────────┘
                │                                     │
                ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Shared JavaScript Modules                          │
├────────────────────┬────────────────────────┬───────────────────────────────┤
│ question-parser.js │ question-renderer.js   │   question-preview.js         │
│ - JSON/JSONL parse │ - HTML rendering       │   - Container preview         │
│ - Schema validate  │ - Rich text format     │   - Style application         │
│ - Image utilities  │ - Type renderers       │   - Shared preview API        │
└────────────────────┴────────────────────────┴───────────────────────────────┘
                │                 │                        │
                ▼                 ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CDN Dependencies                                   │
├─────────────────────────────────┬───────────────────────────────────────────┤
│           KaTeX                 │              marked.js                     │
│     (LaTeX math rendering)      │         (Markdown parsing)                 │
└─────────────────────────────────┴───────────────────────────────────────────┘
```

---

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        AUTHORING TOOL                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ File Import │  │   Editor    │  │   Preview   │  │   Export    │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
└─────────┼────────────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
   ┌──────────────┐ ┌──────────────┐ ┌────────────────┐ ┌──────────────┐
   │ parseJson│ │createEmpty   │ │renderPreviewTo │ │prepareFor    │
   │     ()       │ │  Question()  │ │  Container()   │ │  Export()    │
   └──────┬───────┘ └──────────────┘ └───────┬────────┘ └──────────────┘
          │                                  │
          │   question-parser.js             │   question-preview.js
          │                                  │
          ▼                                  ▼
   ┌──────────────┐                  ┌───────────────┐
   │validateAnd   │                  │renderQuestion │
   │ Normalize()  │                  │    HTML()     │
   └──────────────┘                  └───────┬───────┘
                                             │   question-renderer.js
                                             ▼
                                      ┌──────────────┐
                                      │formatRichText│──────┐
                                      │     ()       │      │
                                      └──────────────┘      │
                                             │              │
                                             ▼              ▼
                                      ┌────────────┐ ┌────────────┐
                                      │ KaTeX      │ │ marked.js  │
                                      │ (Math)     │ │ (Markdown) │
                                      └────────────┘ └────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                        SELECTION TOOL                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │Question Bank│  │  Selection  │  │ A4 Preview  │  │ PDF Export  │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
└─────────┼────────────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
   ┌──────────────────────────────────────────────────────────────┐
   │              renderPreviewToContainer()                       │
   │                question-preview.js                            │
   │                        │                                      │
   │                        ▼                                      │
   │               renderQuestionHTML()                            │
   │              question-renderer.js                             │
   └──────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
                              ┌─────────────────┐
                              │  JSON/JSONL     │
                              │  File Input     │
                              └────────┬────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           question-parser.js                                 │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │  parseJson  │───►│validateAndNormal │───►│  ensureDefaults  │       │
│  │                  │    │      ize         │    │                  │       │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Question[]     │
                              │  (v5.1 schema)  │
                              └────────┬────────┘
                                       │
              ┌────────────────────────┴────────────────────────┐
              │                                                 │
              ▼                                                 ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     question-renderer.js      │             │       Export / Save           │
│                               │             │                               │
│     renderQuestionHTML()      │             │     prepareForExport()        │
│             │                 │             │             │                 │
│             ▼                 │             │             ▼                 │
│       HTML Preview            │             │       Clean JSON              │
└───────────────────────────────┘             └───────────────────────────────┘
```

---

## Question Type Rendering Flow

```
                         renderQuestionHTML(question)
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
          ┌─────────────────┐             ┌─────────────────┐
          │  Main Content   │             │  Type-Specific  │
          │  Rendering      │             │  Rendering      │
          └────────┬────────┘             └────────┬────────┘
                   │                               │
                   ▼                               │
          formatRichText()                         │
                   │                               │
     ┌─────────────┼─────────────┐                │
     │             │             │                │
     ▼             ▼             ▼                │
┌─────────┐ ┌───────────┐ ┌───────────┐          │
│[[image]]│ │  [[gap]]  │ │  $math$   │          │
│ tokens  │ │  tokens   │ │  LaTeX    │          │
└─────────┘ └───────────┘ └───────────┘          │
                                                  │
           ┌──────────────────────────────────────┘
           │
           ▼
    ┌──────┴──────┬──────────┬──────────┬──────────┬───────────┐
    │             │          │          │          │           │
    ▼             ▼          ▼          ▼          ▼           ▼
┌───────┐   ┌─────────┐ ┌─────────┐ ┌───────┐ ┌─────────┐ ┌──────────┐
│  MCQ  │   │   FIB   │ │  MATCH  │ │ TABLE │ │SUBJECTIVE│ │COMPOSITE │
│       │   │         │ │         │ │       │ │         │ │          │
│Options│   │Word Bank│ │ Pairs   │ │ Grid  │ │ (none)  │ │Sub-Qs    │
└───────┘   └─────────┘ └─────────┘ └───────┘ └─────────┘ └────┬─────┘
                                                               │
                                                               ▼
                                                    ┌─────────────────┐
                                                    │  Recursive call │
                                                    │  to type render │
                                                    └─────────────────┘
```

**Note:** MATCH type renders pairs without numbering (Column A and Column B show text only).

---

## Shared Preview Pattern

Both tools use `question-preview.js` for rendering, which wraps `question-renderer.js`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         question-preview.js                                  │
│                                                                             │
│   renderPreviewToContainer(question, container, options)                     │
│                                                                             │
│   Options accepted:                                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  imageResolver: (imageId) => url    ← How to resolve image URLs     │   │
│   │  interactive: boolean               ← Enable resize handles         │   │
│   │  questionNumber: string             ← Display number prefix         │   │
│   │  showMarks: boolean                 ← Show marks badge              │   │
│   │  fontFamily: string                 ← Override font (e.g. Times New) │   │
│   │  fontSize: string                   ← Override font size (e.g. 13pt)│   │
│   │  lineHeight: number                 ← Override line height          │   │
│   │  applyContainerStyles: boolean      ← Apply font styles to container│   │
│   │  wrapperClass: string               ← CSS class for wrapper div     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Internally calls: renderQuestionHTML() from question-renderer.js          │
└─────────────────────────────────────────────────────────────────────────────┘
                    ▲                               ▲
                    │                               │
        ┌───────────┴───────────┐       ┌──────────┴──────────┐
        │    AUTHORING TOOL     │       │   SELECTION TOOL    │
        │                       │       │                     │
        │  renderPreviewTo      │       │  renderPreviewTo    │
        │    Container(q,       │       │    Container(q,     │
        │    container, {       │       │    container, {     │
        │      imageResolver:   │       │      imageResolver: │
        │        (id) =>        │       │        (id) => null,│
        │        uploadedImages │       │      showMarks: true│
        │        [id],          │       │    });              │
        │      interactive:true │       │                     │
        │    });                │       │                     │
        └───────────────────────┘       └─────────────────────┘
```

### How It Works

1. **Both tools import the preview module:**
   ```html
   <script src="question-renderer.js"></script>
   <script src="question-preview.js"></script>
   ```

2. **Authoring Tool** has local image uploads and interactive resize:
   ```javascript
   renderPreviewToContainer(question, container, {
       imageResolver: (imageId) => uploadedImages[imageId],
       interactive: true,  // Enable drag-to-resize
       questionNumber: question.id
   });
   ```

3. **Selection Tool** has no local images:
   ```javascript
   renderPreviewToContainer(question, container, {
       imageResolver: (imageId) => null,
       questionNumber: '1',
       showMarks: true
   });
   ```

This **dependency injection** pattern allows the same preview code to work in both tools while each tool controls its own data sources and features.

### Authoring Tool Preview Features

- **Preview toolbar**: Font (Times New Roman, read-only), Size (8–24pt), Line Height (1.0–2.5)
- **Pool/SubPool logic**: When Pool = Practice, SubPool is forced to NA; when Pool = Exam, user can choose Written or Oral (Written default)
- **End-of-question separator**: A visual dotted line (`- - - - - end of question - - - - -`) appears at the end of each question in preview to indicate answer space (not stored in JSON)

---

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│    assessment-authoring-tool.html        assessment-selection-tool.html     │
│              │                                      │                       │
│              │ imports                              │ imports               │
│              ▼                                      ▼                       │
│    ┌─────────────────────────────────────────────────────────────┐         │
│    │                    question-parser.js                        │         │
│    │  • parseJson      • validateAndNormalize                │         │
│    │  • createEmptyQuestion • extractImageTags                    │         │
│    │  • validateQuestion    • prepareForExport                    │         │
│    └─────────────────────────────────────────────────────────────┘         │
│              │                                      │                       │
│              │ imports                              │ imports               │
│              ▼                                      ▼                       │
│    ┌─────────────────────────────────────────────────────────────┐         │
│    │                   question-renderer.js                       │         │
│    │  • renderQuestionHTML  • formatRichText                      │         │
│    │  • renderMCQPreview    • renderWordBankPreview               │         │
│    │  • renderMatchPreview  • renderTablePreview                  │         │
│    │  • renderCompositePreview                                    │         │
│    └─────────────────────────────────────────────────────────────┘         │
│              │                                      │                       │
│              │ imports                              │ imports               │
│              ▼                                      ▼                       │
│    ┌─────────────────────────────────────────────────────────────┐         │
│    │                   question-preview.js                        │         │
│    │  • renderPreviewToContainer  • renderPreviewHTML             │         │
│    │  • applyPreviewStyles        • getPreviewDefaults            │         │
│    └─────────────────────────────────────────────────────────────┘         │
│              │                                                              │
│              │ depends on                                                   │
│              ▼                                                              │
│    ┌──────────────────┐    ┌──────────────────┐                            │
│    │      KaTeX       │    │    marked.js     │                            │
│    │  (CDN loaded)    │    │   (CDN loaded)   │                            │
│    └──────────────────┘    └──────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Layout and Style

Layout configuration is **embedded directly in the question JSON** under `data.style`. No separate layout module is needed.

### Style Properties (in `data.style`)

| Property | Type | Description |
|----------|------|-------------|
| `options_layout` | `"vertical"` \| `"horizontal"` | MCQ/FIB options layout |
| `sub_questions_layout` | `"vertical"` \| `"horizontal"` | COMPOSITE sub-question layout |
| `image_layout` | `"vertical"` \| `"horizontal"` | Image positioning relative to content |
| `table_grid_lines` | `"all"` \| `"none"` \| `"outer_only"` \| `"horizontal_only"` | TABLE borders |
| `hide_header` | boolean | Hide TABLE header row |
| `column_widths` | string[] | TABLE column width percentages |
| `font_family` | string | Font family (default: "Times New Roman", serif) |
| `font_size` | string | Font size (default: "13pt") |
| `line_height` | string | Line height (default: "1.5") |

### Example Question with Style

```javascript
{
  "id": "Q1",
  "metadata": {
    "grade": "3",
    "subject": "Maths",
    "chapter": 1,
    "section": "A",
    "difficulty": "Medium",
    "marks": 2,
    "pool": "Practice",
    "subpool": "NA"
  },
  "type": "MCQ",
  "data": {
    "content": "What is 2 + 2?",
    "options": [
      { "id": "A", "text": "3" },
      { "id": "B", "text": "4" }
    ],
    "style": {
      "options_layout": "horizontal",
      "font_family": "Times New Roman, serif",
      "font_size": "13pt"
    }
  }
}
```

---

## Schema Version

All modules use **v5.1 schema**. See `schema.json` for the complete specification.

### Question Structure (v5.1)

```javascript
{
  "id": "Q1",
  "metadata": { grade, subject, chapter, section, difficulty, marks, pool, subpool },
  "type": "MCQ" | "FIB" | "MATCH" | "SUBJECTIVE" | "TABLE" | "COMPOSITE",
  "data": { content, style, ...type-specific fields },
  "solution": { text }
}
```

### Metadata Field Constraints

| Field | Allowed Values | Default |
|-------|----------------|---------|
| `grade` | `"Nursery"` \| `"LKG"` \| `"UKG"` \| `"1"` \| `"2"` \| `"3"` \| `"4"` \| `"5"` | `"Nursery"` |
| `subject` | `"Maths"` \| `"English"` \| `"EVS"` | `"Maths"` |
| `chapter` | integer ≥ 0 | `0` |
| `section` | `"A"` \| `"B"` \| `"C"` \| `"D"` | `"A"` |
| `marks` | integer ≥ 1 | `1` |
| `pool` | `"Practice"` \| `"Exam"` | `"Practice"` |
| `subpool` | `"NA"` (when pool=Practice) \| `"Written"` \| `"Oral"` (when pool=Exam) | `"NA"` |

---

## Module Reference

### 1. `question-parser.js` - Parsing & Validation

Handles JSON/JSONL parsing and schema validation.

| Function | Description | Called By |
|----------|-------------|-----------|
| `parseJson(content)` | Parse JSON/JSONL into question array | Authoring Tool (file import) |
| `validateAndNormalize(obj)` | Validate v5.1 schema, apply defaults | `parseJson()` |
| `createEmptyQuestion(type)` | Create new question with defaults | Authoring Tool (new question) |
| `validateQuestion(q)` | Validate question structure | Authoring Tool (before export) |
| `prepareForExport(q)` | Clean question for JSON export | Authoring Tool (export) |
| `extractImageTags(question)` | Find all `[[image:tag]]` tokens | Authoring Tool (image management) |
| `traverseAllRichText(q, fn)` | Visit all RichText fields | Image resolution utilities |
| `getStyleForType(type)` | Get default style for question type | `ensureDefaults()` |
| `getDefaultDataForType(type)` | Get default data structure | `createEmptyQuestion()` |
| `getTypeDisplayName(type)` | Human-readable type name | UI display |

### 2. `question-renderer.js` - HTML Rendering

Renders questions as HTML for preview display.

| Function | Description | Called By |
|----------|-------------|-----------|
| `renderQuestionHTML(q, options)` | **Main entry** - renders complete question | `question-preview.js` |
| `formatRichText(text, options)` | Process RichText (images, gaps, math, markdown) | All renderers |
| `renderLatexMath(text)` | KaTeX math rendering (`$...$`, `$$...$$`) | `formatRichText()` |
| `renderMarkdown(text)` | Markdown to HTML | `formatRichText()` |
| `parseImageTag(tagContent)` | Parse `[[image:id\|height:H\|width:W]]` | `formatRichText()` |
| `renderMCQPreview(data, opts)` | Render MCQ options | `renderQuestionHTML()` |
| `renderWordBankPreview(optionsPool)` | Render word bank for COMPOSITE | `renderQuestionHTML()` |
| `renderMatchPreview(data, opts)` | Render MATCH pairs | `renderQuestionHTML()` |
| `renderTablePreview(data, opts)` | Render TABLE grid | `renderQuestionHTML()` |
| `renderCompositePreview(data, opts)` | Render COMPOSITE sub-questions | `renderQuestionHTML()` |
| `getCellBorderStyle(...)` | Table cell border styling | `renderTablePreview()` |

### 3. `question-preview.js` - Preview Container

High-level preview API that both tools use for rendering into DOM containers.

| Function | Description | Called By |
|----------|-------------|-----------|
| `renderPreviewToContainer(q, container, opts)` | **Main entry** - render to DOM element | Both tools (preview) |
| `renderPreviewHTML(q, options)` | Render to HTML string (no container) | Custom integrations |
| `applyPreviewStyles(container, q)` | Apply font styles without rendering | Utilities |
| `getPreviewDefaults()` | Get default font settings | Internal |

---

## Function Call Flow

### Importing Questions (Authoring Tool)

```
User uploads JSON/JSONL file
         │
         ▼
   parseJson(content)
         │
         ├──► validateAndNormalize(obj)  [for each question]
         │           │
         │           └──► ensureDefaults(obj)
         │                      │
         │                      ├──► getStyleForType(type)
         │                      └──► getDefaultDataForType(type)
         │
         ▼
   Questions array ready for editing
```

### Rendering Preview (Both Tools)

```
   renderQuestionHTML(question, options)
         │
         ├──► formatRichText(mainContent, options)
         │           │
         │           ├──► parseImageTag(tag)      [for [[image:...]] tokens]
         │           ├──► Handle [[gap]] tokens
         │           ├──► Handle ______ blanks
         │           ├──► renderLatexMath(text)   [for $...$ and $$...$$]
         │           └──► renderMarkdown(text)
         │
         └──► Type-specific renderer based on question.type:
                   │
                   ├── MCQ ──────► renderMCQPreview(data, opts)
                   ├── FIB ──────► (no additional rendering in v5.1)
                   ├── MATCH ────► renderMatchPreview(data, opts)
                   ├── TABLE ────► renderTablePreview(data, opts)
                   │                      └──► getCellBorderStyle(...)
                   └── COMPOSITE ► renderCompositePreview(data, opts)
                                          │
                                          ├──► renderWordBankPreview(data.options_pool)
                                          └──► Recursively calls type renderers for sub-questions
```

### Applying Layout/Style (Both Tools)

```
   question.data.style
         │
         ├──► font_family ──────► container.style.fontFamily
         ├──► font_size ────────► container.style.fontSize
         ├──► line_height ──────► container.style.lineHeight
         │
         └──► Type-specific style:
                   │
                   ├── options_layout ──────► MCQ/FIB option arrangement
                   ├── sub_questions_layout ► COMPOSITE sub-q arrangement
                   ├── table_grid_lines ────► TABLE border style
                   └── column_widths ───────► TABLE column sizing
```

---

## RichText Format

RichText strings support:

| Syntax | Renders As |
|--------|------------|
| `**bold**` | **bold** (Markdown) |
| `*italic*` | *italic* (Markdown) |
| `$x^2$` | Inline math (KaTeX) |
| `$$\frac{a}{b}$$` | Display math (KaTeX) |
| `[[image:id]]` | Image placeholder |
| `[[image:id\|height:50\|width:75]]` | Image with dimensions |
| `[[gap]]` | Fill-in-the-blank (60px default) |
| `[[gap\|width:100]]` | Fill-in-the-blank (100px) |
| `______` | Legacy blank (uniform styling) |

---

## Files

| File | Purpose |
|------|---------|
| `assessment-authoring-tool.html` | Question creation and editing UI |
| `assessment-selection-tool.html` | Question bank and assessment builder UI |
| `question-parser.js` | JSON parsing, validation, image utilities |
| `question-renderer.js` | HTML rendering for all question types |
| `question-preview.js` | Shared preview component for containers |
| `schema.json` | v5.1 JSON Schema specification |

---

## Dependencies

- **KaTeX** - LaTeX math rendering
- **marked.js** - Markdown parsing
- **html2pdf.js** - PDF generation (in HTML tools)
- **Tailwind CSS** - Styling (selection tool)
