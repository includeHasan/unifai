import chalk from 'chalk';
import { getSkill, skillExists } from '../registry.js';
import { removeSkillFolder, isSkillInstalled } from '../utils/fs-helpers.js';
import { updateReadme } from '../utils/readme-generator.js';

export interface RemoveOptions {
  dir?: string;
}

/**
 * Remove one or more skills
 */
export async function removeSkills(skillIds: string[], options: RemoveOptions): Promise<void> {
  const targetDir = options.dir || '.';

  console.log(chalk.blue('\n🗑️  Agent Skills Remover\n'));

  let removed = 0;
  let notFound = 0;

  for (const skillId of skillIds) {
    // Get folder name
    let folderName: string;

    if (skillExists(skillId)) {
      const skill = getSkill(skillId)!;
      folderName = skill.folderName;
    } else {
      // Try direct folder name
      folderName = skillId.endsWith('-skills') ? skillId : `${skillId}-skills`;
    }

    // Check if installed
    const isInstalled = await isSkillInstalled(folderName, targetDir);

    if (!isInstalled) {
      console.log(chalk.yellow(`⚠ ${skillId}: Not installed`));
      notFound++;
      continue;
    }

    // Remove
    await removeSkillFolder(folderName, targetDir);
    console.log(chalk.green(`✓ ${skillId}: Removed`));
    removed++;
  }

  // Update README if we removed anything
  if (removed > 0) {
    await updateReadme(targetDir);
  }

  // Summary
  console.log('');
  if (removed > 0) {
    console.log(chalk.green(`✓ ${removed} skill(s) removed`));
  }
  if (notFound > 0 && removed === 0) {
    console.log(chalk.gray('No skills were removed.'));
  }
  console.log('');
}
