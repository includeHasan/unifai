/**
 * Agent Command
 * 
 * Manage AGENT.md / agent instructions across IDEs
 * 
 * Commands:
 *   agent init   - Interactive wizard to create agent config
 *   agent show   - Display current agent configuration  
 *   agent sync   - Sync agent config to all detected IDEs
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { getInstalledAdapters, getAllAdapters, getAdapter, ADAPTER_PRIORITY } from '../adapters/index.js';
import type { AgentConfig } from '../types/config.js';
import type { AgentType } from '../types/index.js';
import { detectProject } from '../utils/project-detector.js';

export interface AgentCommandOptions {
    global?: boolean;
    ide?: string[];
    yes?: boolean;
}

/**
 * Agent init command - Interactive wizard
 */
export async function agentInit(options: AgentCommandOptions): Promise<void> {
    console.log();
    p.intro(chalk.bgCyan.black(' agent init '));

    const spinner = p.spinner();
    const cwd = process.cwd();

    // Detect project type
    spinner.start('Detecting project...');
    const project = await detectProject(cwd);
    spinner.stop(project ? `Detected: ${chalk.cyan(project.displayName)}` : 'No specific project detected');

    // Project name
    const projectName = await p.text({
        message: 'Project name',
        initialValue: project?.name || '',
        placeholder: 'my-project',
    }) as string;

    if (p.isCancel(projectName)) {
        p.cancel('Cancelled');
        return;
    }

    // Description
    const description = await p.text({
        message: 'Project description',
        placeholder: 'A brief description of your project',
    }) as string;

    if (p.isCancel(description)) {
        p.cancel('Cancelled');
        return;
    }

    // Languages
    const languagesInput = await p.text({
        message: 'Languages (comma-separated)',
        initialValue: project?.recommendedSkills.length ? '' : 'TypeScript, JavaScript',
        placeholder: 'TypeScript, Python, Go',
    }) as string;

    if (p.isCancel(languagesInput)) {
        p.cancel('Cancelled');
        return;
    }

    const languages = languagesInput.split(',').map(l => l.trim()).filter(Boolean);

    // Frameworks
    const frameworksInput = await p.text({
        message: 'Frameworks (comma-separated)',
        placeholder: 'React, Next.js, Express',
    }) as string;

    if (p.isCancel(frameworksInput)) {
        p.cancel('Cancelled');
        return;
    }

    const frameworks = frameworksInput.split(',').map(f => f.trim()).filter(Boolean);

    // Dev command
    const devCommand = await p.text({
        message: 'Dev command',
        placeholder: 'npm run dev',
    }) as string;

    if (p.isCancel(devCommand)) {
        p.cancel('Cancelled');
        return;
    }

    // Build command
    const buildCommand = await p.text({
        message: 'Build command',
        placeholder: 'npm run build',
    }) as string;

    if (p.isCancel(buildCommand)) {
        p.cancel('Cancelled');
        return;
    }

    // Test command
    const testCommand = await p.text({
        message: 'Test command',
        placeholder: 'npm test',
    }) as string;

    if (p.isCancel(testCommand)) {
        p.cancel('Cancelled');
        return;
    }

    // Coding guidelines
    const guidelinesInput = await p.text({
        message: 'Key coding guidelines (one per line, use \\n)',
        placeholder: 'Use TypeScript strict mode\\nFollow ESLint rules',
    }) as string;

    if (p.isCancel(guidelinesInput)) {
        p.cancel('Cancelled');
        return;
    }

    const guidelines = guidelinesInput.split('\\n').map(g => g.trim()).filter(Boolean);

    // Create config
    const config: AgentConfig = {
        projectName,
        description,
        languages,
        frameworks,
        techStack: [],
        devCommands: devCommand ? [devCommand] : [],
        buildCommands: buildCommand ? [buildCommand] : [],
        testCommands: testCommand ? [testCommand] : [],
        codingGuidelines: guidelines,
        architectureNotes: [],
        mcpServers: [],
    };

    // Select IDEs to sync to
    const installedAdapters = await getInstalledAdapters();

    let selectedIDEs: AgentType[];

    if (options.ide && options.ide.length > 0) {
        selectedIDEs = options.ide as AgentType[];
    } else if (installedAdapters.length > 0 && !options.yes) {
        const selected = await p.multiselect({
            message: 'Which IDEs to configure?',
            options: installedAdapters.map(a => ({
                value: a.id,
                label: a.displayName,
            })),
            initialValues: installedAdapters.map(a => a.id),
        });

        if (p.isCancel(selected)) {
            p.cancel('Cancelled');
            return;
        }

        selectedIDEs = selected as AgentType[];
    } else {
        selectedIDEs = installedAdapters.map(a => a.id);
    }

    // Sync to selected IDEs
    spinner.start('Creating agent configurations...');

    const results: { ide: string; success: boolean; files: string[] }[] = [];

    for (const ideId of selectedIDEs) {
        const adapter = getAdapter(ideId);
        if (!adapter) continue;

        try {
            const result = await adapter.sync(cwd, config, undefined, { global: options.global });
            results.push({
                ide: adapter.displayName,
                success: result.success,
                files: [...result.filesCreated, ...result.filesUpdated],
            });
        } catch (error) {
            results.push({
                ide: adapter.displayName,
                success: false,
                files: [],
            });
        }
    }

    spinner.stop('Configuration complete');

    // Show results
    console.log();
    for (const result of results) {
        if (result.success) {
            p.log.success(`${chalk.green('✓')} ${result.ide}`);
            result.files.forEach(f => p.log.message(`  ${chalk.dim(f)}`));
        } else {
            p.log.error(`${chalk.red('✗')} ${result.ide}`);
        }
    }

    console.log();
    p.outro(chalk.green('Agent configuration created!'));
}

