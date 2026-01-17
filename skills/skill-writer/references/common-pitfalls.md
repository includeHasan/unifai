# Common Pitfalls and How to Avoid Them

Learn from common mistakes in skill creation.

---

## Pitfall 1: Verbose SKILL.md Files

### Problem
Including information Claude already knows, wasting context tokens.

### Bad Example
```markdown
## Introduction to Data Validation

Data validation is a crucial process in software development that ensures 
the integrity and quality of data. When data enters a system, it must be 
checked for correctness, completeness, and conformance to defined rules. 
Without proper validation, applications may behave unexpectedly or produce 
incorrect results. This skill helps with data validation tasks.

### What is JSON Schema?

JSON Schema is a vocabulary that allows you to annotate and validate JSON 
documents. It provides a way to describe the structure of JSON data for 
documentation, validation, and interaction control...
```

### Good Example
```markdown
## Quick Start

Validate JSON against schema:
```bash
python scripts/validate.py input.json --schema schema.json
```

For custom validation rules, see [references/rules.md](references/rules.md).
```

### Solution
Challenge each sentence: "Does Claude really need this?" Claude already knows what JSON Schema is.

---

## Pitfall 2: "When to Use" in Body

### Problem
Putting trigger information in the SKILL.md body, which only loads AFTER triggering.

### Bad Example
```yaml
---
name: report-generator
description: Generates reports
---

# Report Generator

## When to Use This Skill

Use this skill when:
- Creating quarterly reports
- Generating financial summaries
- Building dashboards
```

### Good Example
```yaml
---
name: report-generator
description: Generate professional reports including quarterly reports, 
  financial summaries, and dashboards. Use when creating any business report, 
  data visualization, or executive summary. Triggers on requests for Q1/Q2/Q3/Q4 
  reports, metrics dashboards, or financial documentation.
---

# Report Generator

## Quick Start
[Immediately useful content]
```

### Solution
Put ALL trigger information in the description field. The body only loads after the skill is already triggered.

---

## Pitfall 3: Untested Scripts

### Problem
Scripts fail when Claude tries to use them.

### Bad Example
Creating `scripts/process.py` without testing:
```python
def process(file):
    # Untested code with potential bugs
    data = load(file)  # NameError: load is undefined
    return transform(data)
```

### Good Example
Test every script before including:
```bash
# Run the script with test data
python scripts/process.py test_input.json

# Verify output
cat output.json
```

### Solution
- Always test scripts by actually running them
- Include error handling
- Test edge cases

---

## Pitfall 4: Unnecessary Documentation Files

### Problem
Including files that clutter the skill but don't help Claude.

### Bad Structure
```
my-skill/
├── SKILL.md
├── README.md              ❌ Not needed
├── INSTALLATION.md        ❌ Not needed
├── CHANGELOG.md           ❌ Not needed
├── CONTRIBUTING.md        ❌ Not needed
├── .gitignore             ❌ Not needed
└── scripts/
```

### Good Structure
```
my-skill/
├── SKILL.md
├── scripts/
│   └── process.py
└── references/
    └── schema.md
```

### Solution
Only include files that Claude needs to do the job. No README, CHANGELOG, or other developer documentation.

---

## Pitfall 5: Duplicated Information

### Problem
Same information in both SKILL.md and references, causing confusion.

### Bad Example

**In SKILL.md:**
```markdown
## API Endpoints

- GET /users - List all users
- POST /users - Create a user
- GET /users/{id} - Get specific user
...
```

**In references/api.md:**
```markdown
## API Endpoints

- GET /users - List all users
- POST /users - Create a user
- GET /users/{id} - Get specific user
...
```

### Good Example

**In SKILL.md:**
```markdown
## API Reference

For complete endpoint documentation, see [references/api.md](references/api.md).

Quick examples:
- List users: `GET /users`
- Create user: `POST /users`
```

**In references/api.md:**
```markdown
[Complete, detailed API documentation]
```

### Solution
Information lives in EITHER SKILL.md OR references, not both. Use SKILL.md for overview, references for details.

---

## Pitfall 6: Over-Specifying When Flexibility is Better

### Problem
Giving rigid instructions when multiple approaches are valid.

### Bad Example
```markdown
## Writing Blog Posts

You MUST follow this EXACT process:
1. Write exactly 5 outline points
2. Each paragraph must be 100-150 words
3. Use exactly 3 subheadings
4. Include exactly 2 quotes
5. End with exactly 3 bullet points
```

### Good Example
```markdown
## Writing Blog Posts

Create engaging content following these guidelines:
- Start with a compelling hook
- Use subheadings to organize content
- Include relevant examples or quotes
- End with clear takeaways

Adjust structure based on topic and audience needs.
```

### Solution
Match specificity to task fragility. Creative tasks need high freedom; fragile operations need low freedom.

---

## Pitfall 7: No Progressive Disclosure

### Problem
SKILL.md becomes too long, consuming too many tokens.

### Bad Example
```markdown
# PDF Processing

## Text Extraction
[500 lines of detailed documentation]

## Form Filling
[500 lines of detailed documentation]

## Table Extraction
[500 lines of detailed documentation]

## Merge and Split
[500 lines of detailed documentation]

Total: 2000+ lines loaded every time skill triggers
```

### Good Example
```markdown
# PDF Processing

## Quick Start
[50 lines covering basic usage]

## Features
- Text extraction: See [references/text.md](references/text.md)
- Form filling: See [references/forms.md](references/forms.md)
- Tables: See [references/tables.md](references/tables.md)

Total: ~100 lines in SKILL.md, details loaded only when needed
```

### Solution
Keep SKILL.md under 500 lines. Move variant-specific details into reference files.

---

## Quick Reference: Pitfall Checklist

| Check | Question |
|-------|----------|
| ✓ | Is every sentence in SKILL.md necessary? |
| ✓ | Is ALL trigger info in the description field? |
| ✓ | Have all scripts been tested? |
| ✓ | Are there any unnecessary files (README, etc.)? |
| ✓ | Is information duplicated between files? |
| ✓ | Is the freedom level appropriate for each task? |
| ✓ | Is SKILL.md under 500 lines? |
