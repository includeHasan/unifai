/**
 * MCP Command
 * 
 * Manage Model Context Protocol server configurations
 * 
 * Commands:
 *   mcp init   - Initialize MCP configuration
 *   mcp add    - Add an MCP server
 *   mcp list   - List configured MCP servers
 *   mcp sync   - Sync MCP config to all IDEs
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { getInstalledAdapters, getAdapter } from '../adapters/index.js';
import type { MCPServer } from '../types/config.js';
import type { AgentType } from '../types/index.js';

export interface MCPCommandOptions {
    global?: boolean;
    ide?: string[];
    yes?: boolean;
}

/**
 * Default MCP config file name
 */
const MCP_CONFIG_FILE = 'mcp.json';

/**
 * MCP init command
 */
export async function mcpInit(options: MCPCommandOptions): Promise<void> {
    console.log();
    p.intro(chalk.bgMagenta.black(' mcp init '));

    const cwd = process.cwd();
    const configPath = options.global
        ? join(homedir(), '.config', 'mcp', MCP_CONFIG_FILE)
        : join(cwd, '.mcp', MCP_CONFIG_FILE);

    if (existsSync(configPath)) {
        const overwrite = await p.confirm({
            message: 'MCP config already exists. Overwrite?',
            initialValue: false,
        });

        if (p.isCancel(overwrite) || !overwrite) {
            p.cancel('Cancelled');
            return;
        }
    }

    // Create initial config
    const config = {
        mcpServers: {},
    };

    // Write config
    await mkdir(dirname(configPath), { recursive: true });
    await writeFile(configPath, JSON.stringify(config, null, 2));

    p.log.success(`Created ${chalk.cyan(configPath)}`);
    p.log.info('Use `openskill-ai mcp add` to add MCP servers');

    console.log();
    p.outro(chalk.green('MCP configuration initialized!'));
}

/**
 * MCP add command
 */
export async function mcpAdd(options: MCPCommandOptions): Promise<void> {
    console.log();
    p.intro(chalk.bgMagenta.black(' mcp add '));

    // Get server details
    const name = await p.text({
        message: 'Server name (unique identifier)',
        placeholder: 'my-mcp-server',
        validate: (v) => v.length === 0 ? 'Name is required' : undefined,
    }) as string;

    if (p.isCancel(name)) {
        p.cancel('Cancelled');
        return;
    }

    const displayName = await p.text({
        message: 'Display name (optional)',
        placeholder: 'My MCP Server',
    }) as string;

    if (p.isCancel(displayName)) {
        p.cancel('Cancelled');
        return;
    }

    const command = await p.text({
        message: 'Command to run',
        placeholder: 'npx -y @anthropic/mcp-server-filesystem',
        validate: (v) => v.length === 0 ? 'Command is required' : undefined,
    }) as string;

    if (p.isCancel(command)) {
        p.cancel('Cancelled');
        return;
    }

    const argsInput = await p.text({
        message: 'Arguments (space-separated)',
        placeholder: '. --allow-read',
    }) as string;

    if (p.isCancel(argsInput)) {
        p.cancel('Cancelled');
        return;
    }

    const args = argsInput ? argsInput.split(' ').filter(Boolean) : [];

    const envInput = await p.text({
        message: 'Environment variables (KEY=value, comma-separated)',
        placeholder: 'API_KEY=${API_KEY}, DEBUG=true',
    }) as string;

    if (p.isCancel(envInput)) {
        p.cancel('Cancelled');
        return;
    }

    const env: Record<string, string> = {};
    if (envInput) {
        envInput.split(',').forEach(pair => {
            const [key, value] = pair.split('=').map(s => s.trim());
            if (key && value) {
                env[key] = value;
            }
        });
    }

    const description = await p.text({
        message: 'Description (optional)',
        placeholder: 'What does this server do?',
    }) as string;

    if (p.isCancel(description)) {
        p.cancel('Cancelled');
        return;
    }

    // Create server config
    const server: MCPServer = {
        name,
        displayName: displayName || undefined,
        command,
        args: args.length > 0 ? args : undefined,
        env: Object.keys(env).length > 0 ? env : undefined,
        description: description || undefined,
    };

    // Load existing config
    const cwd = process.cwd();
    const configPath = options.global
        ? join(homedir(), '.config', 'mcp', MCP_CONFIG_FILE)
        : join(cwd, '.mcp', MCP_CONFIG_FILE);

    let config: { mcpServers: Record<string, unknown> } = { mcpServers: {} };

    if (existsSync(configPath)) {
        try {
            const content = await readFile(configPath, 'utf-8');
            config = JSON.parse(content);
        } catch {
            // Use default
        }
    }

    // Add server
    config.mcpServers[name] = {
        command: server.command,
        args: server.args,
        env: server.env,
    };

    // Save config
    await mkdir(dirname(configPath), { recursive: true });
    await writeFile(configPath, JSON.stringify(config, null, 2));

    p.log.success(`Added ${chalk.cyan(name)} to MCP config`);

    // Offer to sync to IDEs
    if (!options.yes) {
        const sync = await p.confirm({
            message: 'Sync to detected IDEs?',
            initialValue: true,
        });

        if (!p.isCancel(sync) && sync) {
            await mcpSync(options);
            return;
        }
    }

    console.log();
    p.outro(chalk.green('MCP server added!'));
}

