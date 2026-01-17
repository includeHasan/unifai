# Complete Guide to Creating Agent Skills

Comprehensive guide for AI agents to create high-quality Skills for any technology, language, or domain.

---

## Table of Contents

1. [Understanding Skills](#1-understanding-skills)
2. [Core Principles](#2-core-principles)
3. [Skill Anatomy](#3-skill-anatomy)
4. [The 6-Step Creation Process](#4-the-6-step-creation-process)
5. [Design Patterns](#5-design-patterns)
6. [Common Pitfalls](#6-common-pitfalls)
7. [Validation Checklist](#7-validation-checklist)
8. [Complete Examples](#8-complete-examples)

---

## 1. Understanding Skills

### What Skills Are

Skills are modular, self-contained packages that extend AI capabilities by providing:

- **Specialized workflows** - Multi-step procedures for specific domains
- **Tool integrations** - Instructions for working with file formats or APIs
- **Domain expertise** - Schemas, business logic, conventions
- **Bundled resources** - Scripts, references, assets for complex tasks

Think of skills as "onboarding guides" for specific domains—they transform a general-purpose AI into a specialized agent equipped with procedural knowledge.

### What Skills Are NOT

Skills themselves are **not tools**. They are orchestrators/knowledge bases that:

- Guide AI on HOW to use tools
- Provide specialized knowledge and workflows
- Define best practices for specific domains
- Bundle reusable resources

For skills to be useful, they need actual tools/data/APIs to work with.

---

## 2. Core Principles

### Principle 1: Concise is Key

**The context window is a public good.** Skills share context with:
- System prompt
- Conversation history
- Other skills' metadata
- The actual user request

**Default assumption:** Claude is already very smart. Only add context Claude doesn't already have.

**Challenge each piece of information:**
- "Does Claude really need this explanation?"
- "Does this paragraph justify its token cost?"
- "Can I show this with an example instead of explaining it?"

**Prefer examples over explanations:**

❌ Verbose:
```markdown
When processing user data, you should validate each field according 
to the schema. The validation process involves checking that required 
fields are present, that data types match the expected types, and that 
values fall within acceptable ranges.
```

✓ Concise:
```markdown
Validate fields against schema:
- Required fields present
- Types match
- Values in range
```

### Principle 2: Degrees of Freedom

Match the level of specificity to the task's fragility and variability.

| Freedom Level | Use When | Example |
|--------------|----------|---------|
| **High** (text) | Multiple approaches valid, context-dependent | "Analyze data and choose appropriate visualization" |
| **Medium** (pseudocode) | Preferred pattern exists, some variation OK | "Query data, apply template, format as [PDF\|HTML\|MD]" |
| **Low** (scripts) | Fragile operations, consistency critical | "Run validate.py, then transform.py, then output.py" |

**Mental model:** Think of Claude exploring a path:
- Narrow bridge with cliffs → Specific guardrails (low freedom)
- Open field → Many valid routes (high freedom)

### Principle 3: Progressive Disclosure

Skills use a three-level loading system:

| Level | Content | Loaded | Purpose |
|-------|---------|--------|---------|
| 1. Metadata | name + description (~100 words) | Always | Determines when skill triggers |
| 2. SKILL.md body | Instructions (<5k words) | When triggered | Core workflow, navigation |
| 3. Bundled resources | Scripts, refs, assets | As needed | Detailed information |

**Guidelines:**
- Keep SKILL.md under 500 lines
- Move details to references/ when approaching limit
- Core workflow in SKILL.md, specifics in references

---

## 3. Skill Anatomy

### Directory Structure

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

### SKILL.md

Every SKILL.md has two parts:

#### 1. Frontmatter (YAML)

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

✓ Good: `pdf-processor`, `git-commit-helper`
❌ Bad: `PDF_Processor`, `Git Commits!`

**Description field:**
- Include BOTH what the skill does AND when to trigger
- Max 1024 characters
- This is the PRIMARY triggering mechanism

✓ Good:
```yaml
description: Extract text and tables from PDF files, fill forms, 
  merge documents. Use when working with PDF files or when the user 
  mentions PDFs, forms, document extraction, or .pdf files.
```

❌ Bad:
```yaml
description: Helps with documents
```

#### 2. Body (Markdown)

- Only loaded AFTER skill triggers
- Keep under 500 lines
- Use imperative form
- Reference bundled resources clearly

### Bundled Resources

#### scripts/ Directory

**Purpose:** Executable code for deterministic tasks.

**When to include:**
- Same code rewritten repeatedly
- Deterministic reliability needed
- Complex, error-prone operations

**Examples:** `validate_data.py`, `rotate_pdf.py`, `transform.sh`

**Benefits:**
- Token efficient (execute without loading)
- Deterministic results
- Reusable across invocations

#### references/ Directory

**Purpose:** Documentation Claude should reference while working.

**When to include:**
- Large documentation that shouldn't bloat SKILL.md
- Domain-specific knowledge
- Detailed guides for specific features

**Examples:** `schema.md`, `api_docs.md`, `policies.md`

**Best practices:**
- For large files (>10k words), include search patterns in SKILL.md
- Info lives in EITHER SKILL.md OR references, not both

#### assets/ Directory

**Purpose:** Files used in output, not loaded into context.

**When to include:**
- Files for final output
- Templates to copy or modify
- Binary files (images, fonts)

**Examples:** `logo.png`, `template.pptx`, `frontend-template/`

### Resource Selection Guide

| Scenario | Resource | Example |
|----------|----------|---------|
| Same code repeated | scripts/ | `rotate_pdf.py` |
| Need determinism | scripts/ | `validate.py` |
| Reference docs | references/ | `api_docs.md` |
| Large schemas | references/ | `database.md` |
| Images for output | assets/ | `logo.png` |
| File templates | assets/ | `report.docx` |

### What NOT to Include

Do NOT create:
- README.md
- CHANGELOG.md
- INSTALLATION.md
- CONTRIBUTING.md
- Test files

**Only include what AI needs to do the job.**

---

## 4. The 6-Step Creation Process

### Step 1: Understanding with Concrete Examples

**Goal:** Understand concrete examples of skill usage.

**Process:**
1. Gather concrete examples
2. Ask clarifying questions:
   - "What functionality should it support?"
   - "How would it be used?"
   - "What triggers it?"

**Conclude when:** Clear sense of required functionality.

### Step 2: Planning Reusable Contents

**Goal:** Identify helpful reusable resources.

**For each example, analyze:**
- How to execute from scratch
- What scripts/references/assets would help

**Example analyses:**

| Query | Analysis | Resource |
|-------|----------|----------|
| "Rotate this PDF" | Same code each time | `scripts/rotate.py` |
| "Build me a todo app" | Same boilerplate needed | `assets/template/` |
| "Query user logins" | Need table schemas | `references/schema.md` |

**Outcome:** List of resources to include.

### Step 3: Initializing the Skill

**Goal:** Create directory structure.

```bash
mkdir skill-name
mkdir skill-name/scripts
mkdir skill-name/references
mkdir skill-name/assets
```

Create SKILL.md template:
```yaml
---
name: skill-name
description: [TODO: What + when]
---

# Skill Name

## Overview
[TODO]

## Usage
[TODO]
```

### Step 4: Editing the Skill

**Mindset:** Create for another AI to use. Include non-obvious, beneficial information.

#### Step 4A: Implement Resources

**scripts/:** Write and test executable code
**references/:** Write documentation organized by domain
**assets/:** Gather/create files for output

**Important:** Test all scripts. Delete unused files.

#### Step 4B: Write SKILL.md

**Frontmatter:**
```yaml
---
name: lowercase-hyphenated
description: WHAT + WHEN with specific triggers
---
```

**Body - Multi-step processes:**
```markdown
Process involves these steps:
1. Validate input (run validate.py)
2. Transform data (run transform.py)
3. Generate output (run output.py)
```

**Body - Conditional workflows:**
```markdown
1. Determine type:
   **Creating?** → Creation workflow
   **Editing?** → Editing workflow

## Creation Workflow
[steps]

## Editing Workflow
[steps]
```

### Step 5: Packaging

**Validate before packaging:**
- [ ] Frontmatter valid
- [ ] Description includes WHAT and WHEN
- [ ] SKILL.md under 500 lines
- [ ] All scripts tested
- [ ] No unnecessary files
- [ ] No duplication

### Step 6: Iterate

**Workflow:**
1. Use on real tasks
2. Notice struggles
3. Identify improvements
4. Implement changes
5. Test again

**Common iterations:**
- Users need more examples → Add to references/
- Scripts fail → Update error handling
- Wrong triggers → Refine description
- SKILL.md too long → Move to references/

---

## 5. Design Patterns

### Workflow Patterns

#### Sequential Workflow

```markdown
## Process

1. Validate input (run validate.py)
2. Query database (run query.py)
3. Generate report (run report.py)
4. Export PDF (run export.py)
```

#### Conditional Workflow

```markdown
## Process

1. Determine task type:
   - **Creating?** → Creation Workflow
   - **Editing?** → Editing Workflow

## Creation Workflow
1. Initialize template
2. Fill sections
3. Validate and save

## Editing Workflow
1. Load document
2. Apply changes
3. Validate and save
```

### Output Patterns

#### Template Pattern (Strict)

```markdown
## Report Structure

ALWAYS use this template:

# [Title]

## Executive Summary
[Overview paragraph]

## Key Findings
- Finding 1
- Finding 2

## Recommendations
1. Recommendation 1
2. Recommendation 2
```

#### Examples Pattern (Flexible)

```markdown
## Commit Messages

Follow these examples:

**Example 1:**
Input: Added authentication
Output:
feat(auth): implement JWT authentication
Add login endpoint and token validation

**Example 2:**
Input: Fixed date bug
Output:
fix(reports): correct date formatting
Use UTC timestamps consistently
```

### Progressive Disclosure Pattern

**In SKILL.md:**
```markdown
## Quick Start
[Brief example]

## Advanced
- Feature A: See [refs/a.md](refs/a.md)
- Feature B: See [refs/b.md](refs/b.md)
```

**In references/:**
```markdown
# Complete Feature A Guide
[Detailed documentation]
```

---

## 6. Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Verbose SKILL.md | Info Claude knows | Challenge each sentence |
| "When to use" in body | Body loads AFTER trigger | Put in description |
| Untested scripts | Scripts fail | Always test |
| Unnecessary files | README, CHANGELOG | Only include essentials |
| Duplicated info | Same in SKILL.md and refs | Pick one location |
| Over-specifying | Rigid for flexible tasks | Match specificity to fragility |
| No progressive disclosure | SKILL.md too long | Split to references |

---

## 7. Validation Checklist

### Frontmatter
- [ ] name: lowercase, hyphenated, matches directory
- [ ] description: WHAT + WHEN + triggers
- [ ] No extra fields

### SKILL.md
- [ ] Under 500 lines
- [ ] Only essential info
- [ ] Imperative form
- [ ] Clear resource references

### Resources
- [ ] scripts/ tested and working
- [ ] references/ no duplication
- [ ] assets/ only output files

### Structure
- [ ] No README, CHANGELOG, etc.
- [ ] No duplicated information
- [ ] Appropriate freedom levels

---

## 8. Complete Examples

### Example: Data Validator Skill

```yaml
---
name: data-validator
description: Validate JSON, CSV, and XML data against schemas. Use when 
  validating data files, checking data quality, or ensuring data conforms 
  to specifications. Triggers on validation requests, schema checking, 
  or data quality analysis.
---

# Data Validator

## Quick Start

Validate JSON against schema:
```bash
python scripts/validate.py data.json --schema schema.json
```

## Supported Formats

| Format | Script | Schema Format |
|--------|--------|---------------|
| JSON | validate.py | JSON Schema |
| CSV | validate_csv.py | CSV Schema |
| XML | validate_xml.py | XSD |

## Validation Options

```bash
# Strict mode (fail on first error)
python scripts/validate.py data.json --strict

# Report mode (collect all errors)
python scripts/validate.py data.json --report errors.json
```

## Custom Rules

For custom validation rules, see [references/custom-rules.md](references/custom-rules.md).

## Common Schemas

Pre-built schemas available in assets/schemas/:
- `user.json` - User data
- `product.json` - Product catalog
- `order.json` - Order data
```

**Structure:**
```
data-validator/
├── SKILL.md
├── scripts/
│   ├── validate.py
│   ├── validate_csv.py
│   └── validate_xml.py
├── references/
│   └── custom-rules.md
└── assets/
    └── schemas/
        ├── user.json
        ├── product.json
        └── order.json
```

---

### Example: Report Generator Skill

```yaml
---
name: report-generator
description: Generate professional reports including quarterly summaries, 
  financial analysis, and executive dashboards. Use when creating business 
  reports, data visualizations, or executive summaries. Triggers on Q1/Q2/Q3/Q4 
  reports, metrics dashboards, financial documentation, or report requests.
---

# Report Generator

## Quick Start

Generate a quarterly report:
```bash
python scripts/generate.py --quarter Q3 --year 2024 --output report.pdf
```

## Report Types

| Type | Template | See |
|------|----------|-----|
| Quarterly | quarterly.md | [refs/quarterly.md](refs/quarterly.md) |
| Financial | financial.md | [refs/financial.md](refs/financial.md) |
| Executive | executive.md | [refs/executive.md](refs/executive.md) |

## Process

1. Select report type
2. Gather data (run gather_data.py)
3. Generate visualizations (run charts.py)
4. Compile report (run compile.py)
5. Export to PDF (run export.py)

## Customization

For custom report templates, see [references/custom-templates.md](references/custom-templates.md).
```

---

## Summary

Creating effective skills requires:

1. **Understanding** concrete use cases
2. **Planning** reusable resources
3. **Following** the three core principles:
   - Concise is key
   - Appropriate degrees of freedom
   - Progressive disclosure
4. **Structuring** with proper anatomy
5. **Validating** before distribution
6. **Iterating** based on real usage

Skills are orchestrators, not tools. They guide AI on how to use tools, APIs, and data to accomplish specialized tasks effectively.
