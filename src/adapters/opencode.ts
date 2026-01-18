/**
 * OpenCode Adapter
 * 
 * Generates configuration for OpenCode AI coding assistant
 * - AGENTS.md for agent instructions
 * - .opencode.json for configuration
 * - .opencode/mcp.json for MCP servers
 */

import { BaseAdapter } from './base.js';
import type { AgentConfig, MCPServer, RuleSet, IDEConfig } from '../types/config.js';
import type { AgentType } from '../types/index.js';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

export class OpenCodeAdapter extends BaseAdapter {
    readonly id: AgentType = 'opencode';
    readonly name = 'opencode';
    readonly displayName = 'OpenCode';

    readonly config: IDEConfig = {
        id: 'opencode',
        name: 'opencode',
        displayName: 'OpenCode',
        agentFile: 'AGENTS.md',
        agentFileGlobal: join(homedir(), '.config', 'opencode', 'AGENTS.md'),
        rulesPath: '.opencode.json',
        rulesFormat: 'json',
        skillsDir: '.opencode/skill',
        globalSkillsDir: join(homedir(), '.config', 'opencode', 'skill'),
        mcpConfig: '.opencode/mcp.json',
        mcpConfigGlobal: join(homedir(), '.config', 'opencode', 'mcp.json'),
        mcpFormat: 'json',
    };

    async isInstalled(): Promise<boolean> {
        return existsSync(join(homedir(), '.config', 'opencode'));
    }

    async generateAgentFile(config: AgentConfig): Promise<string> {
        // Import prompts dynamically to avoid circular dependencies
        const { DEFAULT_AGENT_INTRO, getPromptForTechStack } = await import('../data/prompts.js');

        const sections: string[] = [];

        // Header with AGENTS.md standard format
        sections.push(`# AGENTS.md - ${config.projectName || 'Project'}\n`);
        sections.push('> Universal AI Agent Instructions\n');

        // Description
        if (config.description) {
            sections.push('## Overview\n');
            sections.push(`${config.description}\n`);
        }

        // Default behavior intro (the copy-paste template)
        sections.push(DEFAULT_AGENT_INTRO);

        // Tech Stack
        if (config.techStack.length > 0 || config.frameworks.length > 0 || config.languages.length > 0) {
            sections.push('## Technology Stack\n');

            if (config.languages.length > 0) {
                sections.push('### Languages');
                config.languages.forEach(lang => sections.push(`- ${lang}`));
                sections.push('');
            }

            if (config.frameworks.length > 0) {
                sections.push('### Frameworks');
                config.frameworks.forEach(fw => sections.push(`- ${fw}`));
                sections.push('');
            }

            if (config.techStack.length > 0) {
                sections.push('### Technologies');
                config.techStack.forEach(tech => sections.push(`- ${tech}`));
                sections.push('');
            }
        }

        // Tech-specific guidelines
        const allTech = [...config.languages, ...config.frameworks, ...config.techStack];
        const techPrompts = getPromptForTechStack(allTech);
        if (techPrompts) {
            sections.push(techPrompts);
        }

        // Commands
        if (config.buildCommands.length > 0 || config.devCommands.length > 0 || config.testCommands.length > 0) {
            sections.push('## Commands\n');

            if (config.devCommands.length > 0) {
                sections.push('### Development\n```bash');
                config.devCommands.forEach(cmd => sections.push(cmd));
                sections.push('```\n');
            }

            if (config.buildCommands.length > 0) {
                sections.push('### Build\n```bash');
                config.buildCommands.forEach(cmd => sections.push(cmd));
                sections.push('```\n');
            }

            if (config.testCommands.length > 0) {
                sections.push('### Test\n```bash');
                config.testCommands.forEach(cmd => sections.push(cmd));
                sections.push('```\n');
            }
        }

        // Architecture
        if (config.architectureNotes.length > 0) {
            sections.push('## Architecture\n');
            config.architectureNotes.forEach(note => sections.push(`- ${note}`));
            sections.push('');
        }

        // Guidelines
        if (config.codingGuidelines.length > 0) {
            sections.push('## Coding Guidelines\n');
            config.codingGuidelines.forEach(guideline => sections.push(`- ${guideline}`));
            sections.push('');
        }

        return sections.join('\n');
    }

    async generateRulesConfig(rules: RuleSet): Promise<string> {
        // OpenCode uses .opencode.json for configuration
        const config: Record<string, unknown> = {
            rules: {
                enabled: true,
                global: rules.global.map(r => r.content),
            },
        };

        if (rules.pathSpecific.length > 0) {
            (config.rules as Record<string, unknown>).patterns = rules.pathSpecific.reduce((acc, pr) => {
                acc[pr.pattern] = pr.rules.map(r => r.content);
                return acc;
            }, {} as Record<string, string[]>);
        }

        return JSON.stringify(config, null, 2);
    }

    async generateMCPConfig(servers: MCPServer[]): Promise<string> {
        const mcpConfig: Record<string, unknown> = {
            mcpServers: {},
        };

        for (const server of servers) {
            if (server.type === 'http') {
                (mcpConfig.mcpServers as Record<string, unknown>)[server.name] = {
                    type: 'http',
                    url: server.url,
                    ...(server.headers && Object.keys(server.headers).length > 0 ? { headers: server.headers } : {}),
                };
            } else {
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
            return join(homedir(), '.config', 'opencode', 'opencode.json');
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
