# unifai

> Universal AI IDE Configuration & Skill Manager

A powerful CLI tool to unify your AI coding agent experience. Standardize instructions, manage MCP servers, and install agent skills across Claude Code, Antigravity, Cursor, OpenCode, and GitHub Copilot.

## 🚀 Key Features

- 🔄 **Universal Sync & Migration** - Synchronize and migrate agent instructions, rules, and MCP configs across all IDEs at once.
- 🛠️ **MCP Management** - Add, list, and sync Model Context Protocol servers (Standard Stdio & HTTP/SSE).
- 🤖 **Standardized Agents** - Project-level `AGENTS.md` and `CLAUDE.md` with professional prompt templates.
- ✨ **Skill Manager** - Install specialized agent instructions from any Git repository.
- 📐 **Cross-IDE Scavenging** - Automatically discover rules from `.claude/`, `.cursor/`, or `.agent/` and unify them.
- 🌐 **Global & Workspace Rules** - Manage rules centrally (e.g., `~/.gemini/GEMINI.md`) or per project.

## 🛠️ Installation

```bash
# Install globally
npm install -g unifai

# Or use with npx
npx unifai <command>
```

## 📋 Quick Start

### 1. Unified Configuration & Migration
Moving from Claude Code to Antigravity? Or Cursor to Claude? Just sync. The tool will scavenge rules, instructions, and tools from all supported IDE paths and unify them across your system.

```bash
# Automatically detects .claude, .cursor, and .agent configs and applies them to all detected IDEs
unifai sync
```

### 2. Manage MCP Servers
Add local or remote tools (via HTTP/SSE) to all your AI assistants:
```bash
# Choose between Command (stdio) or HTTP server
unifai mcp add

# Sync your MCP setup to all IDE settings (settings.json, etc.)
unifai mcp sync
```

### 3. Agent Instructions
Initialize a standardized instruction set for your project with built-in best practices:
```bash
# Creates AGENTS.md, CLAUDE.md, etc.
unifai agent init
```

### 4. Install Agent Skills
Install specialized behaviors (like "frontend-expert" or "testing-pro") from any Git repo:
```bash
# Install skills from a GitHub repository
unifai includeHasan/agent-skills
```

## 🔄 Universal Migration Paths

The `sync` command "scavenges" configurations from these locations and migrates them to your active IDEs:

| Feature | Discovery Paths |
|---------|-----------------|
| **Instructions** | `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md` |
| **Rules** | `.agent/rules/`, `.claude/rules/`, `.cursor/rules/`, `.gemini/rules/`, `.cursorrules` |
| **MCP** | `.mcp/mcp.json`, `.claude/mcp.json`, `.cursor/mcp.json` |

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
| `sync` | Sync & Migrate all configs across all detected IDEs |
| `mcp add` | Add a new MCP server (Stdio or HTTP) |
| `mcp sync` | Sync MCP servers to all assistant configs |
| `agent init` | Initialize standardized agent instruction files |
| `agent show` | Show current agent configuration |
| `<git-url>` | Install skills from a remote repository |

## 🏗️ Folder Structure

Universal AI IDEs follow these conventions through `unifai`:

- **Workspace Rules**: `.agent/rules/` (Unified Markdown files)
- **Agent Skills**: `.agent/skills/`
- **Global Config**: `~/.gemini/` (Settings, global rules, and instructions)

## 📄 License

MIT © Agent Skills Community

## 🔗 Links

- [GitHub Repository](https://github.com/includeHasan/agent-skills)
- [npm Package](https://www.npmjs.com/package/unifai)
