import { mkdir, readdir, rm, access, cp } from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the .agents directory path
 */
export function getAgentsDir(targetDir: string = '.'): string {
  return path.join(path.resolve(targetDir), '.agents');
}

/**
 * Ensure .agents directory exists
 */
export async function ensureAgentsDir(targetDir: string = '.'): Promise<string> {
  const agentsDir = getAgentsDir(targetDir);
  await mkdir(agentsDir, { recursive: true });
  return agentsDir;
}

/**
 * Check if a skill is installed
 */
export async function isSkillInstalled(skillFolderName: string, targetDir: string = '.'): Promise<boolean> {
  const skillPath = path.join(getAgentsDir(targetDir), skillFolderName);
  try {
    await access(skillPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of installed skill folders
 */
export async function getInstalledSkills(targetDir: string = '.'): Promise<string[]> {
  const agentsDir = getAgentsDir(targetDir);

  try {
    await access(agentsDir);
  } catch {
    return [];
  }

  const items = await readdir(agentsDir, { withFileTypes: true });
  return items
    .filter(item => item.isDirectory() && item.name.endsWith('-skills'))
    .map(item => item.name);
}

/**
 * Copy skill folder to .agents
 */
export async function copySkillFolder(
  sourcePath: string,
  skillFolderName: string,
  targetDir: string = '.'
): Promise<string> {
  const agentsDir = await ensureAgentsDir(targetDir);
  const destPath = path.join(agentsDir, skillFolderName);

  await cp(sourcePath, destPath, { recursive: true, force: true });
  return destPath;
}

/**
 * Remove skill folder from .agents
 */
export async function removeSkillFolder(
  skillFolderName: string,
  targetDir: string = '.'
): Promise<boolean> {
  const skillPath = path.join(getAgentsDir(targetDir), skillFolderName);

  try {
    await access(skillPath);
    await rm(skillPath, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the skills source directory (bundled with package)
 */
export function getSkillsSourceDir(): string {
  return path.join(__dirname, '..', '..', 'skills');
}
