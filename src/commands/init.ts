import chalk from 'chalk';
import { ensureAgentsDir, getAgentsDir } from '../utils/fs-helpers.js';
import { updateReadme } from '../utils/readme-generator.js';
import { access } from 'fs/promises';

export interface InitOptions {
  dir?: string;
}

/**
 * Initialize .agents folder
 */
export async function initAgents(options: InitOptions): Promise<void> {
  const targetDir = options.dir || '.';
  const agentsDir = getAgentsDir(targetDir);

  console.log(chalk.blue('\n🚀 Agent Skills Init\n'));

  // Check if already exists
  let exists = false;
  try {
    await access(agentsDir);
    exists = true;
  } catch {
    exists = false;
  }

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
