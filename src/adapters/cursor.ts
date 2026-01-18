/**
 * Cursor Adapter
 * 
 * Generates configuration for Cursor AI IDE
 * - AGENTS.md or .cursorrules for agent instructions
 * - .cursor/rules/*.mdc for structured rules
 * - ~/.cursor/mcp.json for MCP servers
 */

import { BaseAdapter } from './base.js';
import type { AgentConfig, MCPServer, RuleSet, IDEConfig } from '../types/config.js';
import type { AgentType } from '../types/index.js';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

export class CursorAdapter extends BaseAdapter {
    readonly id: AgentType = 'cursor';
    readonly name = 'cursor';
    readonly displayName = 'Cursor';

    readonly config: IDEConfig = {
        id: 'cursor',
        name: 'cursor',
        displayName: 'Cursor',
        agentFile: 'AGENTS.md',
        agentFileGlobal: join(homedir(), '.cursor', 'AGENTS.md'),
        rulesPath: '.cursor/rules',
        rulesFormat: 'mdc',
        skillsDir: '.cursor/skills',
        globalSkillsDir: join(homedir(), '.cursor', 'skills'),
        mcpConfig: '.cursor/mcp.json',
        mcpConfigGlobal: join(homedir(), '.cursor', 'mcp.json'),
        mcpFormat: 'json',
    };

    async isInstalled(): Promise<boolean> {
        return existsSync(join(homedir(), '.cursor'));
    }

    async generateAgentFile(config: AgentConfig): Promise<string> {
        // Import prompts dynamically to avoid circular dependencies
        const { DEFAULT_AGENT_INTRO, getPromptForTechStack } = await import('../data/prompts.js');

        const sections: string[] = [];

        // Header
        sections.push(`# ${config.projectName || 'Project'} - Agent Instructions\n`);

        // Description
        if (config.description) {
            sections.push(`${config.description}\n`);
        }

        // Default behavior intro (the copy-paste template)
        sections.push(DEFAULT_AGENT_INTRO);

        // Tech Stack
        if (config.languages.length > 0 || config.frameworks.length > 0 || config.techStack.length > 0) {
            sections.push('## Tech Stack\n');
            const stack = [...config.languages, ...config.frameworks, ...config.techStack];
            sections.push(stack.join(', '));
            sections.push('');
        }

        // Tech-specific guidelines
        const allTech = [...config.languages, ...config.frameworks, ...config.techStack];
        const techPrompts = getPromptForTechStack(allTech);
        if (techPrompts) {
            sections.push(techPrompts);
        }

        // Commands
        if (config.devCommands.length > 0 || config.buildCommands.length > 0 || config.testCommands.length > 0) {
            sections.push('## Commands\n');

            const allCommands = [
                ...config.devCommands.map(c => `# Dev: ${c}`),
                ...config.buildCommands.map(c => `# Build: ${c}`),
                ...config.testCommands.map(c => `# Test: ${c}`),
            ];

            sections.push('```bash');
            allCommands.forEach(cmd => sections.push(cmd));
            sections.push('```\n');
        }

        // Architecture
        if (config.architectureNotes.length > 0) {
            sections.push('## Architecture\n');
            config.architectureNotes.forEach(note => sections.push(`- ${note}`));
            sections.push('');
        }

        // Guidelines
        if (config.codingGuidelines.length > 0) {
            sections.push('## Guidelines\n');
            config.codingGuidelines.forEach(guideline => sections.push(`- ${guideline}`));
            sections.push('');
        }

        return sections.join('\n');
    }

    async generateRulesConfig(rules: RuleSet): Promise<Record<string, string>> {
        // Cursor uses .mdc files in .cursor/rules/ directory
        const files: Record<string, string> = {};

        // Generate global rules file
        if (rules.global.length > 0) {
            const globalContent = this.generateMDCFile('Global Rules', rules.global.map(r => r.content));
            files['global.mdc'] = globalContent;
        }

        // Generate path-specific rules files
        for (const pathRule of rules.pathSpecific) {
            const safeName = pathRule.pattern.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
            const content = this.generateMDCFile(
                `Rules for ${pathRule.pattern}`,
                pathRule.rules.map(r => r.content),
                pathRule.pattern
            );
            files[`${safeName}.mdc`] = content;
        }

        return files;
    }

    private generateMDCFile(description: string, rules: string[], glob?: string): string {
        const lines: string[] = [];

        // Frontmatter
        lines.push('---');
        lines.push(`description: ${description}`);
        if (glob) {
            lines.push(`globs: ${glob}`);
        }
        lines.push('---');
        lines.push('');

        // Rules content
        rules.forEach(rule => {
            lines.push(`- ${rule}`);
        });

        return lines.join('\n');
    }

    async generateMCPConfig(servers: MCPServer[]): Promise<string> {
        const mcpConfig: Record<string, unknown> = {
            mcpServers: {},
        };

        for (const server of servers) {
            if (server.type === 'http') {
                (mcpConfig.mcpServers as Record<string, unknown>)[server.name] = {
                    type: 'sse',
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
            return join(homedir(), '.cursor', 'rules');
        }
        return join(projectPath, this.config.rulesPath);
    }

    getMCPConfigPath(projectPath: string, global?: boolean): string {
        if (global) {
            return this.config.mcpConfigGlobal!;
        }
        return join(projectPath, this.config.mcpConfig!);
    }

    /**
     * Also generate legacy .cursorrules file for backward compatibility
     */
    async generateLegacyCursorRules(config: AgentConfig): Promise<string> {
        const lines: string[] = [];

        lines.push(`# Cursor Rules for ${config.projectName || 'Project'}`);
        lines.push('');

        if (config.codingGuidelines.length > 0) {
            config.codingGuidelines.forEach(g => lines.push(g));
        }

        return lines.join('\n');
    }
}
