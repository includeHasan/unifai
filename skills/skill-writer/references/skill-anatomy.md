# Skill Anatomy

Complete reference for skill directory structure and file types.

---

## Directory Structure

```
skill-name/
├── SKILL.md (REQUIRED)
│   ├── YAML frontmatter (REQUIRED)
│   │   ├── name: (REQUIRED)
│   │   └── description: (REQUIRED)
│   └── Markdown instructions (REQUIRED)
└── Bundled Resources (OPTIONAL)
    ├── scripts/          - Executable code
    ├── references/       - Documentation
    └── assets/           - Files for output
```

---

## SKILL.md (Required)

Every skill must have a SKILL.md file with two parts:

### 1. Frontmatter (YAML)

```yaml
---
name: skill-name
description: What it does and when to use it.
---
```

**Name field:**
- Lowercase letters, numbers, hyphens only
- Must match directory name
- Max 64 characters

**Good:** `pdf-processor`, `git-commit-helper`, `data-validator`
**Bad:** `PDF_Processor`, `Git Commits!`, `MySkill`

**Description field:**
- Include BOTH what the skill does AND when to trigger it
- Use specific trigger words and contexts
- Max 1024 characters
- This is the PRIMARY triggering mechanism

**Good description:**
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. 
  Use when working with PDF files or when the user mentions PDFs, forms, 
  document extraction, or needs to manipulate .pdf files.
```

**Bad description:**
```yaml
description: Helps with documents
```

### 2. Body (Markdown)

Instructions and guidance for using the skill:
- Only loaded AFTER the skill triggers
- Keep under 500 lines
- Use imperative form ("Run the script" not "You should run the script")
- Reference bundled resources clearly

---

## Bundled Resources (Optional)

### scripts/ Directory

**Purpose:** Executable code for deterministic tasks.

**When to include:**
- Same code is being rewritten repeatedly
- Deterministic reliability is needed
- Complex operations that are error-prone

**Examples:**
- `scripts/validate_data.py`
- `scripts/rotate_pdf.py`
- `scripts/transform.sh`

**Benefits:**
- Token efficient (execute without loading into context)
- Deterministic results
- Reusable across invocations

**Note:** Scripts may still need to be read by Claude for patching or environment-specific adjustments.

---

### references/ Directory

**Purpose:** Documentation to inform Claude's process and thinking.

**When to include:**
- Documentation Claude should reference while working
- Large content that shouldn't bloat SKILL.md
- Domain-specific knowledge

**Examples:**
- `references/schema.md` - Database schemas
- `references/api_docs.md` - API specifications
- `references/policies.md` - Company policies
- `references/templates.md` - Output templates

**Best practices:**
- If files are large (>10k words), include grep search patterns in SKILL.md
- Information should live in EITHER SKILL.md OR references, not both
- Keep SKILL.md lean, load references only when needed

---

### assets/ Directory

**Purpose:** Files used in output, not loaded into context.

**When to include:**
- Files that will be used in the final output
- Templates to copy or modify
- Binary files (images, fonts, etc.)

**Examples:**
- `assets/logo.png` - Brand assets
- `assets/template.pptx` - PowerPoint templates
- `assets/frontend-template/` - Boilerplate code
- `assets/font.ttf` - Typography

**Benefits:**
- Separates output resources from documentation
- Claude can use files without loading them into context
- Keeps token usage efficient

---

## Resource Selection Guide

| Scenario | Resource Type | Example |
|----------|---------------|---------|
| Same code rewritten repeatedly | scripts/ | `rotate_pdf.py` |
| Need deterministic reliability | scripts/ | `validate_schema.py` |
| Documentation for reference | references/ | `api_docs.md` |
| Large schema definitions | references/ | `database_schema.md` |
| Business logic/policies | references/ | `approval_workflow.md` |
| Images for output | assets/ | `logo.png` |
| File templates | assets/ | `report_template.docx` |
| Boilerplate code | assets/ | `starter-app/` |

---

## What NOT to Include

A skill should only contain essential files. Do NOT create:

- `README.md` (in the skill itself)
- `INSTALLATION_GUIDE.md`
- `QUICK_REFERENCE.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- Test files or dev dependencies

**The skill should only contain information needed for an AI agent to do the job.**

It should NOT contain:
- Process documentation about creating the skill
- Setup and testing procedures
- User-facing documentation
- Changelog or version history
