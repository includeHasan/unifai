/**
 * Skill Registry
 * Defines all available skills and their metadata
 */

const registry = {
  'skill-writer' :{
    folderName : 'skill-writer',
    description : 'Skill writing best practices and patterns',
    tags : ['universal', 'writing', 'skill']
  },
  'flutter': {
    folderName: 'flutter-skills',
    description: 'Flutter/Dart best practices, widget patterns, and state management',
    tags: ['mobile', 'dart', 'cross-platform']
  },
  'react': {
    folderName: 'react-skills',
    description: 'React/Next.js performance optimization and patterns',
    tags: ['frontend', 'javascript', 'web']
  },
  'clean-code': {
    folderName: 'clean-code-skills',
    description: 'Universal clean code principles and refactoring patterns',
    tags: ['universal', 'refactoring', 'quality']
  },
  'typescript': {
    folderName: 'typescript-skills',
    description: 'TypeScript type patterns and best practices',
    tags: ['frontend', 'backend', 'types']
  },
  'api-design': {
    folderName: 'api-design-skills',
    description: 'REST and GraphQL API design patterns',
    tags: ['backend', 'api', 'architecture']
  },
  'git': {
    folderName: 'git-skills',
    description: 'Git workflows, commit conventions, and branching strategies',
    tags: ['universal', 'version-control', 'workflow']
  },
  'testing': {
    folderName: 'testing-skills',
    description: 'Testing strategies, patterns, and best practices',
    tags: ['universal', 'quality', 'testing']
  },
  'springboot': {
    folderName: 'springboot-skills',
    description: 'Spring Boot patterns and Java best practices',
    tags: ['backend', 'java', 'enterprise']
  },
  'node': {
    folderName: 'node-skills',
    description: 'Node.js/Express patterns and best practices',
    tags: ['backend', 'javascript', 'api']
  },
  'python': {
    folderName: 'python-skills',
    description: 'Python best practices and patterns',
    tags: ['backend', 'scripting', 'data']
  }
};

/**
 * Get skill info by ID
 */
function getSkill(skillId) {
  return registry[skillId.toLowerCase()] || null;
}

/**
 * Get all available skill IDs
 */
function getAllSkillIds() {
  return Object.keys(registry);
}

/**
 * Get all skills with full info
 */
function getAllSkills() {
  return Object.entries(registry).map(([id, info]) => ({
    id,
    ...info
  }));
}

/**
 * Check if skill exists
 */
function skillExists(skillId) {
  return skillId.toLowerCase() in registry;
}

module.exports = {
  registry,
  getSkill,
  getAllSkillIds,
  getAllSkills,
  skillExists
};
