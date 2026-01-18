/**
 * Agent Skills - Main Entry Point
 * 
 * Programmatic API for agent-skills package
 */

export { installSkills, InstallOptions } from './commands/install.js';
export { listSkills, ListOptions } from './commands/list.js';
export { removeSkills, RemoveOptions } from './commands/remove.js';
export { initCommand, type InitOptions } from './commands/init.js';
export {
  getAllSkills,
  getSkill,
  skillExists,
  SkillInfo,
  SkillWithId,
  SkillRegistry
} from './registry.js';

// Export new Git utilities
export { parseSource, cloneRepo, cleanupTempDir } from './utils/git.js';

// Export skill discovery
export { discoverSkills, getSkillDisplayName } from './utils/skills.js';

// Export agent management
export { agents, detectInstalledAgents, getAgentConfig } from './utils/agents.js';

// Export installer utilities
export { installSkillForAgent, isSkillInstalled, getInstallPath } from './utils/installer.js';

// Export types
export type { Skill, AgentType, AgentConfig, ParsedSource } from './types.js';
