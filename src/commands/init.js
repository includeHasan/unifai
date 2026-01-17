const chalk = require('chalk');
const { ensureAgentsDir, getAgentsDir } = require('../utils/fs-helpers');
const { updateReadme } = require('../utils/readme-generator');
const fs = require('fs-extra');

/**
 * Initialize .agents folder
 */
async function initAgents(options) {
  const targetDir = options.dir || '.';
  const agentsDir = getAgentsDir(targetDir);
  
  console.log(chalk.blue('\n🚀 Agent Skills Init\n'));
  
  // Check if already exists
  const exists = await fs.pathExists(agentsDir);
  
  if (exists) {
    console.log(chalk.yellow(`⚠ .agents folder already exists at ${agentsDir}`));
    console.log(chalk.gray('Use `agent-skills install <skill>` to add skills.'));
  } else {
    // Create folder
    await ensureAgentsDir(targetDir);
    
    // Create initial README
    await updateReadme(targetDir);
    
    console.log(chalk.green(`✓ Created .agents folder at ${agentsDir}`));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('  agent-skills list              # See available skills'));
    console.log(chalk.gray('  agent-skills install flutter   # Install a skill'));
  }
  
  console.log('');
}

module.exports = { initAgents };
