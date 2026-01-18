# openskill-ai

> Universal AI IDE Configuration & Skill Manager

A powerful CLI tool to unify your AI coding agent experience. Standardize instructions, manage MCP servers, and install agent skills across Claude Code, Antigravity, Cursor, OpenCode, and GitHub Copilot.

## 🚀 Key Features

- 🔄 **Universal Sync** - Synchronize agent instructions and MCP configs across all IDEs at once.
- 🛠️ **MCP Management** - Add, list, and sync Model Context Protocol servers (Standard Stdio & HTTP/SSE).
- 🤖 **Standardized Agents** - Project-level `AGENTS.md` and `CLAUDE.md` with default prompt templates.
- ✨ **Skill Manager** - Install specialized agent instructions from any Git repository.
- 📐 **Global & Workspace Rules** - Manage rules centrally (e.g., `~/.gemini/GEMINI.md`) or per project.
- � **Auto-Detection** - Automatically detects installed AI assistants on your system.

## 🛠️ Installation

```bash
# Install globally
npm install -g openskill-ai

# Or use with npx
npx openskill-ai <command>
```

## 📋 Quick Start

### 1. Unified Configuration Sync
Detected an AI IDE? Sync your setup across all of them in one go:
```bash
# Sync agent files, rules, and MCP configs
openskill-ai sync
```

### 2. Manage MCP Servers
Add local or remote tools to all your AI assistants:
```bash
# Choose between Command (stdio) or HTTP server
openskill-ai mcp add

# Sync your MCP setup to all IDE settings (settings.json, etc.)
openskill-ai mcp sync

# List all configured servers
openskill-ai mcp list
```

### 3. Agent Instructions
Initialize a standardized instruction set for your project:
```bash
# Creates AGENTS.md, CLAUDE.md, etc.
openskill-ai agent init
```

### 4. Install Agent Skills
Install specialized behaviors from the community or your own repos:
```bash
# Install skills from a GitHub repository
openskill-ai vercel-labs/agent-skills

# Choose specific skills to install
openskill-ai vercel-labs/agent-skills --skill frontend-design
```

## 🤖 Supported Adapters

| Adapter | Workspace File | Global File | MCP Config |
|---------|----------------|-------------|------------|
| **Antigravity** | `AGENTS.md` | `~/.gemini/GEMINI.md` | `.gemini/settings.json` |
| **Claude Code** | `CLAUDE.md` | `~/.claude.md` | `.claude/mcp.json` |
| **OpenCode** | `AGENTS.md` | `~/.opencode.md` | `mcp.json` |
| **Cursor** | `AGENTS.md` | `~/.cursorrules` | `.cursor/mcp.json` |
| **GitHub Copilot** | `.github/copilot-instructions.md` | - | - |

## 🕹️ Command Reference

| Command | Description |
|---------|-------------|
| `sync` | Sync all configs across all detected IDEs |
| `mcp add` | Add a new MCP server (Stdio or HTTP) |
| `mcp sync` | Sync MCP servers to all assistant configs |
| `agent init` | Initialize agent instruction files in the current folder |
| `agent show` | Show current agent configuration |
| `<git-url>` | Install/manage skills from a remote repository |

## 🏗️ Folder Structure

Universal AI IDEs follow these conventions through `openskill-ai`:

- **Workspace Rules**: `.agent/rules/` (Markdown files)
- **Agent Skills**: `.agent/skills/`
- **Global Config**: `~/.gemini/` (Settings, rules, and global instructions)

## 🔒 Security

The tool implements strict path sanitization and traversal protection to ensure that skills downloaded from remote repositories cannot execute malicious path operations on your system.

## 📄 License

MIT © Agent Skills Community

## 🔗 Links

- [GitHub Repository](https://github.com/includeHasan/agent-skills)
- [npm Package](https://www.npmjs.com/package/openskill-ai)
