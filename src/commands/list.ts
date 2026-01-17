import chalk from 'chalk';
import { access } from 'fs/promises';
import { getAllSkills } from '../registry.js';
import { getInstalledSkills, getAgentsDir } from '../utils/fs-helpers.js';

export interface ListOptions {
  dir?: string;
}

/**
 * List available and installed skills
 */
export async function listSkills(options: ListOptions): Promise<void> {
  const targetDir = options.dir || '.';
  const allSkills = getAllSkills();

  console.log(chalk.blue('\n📋 Agent Skills\n'));

  // Get installed skills
  let installedFolders: string[] = [];
  const agentsDir = getAgentsDir(targetDir);

  try {
    await access(agentsDir);
    installedFolders = await getInstalledSkills(targetDir);
  } catch {
    // Directory doesn't exist, no installed skills
  }

  // Create a set for quick lookup
  const installedSet = new Set(installedFolders);

  // Display skills
  console.log(chalk.white('Available Skills:\n'));

  for (const skill of allSkills) {
    const isInstalled = installedSet.has(skill.folderName);
    const status = isInstalled ? chalk.green('✓') : ' ';

    // Pad skill ID for alignment
    const paddedId = skill.id.padEnd(15);
    const displayId = isInstalled ? chalk.green(paddedId) : paddedId;
    const desc = chalk.gray(skill.description);

    console.log(`  ${status} ${displayId} ${desc}`);
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
