/**
 * Claude Code Adapter
 * 
 * Generates configuration for Claude Code (Anthropic's AI coding assistant)
 * - CLAUDE.md for agent instructions
 * - .claude/settings.json for rules
 * - .claude/mcp.json for MCP servers
 */

import { BaseAdapter } from './base.js';
import type { AgentConfig, MCPServer, RuleSet, IDEConfig } from '../types/config.js';
import type { AgentType } from '../types/index.js';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

export class ClaudeCodeAdapter extends BaseAdapter {
    readonly id: AgentType = 'claude-code';
    readonly name = 'claude-code';
    readonly displayName = 'Claude Code';

    readonly config: IDEConfig = {
        id: 'claude-code',
        name: 'claude-code',
        displayName: 'Claude Code',
        agentFile: 'CLAUDE.md',
        agentFileGlobal: join(homedir(), '.claude', 'CLAUDE.md'),
        rulesPath: '.claude/settings.json',
        rulesFormat: 'json',
        skillsDir: '.claude/skills',
        globalSkillsDir: join(homedir(), '.claude', 'skills'),
        mcpConfig: '.claude/mcp.json',
        mcpConfigGlobal: join(homedir(), '.claude', 'mcp.json'),
        mcpFormat: 'json',
    };

    async isInstalled(): Promise<boolean> {
        return existsSync(join(homedir(), '.claude'));
    }

    async generateAgentFile(config: AgentConfig): Promise<string> {
        // Import prompts dynamically to avoid circular dependencies
        const { DEFAULT_AGENT_INTRO, getPromptForTechStack, MCP_INTRO } = await import('../data/prompts.js');

        const sections: string[] = [];

        // Header
        sections.push(`# ${config.projectName || 'Project'} - Claude Instructions\n`);

        // Description
        if (config.description) {
            sections.push(`${config.description}\n`);
        }

        // Default behavior intro (the copy-paste template)
        sections.push(DEFAULT_AGENT_INTRO);

        // Tech Stack
        if (config.techStack.length > 0 || config.frameworks.length > 0) {
            sections.push('## Tech Stack\n');
            if (config.languages.length > 0) {
                sections.push(`**Languages:** ${config.languages.join(', ')}`);
            }
            if (config.frameworks.length > 0) {
                sections.push(`**Frameworks:** ${config.frameworks.join(', ')}`);
            }
            if (config.techStack.length > 0) {
                sections.push(`**Technologies:** ${config.techStack.join(', ')}`);
            }
            sections.push('');
        }

        // Tech-specific guidelines
        const allTech = [...config.languages, ...config.frameworks, ...config.techStack];
        const techPrompts = getPromptForTechStack(allTech);
        if (techPrompts) {
            sections.push(techPrompts);
        }

        // Build & Run Commands
        if (config.buildCommands.length > 0 || config.devCommands.length > 0 || config.testCommands.length > 0) {
            sections.push('## Build and Run\n');

            if (config.devCommands.length > 0) {
                sections.push('### Development');
                sections.push('```bash');
                config.devCommands.forEach(cmd => sections.push(cmd));
                sections.push('```\n');
            }

            if (config.buildCommands.length > 0) {
                sections.push('### Build');
                sections.push('```bash');
                config.buildCommands.forEach(cmd => sections.push(cmd));
                sections.push('```\n');
            }

            if (config.testCommands.length > 0) {
                sections.push('### Test');
                sections.push('```bash');
                config.testCommands.forEach(cmd => sections.push(cmd));
                sections.push('```\n');
            }
        }

        // Architecture Notes
        if (config.architectureNotes.length > 0) {
            sections.push('## Architecture\n');
            config.architectureNotes.forEach(note => sections.push(`- ${note}`));
            sections.push('');
        }

        // Coding Guidelines
        if (config.codingGuidelines.length > 0) {
            sections.push('## Coding Guidelines\n');
            config.codingGuidelines.forEach(guideline => sections.push(`- ${guideline}`));
            sections.push('');
        }

        // MCP Servers
        if (config.mcpServers && config.mcpServers.length > 0) {
            sections.push(MCP_INTRO);
            config.mcpServers.forEach(server => {
                sections.push(`- **${server.displayName || server.name}**${server.description ? `: ${server.description}` : ''}`);
            });
            sections.push('');
        }

        return sections.join('\n');
    }

    async generateRulesConfig(rules: RuleSet): Promise<string> {
        // Claude Code uses settings.json for some configurations
        // But main rules go in CLAUDE.md - this is for additional settings
        const settings: Record<string, unknown> = {
            rules: {
                global: rules.global.map(r => r.content),
            },
        };

        if (rules.pathSpecific.length > 0) {
            settings.rules = {
                ...settings.rules as object,
                pathSpecific: rules.pathSpecific.map(pr => ({
                    pattern: pr.pattern,
                    rules: pr.rules.map(r => r.content),
                })),
            };
        }

        return JSON.stringify(settings, null, 2);
    }

    async generateMCPConfig(servers: MCPServer[]): Promise<string> {
        const mcpConfig: Record<string, unknown> = {
            mcpServers: {},
        };

        for (const server of servers) {
            if (server.type === 'http') {
                // HTTP/SSE server
                (mcpConfig.mcpServers as Record<string, unknown>)[server.name] = {
                    type: 'sse',
                    url: server.url,
                    ...(server.headers && Object.keys(server.headers).length > 0 ? { headers: server.headers } : {}),
                };
            } else {
                // Command (stdio) server - default
                (mcpConfig.mcpServers as Record<string, unknown>)[server.name] = {
                    command: server.command,
                    args: server.args || [],
                    ...(server.env && Object.keys(server.env).length > 0 ? { env: server.env } : {}),
                };
            }
        }

        return JSON.stringify(mcpConfig, null, 2);
    }

    getAgentFilePath(projectPath: string, global?: boolean): string {
        if (global) {
            return this.config.agentFileGlobal!;
        }
        return join(projectPath, this.config.agentFile);
    }

    getRulesPath(projectPath: string, global?: boolean): string {
        if (global) {
            return join(homedir(), '.claude', 'settings.json');
        }
        return join(projectPath, this.config.rulesPath);
    }

    getMCPConfigPath(projectPath: string, global?: boolean): string {
        if (global) {
            return this.config.mcpConfigGlobal!;
        }
        return join(projectPath, this.config.mcpConfig!);
    }
}
