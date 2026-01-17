# Skill Validation Checklist

Complete checklist to validate a skill before packaging and distribution.

---

## Pre-Packaging Validation

### Frontmatter ✓

- [ ] **name field present**
  - Lowercase letters, numbers, hyphens only
  - Matches directory name
  - Max 64 characters

- [ ] **description field present**
  - Under 1024 characters
  - Includes WHAT the skill does
  - Includes WHEN to use it (triggers)
  - Uses specific trigger words and contexts

- [ ] **No extra frontmatter fields**
  - Only `name` and `description` allowed
  - No `version`, `author`, `tags` in frontmatter

---

### SKILL.md Content ✓

- [ ] **Under 500 lines**
  - If longer, split content to references/

- [ ] **Only essential information**
  - No explanations Claude already knows
  - Each sentence justifies its token cost

- [ ] **Uses imperative form**
  - "Run the script" not "You should run the script"
  - "Validate the input" not "The input should be validated"

- [ ] **Clear resource references**
  - Links to scripts/ files
  - Links to references/ files
  - Links to assets/ files

- [ ] **Multi-step processes have overview**
  - Steps listed early in document
  - Clear sequence with script references

---

### Bundled Resources ✓

#### scripts/
- [ ] All scripts tested and working
- [ ] Error handling included
- [ ] No hardcoded paths or credentials
- [ ] Comments for non-obvious logic

#### references/
- [ ] Organized by domain/use case
- [ ] No duplication with SKILL.md content
- [ ] Large files (>10k words) have search guidance

#### assets/
- [ ] Only output-related files
- [ ] No documentation in assets
- [ ] Organized logically

---

### Structure ✓

- [ ] **No unnecessary files**
  - No README.md in skill directory
  - No CHANGELOG.md
  - No INSTALLATION.md
  - No CONTRIBUTING.md
  - No test files
  - No .git directory

- [ ] **No duplication**
  - Info in SKILL.md OR references, not both
  - Single source of truth for each topic

- [ ] **Appropriate freedom levels**
  - High freedom for flexible tasks
  - Low freedom for fragile operations
  - Medium freedom for configurable patterns

---

### Description Quality ✓

Run this mental test for the description:

1. **Trigger Test**: If a user says these phrases, will the skill trigger?
   - [ ] Primary use case phrase
   - [ ] Secondary use case phrase
   - [ ] File type if applicable (.pdf, .json, etc.)

2. **Clarity Test**: Does the description answer:
   - [ ] WHAT does this skill do?
   - [ ] WHEN should it be used?
   - [ ] WHAT types of requests trigger it?

3. **Specificity Test**:
   - [ ] Uses specific trigger words, not generic terms
   - [ ] Mentions specific file types if applicable
   - [ ] Lists specific operations or actions

---

## Example: Validated vs. Needs Work

### ❌ Needs Work

```yaml
---
name: DocumentHelper
description: Helps with documents
---

# Document Helper

## When to Use
Use when working with documents.

## Features
This skill can help you with many document tasks like editing,
creating, and managing documents. It supports various formats
and provides helpful utilities.
```

**Issues:**
- Name: Uses capitals
- Description: Too vague, no triggers
- Body: "When to Use" should be in description
- Body: Too generic, no specific guidance

### ✓ Validated

```yaml
---
name: document-helper
description: Create, edit, and analyze Word documents (.docx). Use when 
  working with contracts, reports, proposals, or any .docx file. Triggers 
  on requests for document creation, editing tracked changes, adding 
  comments, or extracting text from Word files.
---

# Document Helper

## Quick Start

Create a new document:
```python
from docx import Document
doc = Document()
doc.add_paragraph("Hello, World!")
doc.save("output.docx")
```

## Features

| Task | See |
|------|-----|
| Create documents | Quick Start above |
| Tracked changes | [references/tracking.md](references/tracking.md) |
| Comments | [references/comments.md](references/comments.md) |
| Formatting | [references/formatting.md](references/formatting.md) |
```

**Passing:**
- Name: lowercase, hyphenated
- Description: specific, includes triggers and file types
- Body: useful immediately, no fluff
- References: organized, linked clearly

---

## Final Validation Steps

1. **Read description aloud** - Does it clearly communicate what and when?

2. **Count SKILL.md lines** - Is it under 500?

3. **Run all scripts** - Do they work without errors?

4. **Check for duplicates** - Is any content in multiple files?

5. **Remove extras** - Are there any files Claude doesn't need?

Once all checks pass, the skill is ready for packaging.
