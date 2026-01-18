/**
 * GitHub Copilot Adapter
 * 
 * Generates configuration for GitHub Copilot
 * - .github/copilot-instructions.md for repository-wide instructions
 * - .github/instructions/*.md for path-specific instructions
 */

import { BaseAdapter } from './base.js';
import type { AgentConfig, MCPServer, RuleSet, IDEConfig } from '../types/config.js';
import type { AgentType } from '../types/index.js';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

export class CopilotAdapter extends BaseAdapter {
    readonly id: AgentType = 'github-copilot';
    readonly name = 'github-copilot';
    readonly displayName = 'GitHub Copilot';

    readonly config: IDEConfig = {
        id: 'github-copilot',
        name: 'github-copilot',
        displayName: 'GitHub Copilot',
        agentFile: '.github/copilot-instructions.md',
        agentFileGlobal: join(homedir(), '.copilot', 'instructions.md'),
        rulesPath: '.github/instructions',
        rulesFormat: 'markdown',
        skillsDir: '.github/skills',
        globalSkillsDir: join(homedir(), '.copilot', 'skills'),
        // Note: Copilot doesn't have MCP support yet
        mcpConfig: undefined,
        mcpConfigGlobal: undefined,
    };

    async isInstalled(): Promise<boolean> {
        // Check for GitHub CLI or Copilot extension markers
        return existsSync(join(homedir(), '.copilot')) ||
            existsSync(join(process.cwd(), '.github'));
    }

    async generateAgentFile(config: AgentConfig): Promise<string> {
        const sections: string[] = [];

        // Header comment explaining this file
        sections.push('# GitHub Copilot Instructions');
        sections.push('');
        sections.push('> These instructions guide GitHub Copilot in this repository.');
        sections.push('');

        // Project Overview
        if (config.projectName || config.description) {
            sections.push('## Project Overview');
            sections.push('');
            if (config.projectName) {
                sections.push(`**Project:** ${config.projectName}`);
            }
            if (config.description) {
                sections.push('');
                sections.push(config.description);
            }
            sections.push('');
        }

        // Tech Stack
        if (config.languages.length > 0 || config.frameworks.length > 0) {
            sections.push('## Technology Stack');
            sections.push('');
            if (config.languages.length > 0) {
                sections.push(`- **Languages:** ${config.languages.join(', ')}`);
            }
            if (config.frameworks.length > 0) {
                sections.push(`- **Frameworks:** ${config.frameworks.join(', ')}`);
            }
            if (config.techStack.length > 0) {
                sections.push(`- **Other:** ${config.techStack.join(', ')}`);
            }
            sections.push('');
        }

        // Coding Standards
        if (config.codingGuidelines.length > 0) {
            sections.push('## Coding Standards');
            sections.push('');
            config.codingGuidelines.forEach(guideline => {
                sections.push(`- ${guideline}`);
            });
            sections.push('');
        }

        // Architecture Notes
        if (config.architectureNotes.length > 0) {
            sections.push('## Architecture');
            sections.push('');
            config.architectureNotes.forEach(note => {
                sections.push(`- ${note}`);
            });
            sections.push('');
        }

        // Development Commands
        if (config.devCommands.length > 0 || config.buildCommands.length > 0 || config.testCommands.length > 0) {
            sections.push('## Development Workflow');
            sections.push('');

            if (config.devCommands.length > 0) {
                sections.push('### Running Locally');
                sections.push('```bash');
                config.devCommands.forEach(cmd => sections.push(cmd));
                sections.push('```');
                sections.push('');
            }

            if (config.buildCommands.length > 0) {
                sections.push('### Building');
                sections.push('```bash');
                config.buildCommands.forEach(cmd => sections.push(cmd));
                sections.push('```');
                sections.push('');
            }

            if (config.testCommands.length > 0) {
                sections.push('### Testing');
                sections.push('```bash');
                config.testCommands.forEach(cmd => sections.push(cmd));
                sections.push('```');
                sections.push('');
            }
        }

        return sections.join('\n');
    }

    async generateRulesConfig(rules: RuleSet): Promise<Record<string, string>> {
        // Copilot uses .github/instructions/*.md files with YAML frontmatter
        const files: Record<string, string> = {};

        // Generate global rules as main instructions
        if (rules.global.length > 0) {
            const content = this.generateInstructionFile(
                'Global coding guidelines',
                rules.global.map(r => r.content)
            );
            files['global.instructions.md'] = content;
        }

        // Generate path-specific instruction files
        for (const pathRule of rules.pathSpecific) {
            const safeName = pathRule.pattern.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
            const content = this.generateInstructionFile(
                `Instructions for ${pathRule.pattern}`,
                pathRule.rules.map(r => r.content),
                pathRule.pattern
            );
            files[`${safeName}.instructions.md`] = content;
        }

        return files;
    }

    private generateInstructionFile(description: string, rules: string[], applyTo?: string): string {
        const lines: string[] = [];

        // YAML frontmatter
        lines.push('---');
        if (applyTo) {
            lines.push(`applyTo: "${applyTo}"`);
        }
        lines.push('---');
        lines.push('');

        // Description
        lines.push(`# ${description}`);
        lines.push('');

        // Rules as bullet points
        rules.forEach(rule => {
            lines.push(`- ${rule}`);
        });

        return lines.join('\n');
    }

    async generateMCPConfig(_servers: MCPServer[]): Promise<string> {
        // GitHub Copilot doesn't support MCP yet
        return '{}';
    }

    getAgentFilePath(projectPath: string, global?: boolean): string {
        if (global) {
            return this.config.agentFileGlobal!;
        }
        return join(projectPath, this.config.agentFile);
    }

    getRulesPath(projectPath: string, global?: boolean): string {
        if (global) {
            return join(homedir(), '.copilot', 'instructions');
        }
        return join(projectPath, this.config.rulesPath);
    }

    getMCPConfigPath(_projectPath: string, _global?: boolean): string {
        // Copilot doesn't support MCP
        return '';
    }
}
