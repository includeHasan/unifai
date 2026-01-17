---
name: skill-writer
description: Universal guide for creating well-structured Agent Skills for any technology or domain. Use when creating, writing, authoring, or designing a new Skill. Triggers on requests involving SKILL.md files, skill structure, frontmatter, bundled resources (scripts/references/assets), skill validation, skill packaging, or when user wants to convert workflows into reusable Skills.
---

# Skill Writer

Create high-quality Agent Skills for any technology, language, or domain.

## What Skills Are

Skills are modular packages that extend AI capabilities by providing:
- **Specialized workflows** - Multi-step procedures for specific domains
- **Tool integrations** - Instructions for working with file formats or APIs
- **Domain expertise** - Schemas, business logic, conventions
- **Bundled resources** - Scripts, references, assets for complex tasks

Skills are **orchestrators**, not tools themselves. They guide AI on HOW to use tools.

## Core Principles

1. **Concise is Key** - Challenge each token; prefer examples over explanations
2. **Degrees of Freedom** - Match specificity to task fragility
3. **Progressive Disclosure** - Load details only when needed

See [references/core-principles.md](references/core-principles.md) for detailed guidance.

## Skill Anatomy

```
skill-name/
├── SKILL.md (REQUIRED)
│   ├── YAML frontmatter (name, description)
│   └── Markdown instructions
└── Bundled Resources (OPTIONAL)
    ├── scripts/      - Executable code (deterministic tasks)
    ├── references/   - Documentation (loaded as needed)
    └── assets/       - Output files (not loaded into context)
```

See [references/skill-anatomy.md](references/skill-anatomy.md) for when to use each resource type.

## 6-Step Creation Process

1. **Understand** - Gather concrete usage examples
2. **Plan** - Identify reusable resources (scripts/references/assets)
3. **Initialize** - Create directory structure
4. **Edit** - Implement resources + write SKILL.md
5. **Package** - Validate and create distributable
6. **Iterate** - Improve based on real usage

See [references/creation-process.md](references/creation-process.md) for step-by-step guidance.

## Writing SKILL.md

### Frontmatter (Critical)

```yaml
---
name: lowercase-hyphenated-name
description: WHAT it does + WHEN to use it. Include trigger words and contexts.
---
```

The description is the **primary triggering mechanism**. Include ALL trigger information here—the body only loads AFTER triggering.

### Body (Concise)

- Keep under 500 lines
- Use imperative form
- Reference bundled resources clearly
- For multi-step processes, give overview early

See [references/design-patterns.md](references/design-patterns.md) for workflow and output patterns.

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Verbose SKILL.md | Challenge each sentence—does AI need this? |
| "When to use" in body | Put ALL triggers in description field |
| Untested scripts | Always test before packaging |
| Unnecessary files | No README.md, CHANGELOG.md in skills |
| Duplicated info | Pick SKILL.md OR references, not both |

See [references/common-pitfalls.md](references/common-pitfalls.md) for complete list.

## Validation

Before packaging, verify:
- [ ] Frontmatter: name + description present
- [ ] Description: includes WHAT + WHEN
- [ ] SKILL.md: under 500 lines, only essentials
- [ ] Scripts: tested and working
- [ ] No duplication between SKILL.md and references

See [references/validation-checklist.md](references/validation-checklist.md) for full checklist.
