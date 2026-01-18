/**
 * Configuration Types for Universal AI IDE Support
 */

import type { AgentType } from './index.js';

/**
 * IDE-specific configuration paths and formats
 */
export interface IDEConfig {
    id: AgentType;
    name: string;
    displayName: string;

    // Agent instructions file
    agentFile: string;              // e.g., 'CLAUDE.md', 'AGENTS.md'
    agentFileGlobal?: string;       // Global agent file location

    // Rules configuration
    rulesPath: string;              // e.g., '.cursor/rules', '.claude/settings.json'
    rulesFormat: 'markdown' | 'json' | 'mdc';

    // Skills directory
    skillsDir: string;
    globalSkillsDir: string;

    // MCP configuration
    mcpConfig?: string;             // Project-level MCP config
    mcpConfigGlobal?: string;       // User-level MCP config
    mcpFormat?: 'json' | 'toml';
}

/**
 * Universal agent configuration that can be synced across IDEs
 */
export interface AgentConfig {
    // Project metadata
    projectName?: string;
    description?: string;

    // Tech stack and context
    techStack: string[];
    frameworks: string[];
    languages: string[];

    // Commands
    buildCommands: string[];
    testCommands: string[];
    devCommands: string[];

    // Guidelines and rules
    codingGuidelines: string[];
    architectureNotes: string[];

    // MCP servers
    mcpServers: MCPServer[];
}

/**
 * MCP Server type - command (stdio) or HTTP-based
 */
export type MCPServerType = 'command' | 'http';

/**
 * MCP Server configuration
 * Supports two modes:
 * - command (stdio): Run a local command that implements MCP protocol
 * - http: Connect to a remote HTTP/SSE server that implements MCP protocol
 */
export interface MCPServer {
    name: string;
    displayName?: string;
    description?: string;

    // Server type
    type: MCPServerType;

    // For command (stdio) type
    command?: string;
    args?: string[];
    env?: Record<string, string>;

    // For HTTP type
    url?: string;
    headers?: Record<string, string>;
}

/**
 * Rules configuration
 */
export interface RuleSet {
    // Global rules that apply everywhere
    global: Rule[];

    // Path-specific rules (glob pattern -> rules)
    pathSpecific: PathRule[];
}

export interface Rule {
    id?: string;
    content: string;
    category?: 'style' | 'security' | 'performance' | 'testing' | 'documentation' | 'other';
    priority?: 'high' | 'medium' | 'low';
}

export interface PathRule {
    pattern: string;        // Glob pattern like '*.ts' or 'src/api/**'
    rules: Rule[];
}

/**
 * Detected project information
 */
export interface ProjectInfo {
    name: string;
    path: string;
    techStack: string[];
    frameworks: string[];
    languages: string[];
    hasGit: boolean;
    detectedIDEs: AgentType[];
    existingConfigs: {
        agent?: string;
        rules?: string;
        mcp?: string;
    };
}

/**
 * Sync result for tracking what was updated
 */
export interface SyncResult {
    ide: AgentType;
    success: boolean;
    filesCreated: string[];
    filesUpdated: string[];
    errors: string[];
}
