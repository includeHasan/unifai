const chalk = require('chalk');
const { getAllSkills } = require('../registry');
const { getInstalledSkills, getAgentsDir } = require('../utils/fs-helpers');
const fs = require('fs-extra');

/**
 * List available and installed skills
 */
async function listSkills(options) {
  const targetDir = options.dir || '.';
  const allSkills = getAllSkills();
  
  console.log(chalk.blue('\n📋 Agent Skills\n'));
  
  // Get installed skills
  let installedFolders = [];
  const agentsDir = getAgentsDir(targetDir);
  
  if (await fs.pathExists(agentsDir)) {
    installedFolders = await getInstalledSkills(targetDir);
  }
  
  // Create a set for quick lookup
  const installedSet = new Set(installedFolders);
  
  // Display skills
  console.log(chalk.white('Available Skills:\n'));
  
  for (const skill of allSkills) {
    const isInstalled = installedSet.has(skill.folderName);
    const status = isInstalled ? chalk.green('✓') : ' ';
    const name = isInstalled ? chalk.green(skill.id) : chalk.white(skill.id);
    const desc = chalk.gray(skill.description);
    
    // Pad skill ID for alignment
    const paddedId = skill.id.padEnd(15);
    console.log(`  ${status} ${isInstalled ? chalk.green(paddedId) : paddedId} ${desc}`);
  }
  
  // Summary
  console.log('');
  const installedCount = installedFolders.length;
  if (installedCount > 0) {
    console.log(chalk.gray(`${installedCount} skill(s) installed in ${agentsDir}`));
  } else {
    console.log(chalk.gray('No skills installed yet.'));
    console.log(chalk.gray('Install with: agent-skills install <skill-name>'));
  }
  console.log('');
}

module.exports = { listSkills };
