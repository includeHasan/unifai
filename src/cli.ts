#!/usr/bin/env bun

import { program } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { detectInstalledAgents, agents } from './utils/agents.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Cross-runtime __dirname support
const __dirname = typeof import.meta.dir === 'string'
    ? import.meta.dir
    : dirname(fileURLToPath(import.meta.url));

// Read version from package.json with cross-runtime support
// Fallback version for standalone binaries where package.json may not be accessible
const FALLBACK_VERSION = '1.0.1';
let version: string = FALLBACK_VERSION;

try {
    const packageJsonPath = join(__dirname, '../package.json');
    if (typeof Bun !== 'undefined') {
        // Bun runtime - use Bun.file for better performance
        const packageJson = await Bun.file(packageJsonPath).json();
        version = packageJson.version;
    } else {
        // Node.js runtime fallback
        const { readFile } = await import('fs/promises');
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
        version = packageJson.version;
    }
} catch {
    // Use fallback version (standalone binary or missing package.json)
}

interface Options {
    global?: boolean;
    yes?: boolean;
}

program
    .name('unifai')
    .description('Universal AI IDE Configuration & Sync tool')
    .version(version)
    .configureOutput({
        outputError: (str, write) => {
            write(str);
        }
    });

// Add list-agents command
program
    .command('list-agents')
    .description('List all supported AI coding agents')
    .action(() => {
        console.log();
        console.log(chalk.bold('Supported AI Coding Agents:'));
        console.log();
        Object.entries(agents).forEach(([id, config]) => {
            console.log(`  ${chalk.cyan(id.padEnd(18))} ${chalk.dim(config.displayName)}`);
            console.log(`    ${chalk.gray(`Project: ${config.skillsDir}`)}`);
            console.log(`    ${chalk.gray(`Global:  ${config.globalSkillsDir}`)}`);
        });
        console.log();
    });

// Add init command
program
    .command('init')
    .description('Initialize agent configuration with smart project detection')
    .option('-y, --yes', 'Skip confirmation prompts')
    .option('-g, --global', 'Install globally')
    .action(async (options) => {
        const { initCommand } = await import('./commands/init.js');
        await initCommand(options);
    });



// Add agent command group
const agentCmd = program
    .command('agent')
    .description('Manage AGENT.md / agent instructions across IDEs');

agentCmd
    .command('init')
    .description('Interactive wizard to create agent configuration')
    .option('-g, --global', 'Create global configuration')
    .option('-i, --ide <ides...>', 'Specify IDEs to configure')
    .option('-y, --yes', 'Skip confirmation prompts')
    .action(async (options) => {
        const { agentInit } = await import('./commands/agent.js');
        await agentInit(options);
    });

agentCmd
    .command('show')
    .description('Display current agent configuration')
    .option('-g, --global', 'Show global configuration')
    .action(async (options) => {
        const { agentShow } = await import('./commands/agent.js');
        await agentShow(options);
    });

agentCmd
    .command('sync')
    .description('Sync agent config to all detected IDEs')
    .option('-g, --global', 'Sync global configuration')
    .action(async (options) => {
        const { agentSync } = await import('./commands/agent.js');
        await agentSync(options);
    });

// Add mcp command group
const mcpCmd = program
    .command('mcp')
    .description('Manage MCP (Model Context Protocol) server configurations');

mcpCmd
    .command('init')
    .description('Initialize MCP configuration')
    .option('-g, --global', 'Create global configuration')
    .action(async (options) => {
        const { mcpInit } = await import('./commands/mcp.js');
        await mcpInit(options);
    });

mcpCmd
    .command('add')
    .description('Add an MCP server')
    .option('-g, --global', 'Add to global configuration')
    .option('-y, --yes', 'Skip confirmation prompts')
    .action(async (options) => {
        const { mcpAdd } = await import('./commands/mcp.js');
        await mcpAdd(options);
    });

mcpCmd
    .command('list')
    .description('List configured MCP servers')
    .option('-g, --global', 'List global configuration')
    .action(async (options) => {
        const { mcpList } = await import('./commands/mcp.js');
        await mcpList(options);
    });

mcpCmd
    .command('sync')
    .description('Sync MCP config to all detected IDEs')
    .option('-g, --global', 'Sync global configuration')
    .action(async (options) => {
        const { mcpSync } = await import('./commands/mcp.js');
        await mcpSync(options);
    });

// Add rules command group
const rulesCmd = program
    .command('rules')
    .description('Manage AI coding rules across IDEs');

rulesCmd
    .command('init')
    .description('Initialize rules configuration')
    .action(async () => {
        const { rulesCommand } = await import('./commands/rules.js');
        await rulesCommand('init', [], {});
    });

rulesCmd
    .command('add [template]')
    .description('Add rules (from template or interactively)')
    .action(async (template: string | undefined) => {
        const { rulesCommand } = await import('./commands/rules.js');
        await rulesCommand('add', template ? [template] : [], {});
    });

rulesCmd
    .command('list')
    .description('List all configured rules')
    .action(async () => {
        const { rulesCommand } = await import('./commands/rules.js');
        await rulesCommand('list', [], {});
    });

rulesCmd
    .command('remove')
    .description('Remove rules')
    .action(async () => {
        const { rulesCommand } = await import('./commands/rules.js');
        await rulesCommand('remove', [], {});
    });

rulesCmd
    .command('sync')
    .description('Sync rules to all detected IDEs')
    .option('-g, --global', 'Sync to global configuration')
    .option('--ide <ide>', 'Sync to specific IDE only')
    .action(async (options) => {
        const { rulesCommand } = await import('./commands/rules.js');
        await rulesCommand('sync', [], options);
    });

rulesCmd
    .command('templates')
    .description('Show available rule templates')
    .action(async () => {
        const { rulesCommand } = await import('./commands/rules.js');
        await rulesCommand('templates', [], {});
    });

// Add universal sync command
program
    .command('sync')
    .description('Sync all configurations to all detected IDEs')
    .option('-g, --global', 'Sync global configurations')
    .option('--agent', 'Only sync agent configuration')
    .option('--mcp', 'Only sync MCP configuration')
    .option('--rules', 'Only sync rules')
    .option('--skills', 'Only sync skills')
    .action(async (options) => {
        const syncCommand = (await import('./commands/sync.js')).default;
        await syncCommand(options);
    });

// Parse CLI arguments
program.parse();