/**
 * MCP list command
 */
export async function mcpList(options: MCPCommandOptions): Promise<void> {
    console.log();
    p.intro(chalk.bgMagenta.black(' mcp list '));

    const cwd = process.cwd();
    const configPath = options.global
        ? join(homedir(), '.config', 'mcp', MCP_CONFIG_FILE)
        : join(cwd, '.mcp', MCP_CONFIG_FILE);

    if (!existsSync(configPath)) {
        p.log.warn('No MCP configuration found');
        p.log.info('Run `openskill-ai mcp init` to create one');
        p.outro('');
        return;
    }

    try {
        const content = await readFile(configPath, 'utf-8');
        const config = JSON.parse(content);

        const servers = Object.entries(config.mcpServers || {});

        if (servers.length === 0) {
            p.log.info('No MCP servers configured');
            p.log.info('Run `openskill-ai mcp add` to add servers');
        } else {
            console.log();
            p.log.step(chalk.bold(`Configured MCP Servers (${servers.length})`));
            console.log();

            for (const [name, serverConfig] of servers) {
                const sc = serverConfig as { command: string; args?: string[]; env?: Record<string, string> };
                console.log(`  ${chalk.cyan(name)}`);
                console.log(`    ${chalk.dim('Command:')} ${sc.command}`);
                if (sc.args && sc.args.length > 0) {
                    console.log(`    ${chalk.dim('Args:')} ${sc.args.join(' ')}`);
                }
                if (sc.env && Object.keys(sc.env).length > 0) {
                    console.log(`    ${chalk.dim('Env:')} ${Object.keys(sc.env).join(', ')}`);
                }
                console.log();
            }
        }
    } catch (error) {
        p.log.error('Failed to read MCP config');
    }

    console.log();
    p.outro('');
}

/**
 * MCP sync command
 */
export async function mcpSync(options: MCPCommandOptions): Promise<void> {
    console.log();
    p.intro(chalk.bgMagenta.black(' mcp sync '));

    const spinner = p.spinner();
    const cwd = process.cwd();

    // Load MCP config
    const configPath = options.global
        ? join(homedir(), '.config', 'mcp', MCP_CONFIG_FILE)
        : join(cwd, '.mcp', MCP_CONFIG_FILE);

    if (!existsSync(configPath)) {
        p.log.warn('No MCP configuration found');
        p.log.info('Run `openskill-ai mcp init` to create one');
        p.outro('');
        return;
    }

    spinner.start('Loading MCP configuration...');

    let servers: MCPServer[] = [];

    try {
        const content = await readFile(configPath, 'utf-8');
        const config = JSON.parse(content);

        servers = Object.entries(config.mcpServers || {}).map(([name, sc]) => {
            const serverConfig = sc as { command: string; args?: string[]; env?: Record<string, string> };
            return {
                name,
                command: serverConfig.command,
                args: serverConfig.args,
                env: serverConfig.env,
            };
        });
    } catch {
        spinner.stop(chalk.red('Failed to load MCP config'));
        p.outro('');
        return;
    }

    if (servers.length === 0) {
        spinner.stop('No MCP servers to sync');
        p.outro('');
        return;
    }

    spinner.stop(`Found ${servers.length} MCP servers`);

    // Get installed adapters
    const installedAdapters = await getInstalledAdapters();

    if (installedAdapters.length === 0) {
        p.log.warn('No supported IDEs detected');
        p.outro('');
        return;
    }

    // Sync to each IDE
    spinner.start('Syncing MCP config to IDEs...');

    const results: { ide: string; success: boolean; path?: string }[] = [];

    for (const adapter of installedAdapters) {
        try {
            const mcpContent = await adapter.generateMCPConfig(servers);
            const mcpPath = adapter.getMCPConfigPath(cwd, options.global);

            if (mcpPath && mcpContent !== '{}') {
                await mkdir(dirname(mcpPath), { recursive: true });
                await writeFile(mcpPath, mcpContent);
                results.push({ ide: adapter.displayName, success: true, path: mcpPath });
            } else {
                results.push({ ide: adapter.displayName, success: false });
            }
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
            if (result.path) {
                p.log.message(`  ${chalk.dim(result.path)}`);
            }
        } else {
            p.log.warn(`${chalk.yellow('○')} ${result.ide} (not supported or failed)`);
        }
    }

    console.log();
    p.outro(chalk.green('MCP sync complete!'));
}

export default {
    init: mcpInit,
    add: mcpAdd,
    list: mcpList,
    sync: mcpSync,
};
