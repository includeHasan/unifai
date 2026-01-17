import * as path from 'path';
import chalk from 'chalk';
import { access } from 'fs/promises';
import { getSkill, skillExists, SkillInfo } from '../registry.js';
import {
  ensureAgentsDir,
  copySkillFolder,
  getSkillsSourceDir,
  isSkillInstalled
} from '../utils/fs-helpers.js';
import { updateReadme } from '../utils/readme-generator.js';

export interface InstallOptions {
  dir?: string;
}

/**
 * Install one or more skills
 */
export async function installSkills(skillIds: string[], options: InstallOptions): Promise<void> {
  const targetDir = options.dir || '.';
  const skillsSourceDir = getSkillsSourceDir();

  console.log(chalk.blue('\n📦 Agent Skills Installer\n'));

  // Validate all skills first
  const validSkills: string[] = [];
  const invalidSkills: string[] = [];

  for (const skillId of skillIds) {
    if (skillExists(skillId)) {
      validSkills.push(skillId);
    } else {
      invalidSkills.push(skillId);
    }
  }

  // Report invalid skills
  if (invalidSkills.length > 0) {
    console.log(chalk.yellow('⚠ Unknown skills (skipping):'));
    invalidSkills.forEach(id => {
      console.log(chalk.yellow(`  - ${id}`));
    });
    console.log('');
  }

  if (validSkills.length === 0) {
    console.log(chalk.red('No valid skills to install.'));
    console.log(chalk.gray('Run `agent-skills list` to see available skills.'));
    return;
  }

  // Ensure .agents directory exists
  const agentsDir = await ensureAgentsDir(targetDir);
  console.log(chalk.gray(`Target: ${agentsDir}\n`));

  // Install each skill
  let installed = 0;
  let updated = 0;

  for (const skillId of validSkills) {
    const skill = getSkill(skillId) as SkillInfo;
    const sourcePath = path.join(skillsSourceDir, skill.folderName);

    // Check if source exists
    try {
      await access(sourcePath);
    } catch {
      console.log(chalk.yellow(`⚠ ${skillId}: Skill files not found (coming soon)`));
      continue;
    }

    // Check if already installed
    const alreadyInstalled = await isSkillInstalled(skill.folderName, targetDir);

    // Copy skill folder
    await copySkillFolder(sourcePath, skill.folderName, targetDir);

    if (alreadyInstalled) {
      console.log(chalk.blue(`↻ ${skillId}: Updated`));
      updated++;
    } else {
      console.log(chalk.green(`✓ ${skillId}: Installed`));
      installed++;
    }
  }

  // Update README
  await updateReadme(targetDir);

  // Summary
  console.log('');
  if (installed > 0 || updated > 0) {
    const parts: string[] = [];
    if (installed > 0) parts.push(`${installed} installed`);
    if (updated > 0) parts.push(`${updated} updated`);
    console.log(chalk.green(`✓ ${parts.join(', ')}`));
    console.log(chalk.gray(`\nSkills are in: ${agentsDir}`));
  }
}
