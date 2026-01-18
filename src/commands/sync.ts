/**
 * Sync Command
 * 
 * Universal sync command to synchronize all configurations
 * across all detected AI IDEs.
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { getInstalledAdapters, getAllAdapters } from '../adapters/index.js';
import type { AgentConfig, RuleSet } from '../types/config.js';
import { discoverSkills } from '../utils/skills.js';
import type { Skill } from '../types/index.js';

export interface SyncCommandOptions {
    global?: boolean;
    agent?: boolean;
    rules?: boolean;
    mcp?: boolean;
    skills?: boolean;
    ide?: string[];
}

/**
 * Universal sync command
 */
export async function syncCommand(options: SyncCommandOptions): Promise<void> {
    console.log();
    p.intro(chalk.bgBlue.white(' sync '));

    const spinner = p.spinner();
    const cwd = process.cwd();

    // Determine what to sync (default: everything)
    const syncAgent = options.agent ?? true;
    const syncRules = options.rules ?? true;
    const syncMcp = options.mcp ?? true;
    const syncSkills = options.skills ?? true;

    // Load configurations
    spinner.start('Loading configurations...');

    // Try to find agent config
    let agentConfig: AgentConfig | null = null;
    const agentSources = ['AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md'];

    for (const source of agentSources) {
        const path = join(cwd, source);
        if (existsSync(path)) {
            try {
                agentConfig = await parseAgentFile(path);
                break;
            } catch {
                // Continue to next source
            }
        }
    }

    // Try to find MCP config
    let mcpServers: Array<{
        name: string;
        type: 'command' | 'http';
        command?: string;
        args?: string[];
        env?: Record<string, string>;
        url?: string;
        headers?: Record<string, string>;
    }> = [];
    const mcpSources = ['.mcp/mcp.json', '.claude/mcp.json', '.cursor/mcp.json'];

    for (const source of mcpSources) {
        const path = join(cwd, source);
        if (existsSync(path)) {
            try {
                const content = await readFile(path, 'utf-8');
                const config = JSON.parse(content);
                mcpServers = Object.entries(config.mcpServers || {}).map(([name, sc]) => {
                    const serverConfig = sc as {
                        type?: 'command' | 'http';
                        command?: string;
                        args?: string[];
                        env?: Record<string, string>;
                        url?: string;
                        headers?: Record<string, string>;
                    };
                    return {
                        name,
                        type: serverConfig.type || 'command',
                        command: serverConfig.command,
                        args: serverConfig.args,
                        env: serverConfig.env,
                        url: serverConfig.url,
                        headers: serverConfig.headers,
                    };
                });
                break;
            } catch {
                // Continue to next source
            }
        }
    }

    // Try to find Rules
    let ruleSet: RuleSet = { global: [], pathSpecific: [] };
    const ruleSources = [
        '.agent/rules',
        '.claude/rules',
        '.cursor/rules',
        '.gemini/rules'
    ];

    for (const source of ruleSources) {
        const path = join(cwd, source);
        if (existsSync(path)) {
            try {
                const { readdir, readFile } = await import('fs/promises');
                const files = await readdir(path);
                for (const file of files) {
                    if (file.endsWith('.md')) {
                        const content = await readFile(join(path, file), 'utf-8');
                        if (file === 'global.md') {
                            ruleSet.global.push({ content });
                        } else {
                            // Assume filename is the pattern or just a name
                            const pattern = file.replace('.md', '');
                            ruleSet.pathSpecific.push({
                                pattern: pattern === 'rules' ? '*' : pattern,
                                rules: [{ content }]
                            });
                        }
                    }
                }
            } catch {
                // Ignore errors
            }
        }
    }

    // Special case for .cursorrules
    const cursorRulesPath = join(cwd, '.cursorrules');
    if (existsSync(cursorRulesPath)) {
        try {
        } catch { }
    }

    // Try to find Skills
    let skills: Skill[] = [];
    if (syncSkills) {
        try {
            skills = await discoverSkills(cwd);
        } catch {
            // Ignore errors
        }
    }

    spinner.stop('Configurations loaded');

    // Summary of what we found
    console.log();
    const hasRules = ruleSet.global.length > 0 || ruleSet.pathSpecific.length > 0;
    p.log.step(chalk.bold('Found:'));
    p.log.message(`  Agent config: ${agentConfig ? chalk.green('Yes') : chalk.yellow('No')}`);
    p.log.message(`  MCP servers: ${mcpServers.length > 0 ? chalk.green(mcpServers.length.toString()) : chalk.yellow('0')}`);
    p.log.message(`  Rules discovered: ${hasRules ? chalk.green('Yes') : chalk.yellow('No')}`);
    p.log.message(`  Skills discovered: ${skills.length > 0 ? chalk.green(skills.length.toString()) : chalk.yellow('0')}`);
    console.log();

    if (!agentConfig && mcpServers.length === 0 && !hasRules && skills.length === 0) {
        p.log.warn('No configurations found to sync');
        p.log.info('Run `unifai agent init` to create agent config');
        p.log.info('Run `unifai mcp init` to create MCP config');
        p.outro('');
        return;
    }

    // Get installed adapters
    const installedAdapters = await getInstalledAdapters();

    if (installedAdapters.length === 0) {
        p.log.warn('No supported IDEs detected');
        p.outro('');
        return;
    }

    p.log.step(chalk.bold(`Detected IDEs (${installedAdapters.length}):`));
    installedAdapters.forEach(a => p.log.message(`  ${chalk.cyan(a.displayName)}`));
    console.log();

    // Sync to all IDEs
    spinner.start('Syncing to all IDEs...');

    const results: Array<{
        ide: string;
        agentSuccess?: boolean;
        mcpSuccess?: boolean;
        files: string[];
        errors: string[];
    }> = [];

    for (const adapter of installedAdapters) {
        const result: typeof results[0] = {
            ide: adapter.displayName,
            files: [],
            errors: [],
        };

        try {
            // Prepare config with discovered MCP servers
            const syncConfig: AgentConfig = agentConfig || {
                projectName: undefined,
                description: undefined,
                languages: [],
                frameworks: [],
                techStack: [],
                devCommands: [],
                buildCommands: [],
                testCommands: [],
                codingGuidelines: [],
                architectureNotes: [],
                mcpServers: [],
            };

            if (syncMcp && mcpServers.length > 0) {
                syncConfig.mcpServers = mcpServers as any;
            }

            // Sync everything via adapter
            if (syncAgent || syncRules || syncMcp || syncSkills) {
                const syncResult = await adapter.sync(cwd, syncConfig, syncRules ? ruleSet : undefined, {
                    global: options.global,
                    skills: syncSkills ? skills : undefined
                });

                result.agentSuccess = syncResult.success;
                result.mcpSuccess = syncMcp && mcpServers.length > 0;
                result.files.push(...syncResult.filesCreated, ...syncResult.filesUpdated);
                result.errors.push(...syncResult.errors);
            }
        } catch (error) {
            result.errors.push(error instanceof Error ? error.message : 'Unknown error');
        }

        results.push(result);
    }

    spinner.stop('Sync complete');

    // Show results
    console.log();
    p.log.step(chalk.bold('Results:'));
    console.log();

    for (const result of results) {
        const hasSuccess = result.agentSuccess || result.mcpSuccess;
        const hasErrors = result.errors.length > 0;

        if (hasSuccess && !hasErrors) {
            p.log.success(`${chalk.green('✓')} ${result.ide}`);
        } else if (hasErrors) {
            p.log.error(`${chalk.red('✗')} ${result.ide}`);
        } else {
            p.log.message(`${chalk.yellow('○')} ${result.ide} (nothing to sync)`);
        }

        // Show files
        for (const file of result.files) {
            p.log.message(`  ${chalk.dim('→')} ${chalk.dim(file)}`);
        }

        // Show errors
        for (const error of result.errors) {
            p.log.message(`  ${chalk.red(error)}`);
        }
    }

    // Summary
    console.log();
    const successCount = results.filter(r => r.agentSuccess || r.mcpSuccess).length;
    const totalFiles = results.reduce((sum, r) => sum + r.files.length, 0);

    p.outro(chalk.green(`Synced to ${successCount} IDEs (${totalFiles} files)`));
}

