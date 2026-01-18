/**
 * Base Adapter Interface
 * 
 * All IDE adapters must implement this interface to provide
 * consistent configuration generation across different AI coding assistants.
 */

import type { AgentConfig, MCPServer, RuleSet, SyncResult, IDEConfig } from '../types/config.js';
import type { AgentType, Skill } from '../types/index.js';
import { basename } from 'path';

/**
 * Abstract base class for IDE adapters
 */
export abstract class BaseAdapter {
    abstract readonly id: AgentType;
    abstract readonly name: string;
    abstract readonly displayName: string;
    abstract readonly config: IDEConfig;

    /**
     * Check if this IDE is installed/configured on the system
     */
    abstract isInstalled(): Promise<boolean>;

    /**
     * Generate agent instructions file content
     */
    abstract generateAgentFile(config: AgentConfig): Promise<string>;

    /**
     * Generate rules configuration
     */
    abstract generateRulesConfig(rules: RuleSet): Promise<string | Record<string, string>>;

    /**
     * Generate MCP configuration
     */
    abstract generateMCPConfig(servers: MCPServer[]): Promise<string>;

    /**
     * Get the path where agent file should be written
     */
    abstract getAgentFilePath(projectPath: string, global?: boolean): string;

    /**
     * Get the path where rules should be written
     */
    abstract getRulesPath(projectPath: string, global?: boolean): string;

    /**
     * Get the path where MCP config should be written
     */
    abstract getMCPConfigPath(projectPath: string, global?: boolean): string;

    /**
     * Get the path where skills should be written
     */
    getSkillsPath(projectPath: string, global?: boolean): string {
        if (global) {
            return this.config.globalSkillsDir;
        }
        return `${projectPath}/${this.config.skillsDir}`;
    }

    /**
     * Sync all configurations to this IDE
     */
    async sync(
        projectPath: string,
        config: AgentConfig,
        rules?: RuleSet,
        options?: { global?: boolean, skills?: Skill[] }
    ): Promise<SyncResult> {
        const result: SyncResult = {
            ide: this.id,
            success: true,
            filesCreated: [],
            filesUpdated: [],
            errors: [],
        };

        try {
            // Generate and write agent file
            const agentContent = await this.generateAgentFile(config);
            const agentPath = this.getAgentFilePath(projectPath, options?.global);
            await this.writeFile(agentPath, agentContent, result);

            // Generate and write rules if provided
            if (rules) {
                const rulesContent = await this.generateRulesConfig(rules);
                const rulesPath = this.getRulesPath(projectPath, options?.global);

                if (typeof rulesContent === 'string') {
                    await this.writeFile(rulesPath, rulesContent, result);
                } else {
                    // Multiple files (e.g., Cursor .mdc files)
                    for (const [filename, content] of Object.entries(rulesContent)) {
                        await this.writeFile(`${rulesPath}/${filename}`, content, result);
                    }
                }
            }

            // Generate and write MCP config if servers are configured
            if (config.mcpServers && config.mcpServers.length > 0) {
                const mcpContent = await this.generateMCPConfig(config.mcpServers);
                const mcpPath = this.getMCPConfigPath(projectPath, options?.global);
                if (mcpPath) {
                    await this.writeFile(mcpPath, mcpContent, result);
                }
            }

            // Sync skills if provided
            if (options?.skills && options.skills.length > 0) {
                const { cp } = await import('fs/promises');
                const skillsPath = this.getSkillsPath(projectPath, options.global);

                for (const skill of options.skills) {
                    const skillDest = `${skillsPath}/${basename(skill.path)}`;
                    try {
                        await cp(skill.path, skillDest, { recursive: true, force: true });
                        result.filesCreated.push(skillDest);
                    } catch (error) {
                        result.errors.push(`Failed to copy skill ${skill.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }
            }
        } catch (error) {
            result.success = false;
            result.errors.push(error instanceof Error ? error.message : 'Unknown error');
        }

        return result;
    }

    /**
     * Helper to write file and track result
     */
    protected async writeFile(
        path: string,
        content: string,
        result: SyncResult
    ): Promise<void> {
        const { mkdir, writeFile, access } = await import('fs/promises');
        const { dirname } = await import('path');

        try {
            // Ensure directory exists
            await mkdir(dirname(path), { recursive: true });

            // Check if file exists
            let exists = false;
            try {
                await access(path);
                exists = true;
            } catch {
                exists = false;
            }

            // Write file
            await writeFile(path, content, 'utf-8');

            if (exists) {
                result.filesUpdated.push(path);
            } else {
                result.filesCreated.push(path);
            }
        } catch (error) {
            result.errors.push(`Failed to write ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

/**
 * Adapter registry type
 */
export type AdapterRegistry = Map<AgentType, BaseAdapter>;
