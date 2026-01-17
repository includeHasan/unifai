# openskill-ai

> Install AI agent skills from any Git repository

A powerful CLI tool to install and manage AI coding agent skills from GitHub, GitLab, or any Git repository. Supports 15+ popular AI agents with auto-detection and interactive prompts.

## Features

✨ **Remote Repository Support** - Install skills from any Git repository  
🤖 **15+ AI Agents** - Antigravity, Cursor, Claude Code, OpenCode, GitHub Copilot, and more  
💬 **Interactive CLI** - Beautiful prompts with multi-select workflows  
🔍 **Auto-Detection** - Automatically finds installed agents on your system  
🌐 **Global/Project Installs** - Choose your installation scope  
🔒 **Security** - Path sanitization and traversal protection  

## Quick Start

```bash
# Install skills from a repository
npx openskill-ai vercel-labs/agent-skills

# List available skills first
npx openskill-ai vercel-labs/agent-skills --list

# Install specific skill to Antigravity
npx openskill-ai vercel-labs/agent-skills \
  --skill frontend-design \
  --agent antigravity
```

## Installation

### As a CLI Tool (Recommended)

Use with `npx` without installing:
```bash
npx openskill-ai <source>
```

Or install globally:
```bash
npm install -g openskill-ai
openskill-ai <source>
```

### As a Library

```bash
npm install openskill-ai
```

```javascript
import { installSkillForAgent, discoverSkills } from 'openskill-ai';
```

## Usage

### Source Formats

The CLI accepts multiple source formats:

```bash
# GitHub shorthand
openskill-ai vercel-labs/agent-skills

# GitHub URL
openskill-ai https://github.com/owner/repo

# GitHub tree path (specific directory)
openskill-ai https://github.com/owner/repo/tree/main/skills/frontend

# GitLab
openskill-ai https://gitlab.com/owner/repo

# Direct Git URL
openskill-ai git@github.com:owner/repo.git
```

### CLI Options

| Option | Description |
|--------|-------------|
| `-g, --global` | Install globally (user-level) instead of project-level |
| `-a, --agent <agents...>` | Target specific agents |
| `-s, --skill <skills...>` | Select specific skills to install |
| `-l, --list` | List available skills without installing |
| `-y, --yes` | Skip all confirmation prompts |
| `-h, --help` | Show help |

### Examples

**Interactive Installation** (recommended for first-time users):
```bash
openskill-ai vercel-labs/agent-skills
```

**List Skills Before Installing:**
```bash
openskill-ai vercel-labs/agent-skills --list
```

**Install Specific Skill:**
```bash
openskill-ai vercel-labs/agent-skills --skill frontend-design
```

**Install to Multiple Agents:**
```bash
openskill-ai vercel-labs/agent-skills \
  --skill frontend-design \
  --agent antigravity \
  --agent cursor \
  --agent claude-code
```

**Global Installation (Non-Interactive):**
```bash
openskill-ai vercel-labs/agent-skills \
  --skill frontend-design \
  --global \
  --yes
```

**List All Supported Agents:**
```bash
openskill-ai list-agents
```

## Supported AI Agents

The tool supports 15 AI coding agents with auto-detection:

- **Antigravity** - `.agent/skills` (project) or `~/.gemini/antigravity/skills` (global)
- **Cursor** - `.cursor/skills` or `~/.cursor/skills`
- **Claude Code** - `.claude/skills` or `~/.claude/skills`
- **OpenCode** - `.opencode/skill` or `~/.config/opencode/skill`
- **GitHub Copilot** - `.github/skills` or `~/.copilot/skills`
- **Codex** - `.codex/skills` or `~/.codex/skills`
- **Windsurf** - `.windsurf/skills` or `~/.codeium/windsurf/skills`
- **Roo Code** - `.roo/skills` or `~/.roo/skills`
- **Goose** - `.goose/skills` or `~/.config/goose/skills`
- **Gemini CLI** - `.gemini/skills` or `~/.gemini/skills`
- **Amp** - `.agents/skills` or `~/.config/agents/skills`
- **Kilo Code** - `.kilocode/skills` or `~/.kilocode/skills`
- **Clawdbot** - `skills/` or `~/.clawdbot/skills`
- **Droid** - `.factory/skills` or `~/.factory/skills`

## Creating Skills

Skills are defined using `SKILL.md` files with YAML frontmatter:

```markdown
---
name: my-skill
description: What this skill does and when to use it
---

# My Skill

Instructions for the AI agent to follow when this skill is activated.

## When to Use

Describe scenarios where this skill should be applied.

## Guidelines

1. First guideline
2. Second guideline
```

### Skill Discovery

The CLI searches for skills in these locations:
- Root directory (if it contains `SKILL.md`)
- `skills/`, `skills/.curated/`, `skills/.experimental/`
- `.agent/skills/`, `.claude/skills/`, `.cursor/skills/`
- All other agent-specific directories
- Recursive search as fallback (max depth 5)

## Security

The tool implements several security measures:

- **Path Sanitization** - Removes dangerous characters from skill names
- **Traversal Protection** - Validates all paths to prevent directory traversal
- **Safe Cloning** - Uses temporary directories for Git operations
- **File Exclusions** - Skips `README.md`, `metadata.json`, and files starting with `_`

## Programmatic API

```javascript
import { 
  installSkillForAgent,
  discoverSkills,
  detectInstalledAgents,
  parseSource,
  cloneRepo
} from 'openskill-ai';

// Clone and discover skills
const parsed = parseSource('vercel-labs/agent-skills');
const tempDir = await cloneRepo(parsed.url);
const skills = await discoverSkills(tempDir);

// Detect installed agents
const agents = await detectInstalledAgents();

// Install skill
await installSkillForAgent(skills[0], 'antigravity', { global: false });
```

## Requirements

- Node.js >= 18.0.0
- Git installed on your system

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Agent Skills Community

## Links

- [GitHub Repository](https://github.com/yourusername/agent-skills)
- [Report Issues](https://github.com/yourusername/agent-skills/issues)
- [npm Package](https://www.npmjs.com/package/openskill-ai)
