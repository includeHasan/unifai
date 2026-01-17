/**
 * Agent Skills - Main Entry Point
 * 
 * Programmatic API for agent-skills package
 */

const { installSkills } = require('./commands/install');
const { listSkills } = require('./commands/list');
const { removeSkills } = require('./commands/remove');
const { initAgents } = require('./commands/init');
const { getAllSkills, getSkill, skillExists } = require('./registry');

module.exports = {
  // Commands
  installSkills,
  listSkills,
  removeSkills,
  initAgents,
  
  // Registry
  getAllSkills,
  getSkill,
  skillExists
};
