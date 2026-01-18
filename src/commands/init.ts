/**
 * Init Command
 * Initialize agent configuration directory
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface InitOptions {
  yes?: boolean;
  global?: boolean;
}

/**
 * Initialize the .agents directory 
 */
export async function initCommand(options: InitOptions): Promise<void> {
  console.log();
  p.intro(chalk.bgCyan.black(' unifai init '));

  const agentsDir = join(process.cwd(), '.agents');

  if (existsSync(agentsDir)) {
    p.log.info('.agents directory already exists');
  } else {
    mkdirSync(agentsDir, { recursive: true });
    p.log.success('Created .agents directory');
  }

  console.log();
  p.log.info('Next steps:');
  p.log.message(`  ${chalk.cyan('unifai install <source>')} - Install skills from a repository`);
  p.log.message(`  ${chalk.cyan('unifai tui')} - Open interactive skill manager`);

  console.log();
  p.outro(chalk.green('Done!'));
}

export default initCommand;
