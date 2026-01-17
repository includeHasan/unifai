const fs = require('fs-extra');
const path = require('path');

/**
 * Get the .agents directory path
 */
function getAgentsDir(targetDir = '.') {
  return path.join(path.resolve(targetDir), '.agents');
}

/**
 * Ensure .agents directory exists
 */
async function ensureAgentsDir(targetDir = '.') {
  const agentsDir = getAgentsDir(targetDir);
  await fs.ensureDir(agentsDir);
  return agentsDir;
}

/**
 * Check if a skill is installed
 */
async function isSkillInstalled(skillFolderName, targetDir = '.') {
  const skillPath = path.join(getAgentsDir(targetDir), skillFolderName);
  return fs.pathExists(skillPath);
}

/**
 * Get list of installed skill folders
 */
async function getInstalledSkills(targetDir = '.') {
  const agentsDir = getAgentsDir(targetDir);
  
  if (!await fs.pathExists(agentsDir)) {
    return [];
  }

  const items = await fs.readdir(agentsDir, { withFileTypes: true });
  return items
    .filter(item => item.isDirectory() && item.name.endsWith('-skills'))
    .map(item => item.name);
}

/**
 * Copy skill folder to .agents
 */
async function copySkillFolder(sourcePath, skillFolderName, targetDir = '.') {
  const agentsDir = await ensureAgentsDir(targetDir);
  const destPath = path.join(agentsDir, skillFolderName);
  
  await fs.copy(sourcePath, destPath, { overwrite: true });
  return destPath;
}

/**
 * Remove skill folder from .agents
 */
async function removeSkillFolder(skillFolderName, targetDir = '.') {
  const skillPath = path.join(getAgentsDir(targetDir), skillFolderName);
  
  if (await fs.pathExists(skillPath)) {
    await fs.remove(skillPath);
    return true;
  }
  return false;
}

/**
 * Get the skills source directory (bundled with package)
 */
function getSkillsSourceDir() {
  return path.join(__dirname, '..', '..', 'skills');
}

module.exports = {
  getAgentsDir,
  ensureAgentsDir,
  isSkillInstalled,
  getInstalledSkills,
  copySkillFolder,
  removeSkillFolder,
  getSkillsSourceDir
};
