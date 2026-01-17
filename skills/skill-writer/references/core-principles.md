# Core Principles for Skill Design

These three principles guide all skill creation decisions.

---

## Principle 1: Concise is Key

**The context window is a public good.** Skills share context with:
- System prompt
- Conversation history
- Other skills' metadata
- The actual user request

### Default Assumption
Claude is already very smart. Only add context Claude doesn't already have.

### Challenge Each Piece
Ask yourself:
- "Does Claude really need this explanation?"
- "Does this paragraph justify its token cost?"
- "Can I show this with an example instead of explaining it?"

### Prefer Examples Over Explanations

**Verbose (avoid):**
```markdown
When processing user data, you should validate each field 
according to the schema. The validation process involves 
checking that required fields are present, that data types 
match the expected types, and that values fall within 
acceptable ranges as defined in the schema documentation.
```

**Concise (prefer):**
```markdown
Validate fields against schema:
- Required fields present
- Types match
- Values in range
```

---

## Principle 2: Degrees of Freedom

Match the level of specificity to the task's fragility and variability.

### High Freedom (text-based instructions)

**Use when:**
- Multiple approaches are valid
- Decisions depend on context
- Heuristics guide the approach

**Example:**
```markdown
Analyze the data and choose the most appropriate visualization 
based on data type and user needs.
```

### Medium Freedom (pseudocode or scripts with parameters)

**Use when:**
- A preferred pattern exists
- Some variation is acceptable
- Configuration affects behavior

**Example:**
```markdown
Generate report using:
1. Query data with provided filters
2. Apply template from references/templates.md
3. Format output as [PDF|HTML|Markdown] based on user preference
```

### Low Freedom (specific scripts, few parameters)

**Use when:**
- Operations are fragile and error-prone
- Consistency is critical
- A specific sequence must be followed

**Example:**
```markdown
Execute exactly:
1. Run `python scripts/validate.py input.json`
2. Run `python scripts/transform.py --config config.yaml`
3. Run `python scripts/output.py --format pdf`
```

### Mental Model

Think of Claude as exploring a path:
- **Narrow bridge with cliffs** → Specific guardrails (low freedom)
- **Open field** → Many valid routes (high freedom)

---

## Principle 3: Progressive Disclosure

Skills use a three-level loading system to manage context efficiently.

### Level 1: Metadata (Always in Context)

- **Content:** name + description (~100 words)
- **Loaded:** Always, for all skills
- **Purpose:** Determines when skill triggers

### Level 2: SKILL.md Body (When Triggered)

- **Content:** Instructions and guidance (<5k words, ideally <500 lines)
- **Loaded:** Only after skill triggers
- **Purpose:** Core workflow and navigation to resources

### Level 3: Bundled Resources (As Needed)

- **Content:** Scripts, references, assets (unlimited)
- **Loaded:** When Claude determines they're needed
- **Purpose:** Detailed information and executable code

### Practical Guidelines

| If SKILL.md is... | Action |
|-------------------|--------|
| Under 200 lines | Good, keep as is |
| 200-500 lines | Consider splitting some content to references |
| Over 500 lines | Must split into references |

### Example: Progressive Structure

**In SKILL.md (loaded when triggered):**
```markdown
## Quick Start
Extract text with pdfplumber:
[brief code example]

## Advanced Features
- Form filling: See [references/forms.md](references/forms.md)
- API reference: See [references/api.md](references/api.md)
```

**In references/forms.md (loaded only when needed):**
```markdown
# Complete Form Filling Guide
[Detailed multi-page documentation]
```
