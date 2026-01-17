# Skill Writer

A universal meta-skill that guides AI agents to create high-quality Skills for any technology, language, or domain.

## What This Skill Does

When an AI agent uses this skill, it learns:
- **Core principles** for effective skill design
- **Skill anatomy** - directory structure and file types
- **6-step creation process** from concept to packaging
- **Design patterns** for workflows and outputs
- **Common pitfalls** and how to avoid them

## Structure

```
skill-writer/
├── SKILL.md              # Main skill (triggers + overview)
├── AGENTS.md             # Full compiled guide
├── metadata.json         # Version and references
├── README.md             # This file
└── references/
    ├── core-principles.md
    ├── skill-anatomy.md
    ├── creation-process.md
    ├── design-patterns.md
    ├── common-pitfalls.md
    └── validation-checklist.md
```

## Usage

The skill activates when users ask to:
- Create a new skill
- Write or update SKILL.md files
- Structure skills with scripts/references/assets
- Package or validate skills
- Convert workflows into reusable skills

## Key Principles

1. **Concise is Key** - Context window is shared; every token costs
2. **Degrees of Freedom** - Match specificity to task fragility
3. **Progressive Disclosure** - Load details only when needed

## References

- [Claude Skills Documentation](https://claude.ai/docs/skills)
- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)
