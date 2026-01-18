/**
 * Adapter Registry
 * 
 * Exports all available IDE adapters and provides utility functions
 * to work with them.
 */

import { BaseAdapter, type AdapterRegistry } from './base.js';
import { ClaudeCodeAdapter } from './claude.js';
import { OpenCodeAdapter } from './opencode.js';
import { CursorAdapter } from './cursor.js';
import { CopilotAdapter } from './copilot.js';
import type { AgentType } from '../types/index.js';

// Export all adapters
export { BaseAdapter } from './base.js';
export { ClaudeCodeAdapter } from './claude.js';
export { OpenCodeAdapter } from './opencode.js';
export { CursorAdapter } from './cursor.js';
export { CopilotAdapter } from './copilot.js';

// Create singleton instances
const claudeAdapter = new ClaudeCodeAdapter();
const openCodeAdapter = new OpenCodeAdapter();
const cursorAdapter = new CursorAdapter();
const copilotAdapter = new CopilotAdapter();

/**
 * Registry of all available adapters
 */
export const adapterRegistry: Map<AgentType, BaseAdapter> = new Map([
    ['claude-code', claudeAdapter],
    ['opencode', openCodeAdapter],
    ['cursor', cursorAdapter],
    ['github-copilot', copilotAdapter],
]);

/**
 * Get adapter by IDE type
 */
export function getAdapter(ide: AgentType): BaseAdapter | undefined {
    return adapterRegistry.get(ide);
}

/**
 * Get all available adapters
 */
export function getAllAdapters(): BaseAdapter[] {
    return Array.from(adapterRegistry.values());
}

/**
 * Get adapters for installed IDEs
 */
export async function getInstalledAdapters(): Promise<BaseAdapter[]> {
    const installed: BaseAdapter[] = [];

    for (const adapter of adapterRegistry.values()) {
        if (await adapter.isInstalled()) {
            installed.push(adapter);
        }
    }

    return installed;
}

/**
 * Get adapter IDs for installed IDEs
 */
export async function getInstalledAdapterIds(): Promise<AgentType[]> {
    const installed = await getInstalledAdapters();
    return installed.map(a => a.id);
}

/**
 * Priority order for syncing (most commonly used first)
 */
export const ADAPTER_PRIORITY: AgentType[] = [
    'claude-code',
    'opencode',
    'cursor',
    'github-copilot',
];
