/**
 * Antigravity Adapter
 * 
 * Generates configuration for Antigravity (Google DeepMind's AI coding assistant)
 * - Uses brain artifacts directory for agent configs
 * - MCP server configuration in .gemini/settings.json
 */

import { BaseAdapter } from './base.js';
import type { AgentConfig, MCPServer, RuleSet, IDEConfig } from '../types/config.js';
import type { AgentType } from '../types/index.js';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

export class AntigravityAdapter extends BaseAdapter {
    readonly id: AgentType = 'antigravity';
    readonly name = 'antigravity';
    readonly displayName = 'Antigravity';

    readonly config: IDEConfig = {
        id: 'antigravity',
        name: 'antigravity',
        displayName: 'Antigravity',
        // Agent/rules file - GEMINI.md for global, AGENTS.md for workspace
        agentFile: 'AGENTS.md',
        agentFileGlobal: join(homedir(), '.gemini', 'GEMINI.md'),
        // Rules path - .agent/rules for workspace
        rulesPath: '.agent/rules',
        rulesFormat: 'markdown',
        // Skills directory
        skillsDir: '.agent/skills',
        globalSkillsDir: join(homedir(), '.gemini', 'skills'),
        // MCP config
        mcpConfig: '.gemini/settings.json',
        mcpConfigGlobal: join(homedir(), '.gemini', 'settings.json'),
        mcpFormat: 'json',
    };

    async isInstalled(): Promise<boolean> {
        return existsSync(join(homedir(), '.gemini'));
    }

    async generateAgentFile(config: AgentConfig): Promise<string> {
        // Import prompts dynamically to avoid circular dependencies
        const { DEFAULT_AGENT_INTRO, getPromptForTechStack, MCP_INTRO } = await import('../data/prompts.js');

        const sections: string[] = [];

        // Header with Antigravity-specific format
        sections.push(`# ${config.projectName || 'Project'} - Antigravity Instructions\n`);
        sections.push('> AI-powered development with Antigravity\n');

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

    async generateRulesConfig(rules: RuleSet): Promise<Record<string, string>> {
        // Antigravity uses markdown files in .gemini/rules/ directory
        const files: Record<string, string> = {};

        // Generate global rules file
        if (rules.global.length > 0) {
            const lines: string[] = [];
            lines.push('# Global Rules\n');
            rules.global.forEach(r => lines.push(`- ${r.content}`));
            files['global.md'] = lines.join('\n');
        }

        // Generate path-specific rules files
        for (const pathRule of rules.pathSpecific) {
            const safeName = pathRule.pattern.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
            const lines: string[] = [];
            lines.push(`# Rules for ${pathRule.pattern}\n`);
            lines.push(`> Applies to: \`${pathRule.pattern}\`\n`);
            pathRule.rules.forEach(r => lines.push(`- ${r.content}`));
            files[`${safeName}.md`] = lines.join('\n');
        }

        return files;
    }

    async generateMCPConfig(servers: MCPServer[]): Promise<string> {
        // Antigravity uses settings.json with mcpServers key
        const settings: Record<string, unknown> = {
            mcpServers: {},
        };

        for (const server of servers) {
            if (server.type === 'http') {
                (settings.mcpServers as Record<string, unknown>)[server.name] = {
                    type: 'sse',
                    url: server.url,
                    ...(server.headers && Object.keys(server.headers).length > 0 ? { headers: server.headers } : {}),
                };
            } else {
                (settings.mcpServers as Record<string, unknown>)[server.name] = {
                    command: server.command,
                    args: server.args || [],
                    ...(server.env && Object.keys(server.env).length > 0 ? { env: server.env } : {}),
                };
            }
        }

        return JSON.stringify(settings, null, 2);
    }

    getAgentFilePath(projectPath: string, global?: boolean): string {
        if (global) {
            return this.config.agentFileGlobal!;
        }
        return join(projectPath, this.config.agentFile);
    }

    getRulesPath(projectPath: string, global?: boolean): string {
        if (global) {
            // Global rules are in GEMINI.md
            return join(homedir(), '.gemini', 'GEMINI.md');
        }
        // Workspace rules are in .agent/rules/
        return join(projectPath, this.config.rulesPath);
    }

    getMCPConfigPath(projectPath: string, global?: boolean): string {
        if (global) {
            return this.config.mcpConfigGlobal!;
        }
        return join(projectPath, this.config.mcpConfig!);
    }
}