/**
 * Parse agent file into AgentConfig
 */
async function parseAgentFile(path: string): Promise<AgentConfig> {
    const content = await readFile(path, 'utf-8');

    const config: AgentConfig = {
        projectName: undefined,
        description: undefined,
        languages: [],
        frameworks: [],
        techStack: [],
        devCommands: [],
        buildCommands: [],
        testCommands: [],
        codingGuidelines: [],
        architectureNotes: [],
        mcpServers: [],
    };

    // Extract title
    const titleMatch = content.match(/^#\s+(.+)/m);
    if (titleMatch) {
        config.projectName = titleMatch[1].replace(/[-–—].*$/, '').trim();
    }

    // Extract description (first paragraph after title)
    const descMatch = content.match(/^#.+\n+([^#\n].+)/m);
    if (descMatch) {
        config.description = descMatch[1].trim();
    }

    // Extract code blocks as commands
    const codeBlockRegex = /```(?:bash|sh)?\n([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
        const commands = match[1].split('\n').filter(l => l.trim() && !l.startsWith('#'));
        config.buildCommands.push(...commands);
    }

    // Extract bullet points as guidelines
    const bulletRegex = /^[-*]\s+(.+)$/gm;
    while ((match = bulletRegex.exec(content)) !== null) {
        config.codingGuidelines.push(match[1]);
    }

    return config;
}

export default syncCommand;