/**
 * Agent show command - Display current configuration
 */
export async function agentShow(options: AgentCommandOptions): Promise<void> {
    console.log();
    p.intro(chalk.bgCyan.black(' agent show '));

    const cwd = process.cwd();
    const adapters = getAllAdapters();

    let found = false;

    for (const adapter of adapters) {
        const agentPath = adapter.getAgentFilePath(cwd, options.global);

        if (existsSync(agentPath)) {
            found = true;
            console.log();
            p.log.step(chalk.bold(`${adapter.displayName} (${agentPath})`));

            try {
                const content = await readFile(agentPath, 'utf-8');
                // Show first 20 lines
                const lines = content.split('\n').slice(0, 20);
                console.log(chalk.dim(lines.join('\n')));
                if (content.split('\n').length > 20) {
                    console.log(chalk.dim('... (truncated)'));
                }
            } catch {
                p.log.error('Could not read file');
            }
        }
    }

    if (!found) {
        p.log.warn('No agent configuration files found');
        p.log.info('Run `openskill-ai agent init` to create one');
    }

    console.log();
    p.outro('');
}

/**
 * Agent sync command - Sync to all IDEs
 */
export async function agentSync(options: AgentCommandOptions): Promise<void> {
    console.log();
    p.intro(chalk.bgCyan.black(' agent sync '));

    const spinner = p.spinner();
    const cwd = process.cwd();

    // Find existing AGENTS.md or similar
    spinner.start('Looking for agent configuration...');

    let config: AgentConfig | null = null;
    let sourceFile: string | null = null;

    // Check for AGENTS.md first (universal format)
    const agentsPath = join(cwd, 'AGENTS.md');
    if (existsSync(agentsPath)) {
        sourceFile = agentsPath;
        config = await parseAgentsFile(agentsPath);
    }

    // Check for CLAUDE.md
    if (!config) {
        const claudePath = join(cwd, 'CLAUDE.md');
        if (existsSync(claudePath)) {
            sourceFile = claudePath;
            config = await parseAgentsFile(claudePath);
        }
    }

    if (!config) {
        spinner.stop(chalk.yellow('No agent configuration found'));
        p.log.info('Run `openskill-ai agent init` to create one');
        p.outro('');
        return;
    }

    spinner.stop(`Found: ${chalk.cyan(sourceFile)}`);

    // Get installed adapters
    const installedAdapters = await getInstalledAdapters();

    if (installedAdapters.length === 0) {
        p.log.warn('No supported IDEs detected');
        p.outro('');
        return;
    }

    // Sync to all installed IDEs
    spinner.start('Syncing to IDEs...');

    const results: { ide: string; success: boolean }[] = [];

    for (const adapter of installedAdapters) {
        try {
            const result = await adapter.sync(cwd, config, undefined, { global: options.global });
            results.push({ ide: adapter.displayName, success: result.success });
        } catch {
            results.push({ ide: adapter.displayName, success: false });
        }
    }

    spinner.stop('Sync complete');

    // Show results
    console.log();
    for (const result of results) {
        if (result.success) {
            p.log.success(`${chalk.green('✓')} ${result.ide}`);
        } else {
            p.log.error(`${chalk.red('✗')} ${result.ide}`);
        }
    }

    console.log();
    p.outro(chalk.green('Done!'));
}

/**
 * Parse an AGENTS.md file into AgentConfig
 * This is a simplified parser - could be enhanced
 */
async function parseAgentsFile(path: string): Promise<AgentConfig> {
    const content = await readFile(path, 'utf-8');

    // Basic parsing - extract what we can
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

    // Try to extract project name from first heading
    const titleMatch = content.match(/^#\s+(.+)/m);
    if (titleMatch) {
        config.projectName = titleMatch[1].replace(/[-–—].*$/, '').trim();
    }

    // Extract code blocks as potential commands
    const codeBlockRegex = /```(?:bash|sh)?\n([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
        const commands = match[1].split('\n').filter(l => l.trim() && !l.startsWith('#'));
        config.buildCommands.push(...commands);
    }

    // Extract bullet points as potential guidelines
    const bulletRegex = /^[-*]\s+(.+)$/gm;
    while ((match = bulletRegex.exec(content)) !== null) {
        config.codingGuidelines.push(match[1]);
    }

    return config;
}

export default {
    init: agentInit,
    show: agentShow,
    sync: agentSync,
};
