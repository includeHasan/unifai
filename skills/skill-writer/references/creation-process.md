# The 6-Step Skill Creation Process

Follow these steps in order. Skip only if there is a clear reason why they are not applicable.

---

## Step 1: Understanding with Concrete Examples

**Goal:** Clearly understand concrete examples of how the skill will be used.

**When to skip:** Only when usage patterns are already clearly understood.

### Process

1. Gather concrete examples of how the skill will be used
2. Ask clarifying questions:
   - "What functionality should the skill support?"
   - "Can you give examples of how it would be used?"
   - "What would a user say that should trigger this skill?"

### Example Questions for Different Skills

**Image Editor Skill:**
- "What functionality should this support? Editing, rotating, anything else?"
- "What would users say? 'Remove red-eye'? 'Rotate this image'?"

**Data Validator Skill:**
- "What data formats need validation? JSON, CSV, XML?"
- "Should it validate against schemas or just syntax?"

**Important:** Avoid overwhelming users. Start with the most important questions and follow up as needed.

**Conclude when:** You have a clear sense of the functionality the skill should support.

---

## Step 2: Planning Reusable Contents

**Goal:** Identify what reusable resources would be helpful.

### Process

For each concrete example from Step 1:
1. Consider how to execute from scratch
2. Identify what scripts, references, and assets would help
3. Note patterns that repeat across examples

### Analysis Examples

**Example: PDF Editor Skill**
```
Query: "Help me rotate this PDF"
Analysis: Rotating a PDF requires re-writing the same code each time
Resource: scripts/rotate_pdf.py
```

**Example: Frontend Webapp Builder**
```
Query: "Build me a todo app"
Analysis: Writing a webapp requires the same boilerplate each time
Resource: assets/hello-world/ (template with HTML/React boilerplate)
```

**Example: BigQuery Skill**
```
Query: "How many users have logged in today?"
Analysis: Querying requires re-discovering table schemas each time
Resource: references/schema.md (table schemas and relationships)
```

**Outcome:** A list of resources to include: scripts, references, and assets.

---

## Step 3: Initializing the Skill

**Goal:** Create the initial skill directory structure.

**When to skip:** If iterating on an existing skill.

### Create Directory Structure

```bash
mkdir skill-name
mkdir skill-name/scripts
mkdir skill-name/references
mkdir skill-name/assets
```

### Create SKILL.md Template

```yaml
---
name: skill-name
description: [TODO: What it does + when to trigger]
---

# Skill Name

## Overview
[TODO: Brief description]

## Usage
[TODO: How to use this skill]

## Resources
[TODO: Reference bundled resources]
```

### After Initialization

- Customize or remove generated directories
- Delete any placeholder files not needed
- Keep only essential structure

---

## Step 4: Editing the Skill

**Goal:** Implement the skill contents (resources and SKILL.md).

**Mindset:** The skill is being created for another instance of Claude to use. Include information that would be beneficial and non-obvious to Claude.

### Step 4A: Implement Reusable Resources

Start with the resources identified in Step 2.

**For scripts/:**
- Write the executable code
- Test all scripts by actually running them
- Handle common error cases

**For references/:**
- Write documentation Claude should reference
- Organize by domain or use case
- Include search patterns for large files

**For assets/:**
- Gather or create files for output
- Request user input if needed (brand assets, templates)
- Organize logically

**Important:** Delete any example files or directories not needed.

### Step 4B: Write SKILL.md

**Always use imperative/infinitive form.**

#### Writing the Frontmatter

```yaml
---
name: lowercase-hyphenated
description: WHAT it does + WHEN to use. Include ALL trigger information here.
---
```

**Description is critical.** It's the primary triggering mechanism.
- Include specific file types (.pdf, .xlsx, .json)
- Include common user phrases
- Include all "when to use" contexts

**Do not include other frontmatter fields.**

#### Writing the Body

**For multi-step processes, give overview early:**

```markdown
Filling a PDF form involves these steps:
1. Analyze the form (run analyze_form.py)
2. Create field mapping (edit fields.json)
3. Validate mapping (run validate_fields.py)
4. Fill the form (run fill_form.py)
5. Verify output (run verify_output.py)
```

**For conditional workflows:**

```markdown
1. Determine the modification type:
   **Creating new content?** → Follow "Creation workflow" below
   **Editing existing content?** → Follow "Editing workflow" below

2. Creation workflow: [steps]
3. Editing workflow: [steps]
```

**Reference bundled resources clearly:**

```markdown
## Advanced Features
- Form filling: See [references/forms.md](references/forms.md)
- API reference: See [references/api.md](references/api.md)
```

---

## Step 5: Packaging the Skill

**Goal:** Validate and create a distributable package.

### Validation Checklist

Before packaging, verify:
- [ ] YAML frontmatter is valid
- [ ] name and description are present
- [ ] Description includes WHAT and WHEN
- [ ] SKILL.md is under 500 lines
- [ ] All scripts are tested and working
- [ ] No unnecessary files (README, CHANGELOG)
- [ ] No duplication between SKILL.md and references

### Create Package

Package the skill directory for distribution:
- Include all files and maintain directory structure
- The package should be self-contained

**If validation fails:** Fix errors and validate again.

---

## Step 6: Iterate

**Goal:** Improve the skill based on real-world usage.

### Iteration Workflow

1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Identify how SKILL.md or resources should be updated
4. Implement changes
5. Test again

### Common Iteration Patterns

**Users need more examples:**
→ Add examples to references/

**Scripts fail on edge cases:**
→ Update scripts with better error handling

**Skill triggers incorrectly:**
→ Refine the description field

**SKILL.md is getting long:**
→ Move details to references/

**Note:** Users often request improvements right after using the skill, with fresh context of how it performed. Capture this feedback immediately.
