const chalk = require('chalk');
const { getSkill, skillExists } = require('../registry');
const { removeSkillFolder, isSkillInstalled, getAgentsDir } = require('../utils/fs-helpers');
const { updateReadme } = require('../utils/readme-generator');

/**
 * Remove one or more skills
 */
async function removeSkills(skillIds, options) {
  const targetDir = options.dir || '.';
  
  console.log(chalk.blue('\n🗑️  Agent Skills Remover\n'));
  
  let removed = 0;
  let notFound = 0;
  
  for (const skillId of skillIds) {
    // Get folder name
    let folderName;
    
    if (skillExists(skillId)) {
      const skill = getSkill(skillId);
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

module.exports = { removeSkills };
