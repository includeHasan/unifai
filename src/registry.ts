/**
 * Skill Registry
 * Defines all available skills and their metadata
 */

export interface SkillInfo {
  folderName: string;
  description: string;
  tags: string[];
}

export interface SkillRegistry {
  [key: string]: SkillInfo;
}

export interface SkillWithId extends SkillInfo {
  id: string;
}

export const registry: SkillRegistry = {
  'skill-writer': {
    folderName: 'skill-writer-skills',
    description: 'Universal guide for creating well-structured Agent Skills for any technology',
    tags: ['universal', 'meta', 'documentation']
  }
};

/**
 * Default skill to auto-inject when skills are being configured
 * This skill helps agents create new skills properly
 */
export const DEFAULT_SKILL = 'skill-writer';

/**
 * Get skill info by ID
 */
export function getSkill(skillId: string): SkillInfo | null {
  return registry[skillId.toLowerCase()] || null;
}

/**
 * Get all available skill IDs
 */
export function getAllSkillIds(): string[] {
  return Object.keys(registry);
}

/**
 * Get all skills with full info
 */
export function getAllSkills(): SkillWithId[] {
  return Object.entries(registry).map(([id, info]) => ({
    id,
    ...info
  }));
}

/**
 * Check if skill exists
 */
export function skillExists(skillId: string): boolean {
  return skillId.toLowerCase() in registry;
}
