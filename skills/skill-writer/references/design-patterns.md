# Design Patterns for Skills

Proven patterns for structuring skill workflows and outputs.

---

## Workflow Patterns

### Pattern 1: Sequential Workflow

Use when tasks follow a fixed sequence.

```markdown
## Process

Creating a report involves these steps:

1. Validate input data (run validate.py)
2. Query the database (run query.py)
3. Generate visualizations (run charts.py)
4. Compile report (run compile.py)
5. Export to PDF (run export.py)
```

**Characteristics:**
- Clear numbered steps
- Each step depends on previous
- Script references for each step
- Easy to follow and debug

---

### Pattern 2: Conditional Workflow

Use when different paths apply to different situations.

```markdown
## Process

1. Determine the task type:
   - **Creating new content?** → Follow "Creation Workflow" below
   - **Editing existing content?** → Follow "Editing Workflow" below
   - **Reviewing content?** → Follow "Review Workflow" below

## Creation Workflow
1. Initialize template
2. Fill required sections
3. Add optional sections
4. Validate and save

## Editing Workflow
1. Load existing document
2. Apply requested changes
3. Preserve formatting
4. Validate and save

## Review Workflow
1. Load document
2. Check against guidelines
3. Generate feedback report
```

**Characteristics:**
- Decision point upfront
- Clearly labeled branches
- Each branch is self-contained

---

### Pattern 3: Iterative Workflow

Use when tasks require refinement cycles.

```markdown
## Process

1. Generate initial output
2. Validate against requirements
3. If validation fails:
   - Identify issues
   - Apply corrections
   - Return to step 2
4. If validation passes:
   - Finalize output
   - Generate report
```

**Characteristics:**
- Clear loop structure
- Exit conditions defined
- Progress tracking possible

---

## Output Patterns

### Pattern 1: Template Pattern (Strict Requirements)

Use when output must follow an exact structure.

```markdown
## Report Structure

ALWAYS use this exact template:

# [Analysis Title]

## Executive Summary
[One-paragraph overview of key findings]

## Key Findings
- Finding 1 with supporting data
- Finding 2 with supporting data
- Finding 3 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation

## Appendix
[Supporting data and methodology]
```

**When to use:**
- Compliance requirements
- Brand consistency
- Structured data exchange

---

### Pattern 2: Examples Pattern

Use when output style is important but flexible.

```markdown
## Commit Message Format

Generate commit messages following these examples:

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
feat(auth): implement JWT-based authentication
Add login endpoint and token validation middleware

**Example 2:**
Input: Fixed bug where dates displayed incorrectly
Output:
fix(reports): correct date formatting in timezone conversion
Use UTC timestamps consistently across report generation

**Example 3:**
Input: Updated dependencies to latest versions
Output:
chore(deps): update dependencies to latest versions
Update React to 18.2.0 and TypeScript to 5.0

Follow this style: type(scope): brief description, then detailed explanation.
```

**When to use:**
- Style guidelines
- Writing conventions
- Format preferences

---

### Pattern 3: Schema Pattern

Use when output must conform to a data structure.

```markdown
## API Response Format

All responses must match this schema:

```json
{
  "status": "success" | "error",
  "data": {
    // Response-specific fields
  },
  "metadata": {
    "timestamp": "ISO-8601 datetime",
    "requestId": "UUID string",
    "version": "API version"
  },
  "errors": [
    {
      "code": "ERROR_CODE",
      "message": "Human readable message",
      "field": "optional field name"
    }
  ]
}
```

**Required fields:**
- `status`: Always present
- `metadata`: Always present
- `data`: Present when status is "success"
- `errors`: Present when status is "error"
```

**When to use:**
- API design
- Data transformation
- System integration

---

## Progressive Disclosure Pattern

### Level 1: Quick Start in SKILL.md

```markdown
# PDF Processing

## Quick Start

Extract text with pdfplumber:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## Advanced Features

- **Form filling**: See [references/forms.md](references/forms.md)
- **Table extraction**: See [references/tables.md](references/tables.md)
- **Image extraction**: See [references/images.md](references/images.md)
```

### Level 2: Detailed Guides in references/

```markdown
# Complete Form Filling Guide

## Prerequisites
- pdfplumber installed
- PDF with fillable fields

## Step-by-Step Process

### 1. Analyze Form Structure
[Detailed instructions...]

### 2. Map Field Names
[Detailed instructions...]

### 3. Fill Fields
[Detailed instructions with code...]

### 4. Validate Output
[Detailed instructions...]

## Common Issues
[Troubleshooting guide...]
```

**Benefits:**
- SKILL.md stays concise
- Details load only when needed
- Easy to maintain and update

---

## Navigation Pattern

Use when a skill supports many capabilities.

```markdown
## Capabilities

| Task | See |
|------|-----|
| Basic text extraction | Quick Start above |
| Form filling | [references/forms.md](references/forms.md) |
| Table extraction | [references/tables.md](references/tables.md) |
| Image extraction | [references/images.md](references/images.md) |
| Merge PDFs | [references/merge.md](references/merge.md) |
| Split PDFs | [references/split.md](references/split.md) |

## Scripts

| Script | Purpose |
|--------|---------|
| `analyze.py` | Get PDF structure and metadata |
| `extract.py` | Extract text/tables/images |
| `fill.py` | Fill form fields |
| `merge.py` | Combine multiple PDFs |
```

**Benefits:**
- Quick navigation
- Clear capability overview
- Easy to find specific features
