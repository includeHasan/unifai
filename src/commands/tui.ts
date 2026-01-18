/**
 * TUI Command
 * Interactive terminal UI for managing skills
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import { detectProject, getProjectIcon } from '../utils/project-detector.js';
import { parseSource, cloneRepo, cleanupTempDir } from '../utils/git.js';
import { discoverSkills, getSkillDisplayName } from '../utils/skills.js';
import { installSkillForAgent, isSkillInstalled, getInstallPath, uninstallSkill } from '../utils/installer.js';
import { detectInstalledAgents, agents } from '../utils/agents.js';
import type { Skill, AgentType } from '../types.js';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface TuiOptions {
  source?: string;
  global?: boolean;
}

interface SkillStatus {
  id: string;
  name: string;
  description: string;
  installed: boolean;
  path?: string;
}

/**
 * Interactive TUI for managing skills
 */
export async function tuiCommand(options: TuiOptions): Promise<void> {
  console.log();
  console.log(createBox('Agent Skills Manager', 50));
  console.log();

  const spinner = p.spinner();

  // Detect project
  spinner.start('Analyzing project...');
  const project = await detectProject(process.cwd());
  const installedAgents = await detectInstalledAgents();
  spinner.stop('');

  // Show project info
  if (project) {
    const icon = getProjectIcon(project.type);
    console.log(`  ${chalk.dim('Project:')} ${icon} ${chalk.cyan(project.displayName)}${project.name ? ` (${project.name})` : ''}`);
  }
  console.log(`  ${chalk.dim('Agents:')}  ${installedAgents.length > 0 ? installedAgents.map(a => agents[a].displayName).join(', ') : chalk.yellow('None detected')}`);
  console.log();

  // Main menu loop
  let running = true;
  
  while (running) {
    const action = await p.select({
      message: 'What would you like to do?',
      options: [
        { value: 'install', label: '📦 Install Skills', hint: 'Add new skills to your project' },
        { value: 'manage', label: '📋 Manage Installed', hint: 'View, update, or remove skills' },
        { value: 'detect', label: '🔍 Detect & Recommend', hint: 'Get skill recommendations for your project' },
        { value: 'browse', label: '🌐 Browse Repository', hint: 'Explore available skills' },
        { value: 'quit', label: '👋 Quit', hint: 'Exit the manager' },
      ],
    });

    if (p.isCancel(action) || action === 'quit') {
      running = false;
      break;
    }

    switch (action) {
      case 'install':
        await handleInstall(options, installedAgents);
        break;
      case 'manage':
        await handleManage(options, installedAgents);
        break;
      case 'detect':
        await handleDetect(project);
        break;
      case 'browse':
        await handleBrowse(options);
        break;
    }

    console.log();
  }

  console.log();
  p.outro(chalk.dim('Thanks for using Agent Skills! 👋'));
}

/**
 * Handle install action
 */
async function handleInstall(options: TuiOptions, installedAgents: AgentType[]): Promise<void> {
  console.log();
  
  const source = await p.text({
    message: 'Enter skill source (GitHub repo or URL)',
    placeholder: 'e.g., vercel-labs/agent-skills',
    initialValue: 'includeHasan/agents-skill',
  });

  if (p.isCancel(source)) return;

  const spinner = p.spinner();
  spinner.start('Fetching skills...');

  let tempDir: string | null = null;

  try {
    const parsed = parseSource(source as string);
    tempDir = await cloneRepo(parsed.url);
    const skills = await discoverSkills(tempDir, parsed.subpath);

    if (skills.length === 0) {
      spinner.stop(chalk.yellow('No skills found'));
      return;
    }

    spinner.stop(`Found ${chalk.green(skills.length)} skill${skills.length !== 1 ? 's' : ''}`);

    // Let user select skills
    const selectedSkills = await p.multiselect({
      message: 'Select skills to install',
      options: skills.map(s => ({
        value: s,
        label: getSkillDisplayName(s),
        hint: s.description.slice(0, 50) + (s.description.length > 50 ? '...' : ''),
      })),
      required: true,
    });

    if (p.isCancel(selectedSkills)) return;

    // Select agents
    let targetAgents = installedAgents;
    if (installedAgents.length > 1) {
      const selected = await p.multiselect({
        message: 'Install to which agents?',
        options: installedAgents.map(a => ({
          value: a,
          label: agents[a].displayName,
        })),
        initialValues: installedAgents,
        required: true,
      });

      if (p.isCancel(selected)) return;
      targetAgents = selected as AgentType[];
    } else if (installedAgents.length === 0) {
      targetAgents = ['claude-code'] as AgentType[];
    }

    // Install
    spinner.start('Installing skills...');

    let installed = 0;
    for (const skill of selectedSkills as Skill[]) {
      for (const agent of targetAgents) {
        const result = await installSkillForAgent(skill, agent, { global: options.global ?? false });
        if (result.success) installed++;
      }
    }

    spinner.stop(chalk.green(`✓ Installed ${installed} skill${installed !== 1 ? 's' : ''}`));
  } catch (error) {
    spinner.stop(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
  } finally {
    if (tempDir) {
      try {
        await cleanupTempDir(tempDir);
      } catch {}
    }
  }
}

/**
 * Handle manage installed skills
 */
async function handleManage(options: TuiOptions, installedAgents: AgentType[]): Promise<void> {
  console.log();

  // Get installed skills for each agent
  const installedSkills: Map<string, { agent: AgentType; path: string }[]> = new Map();

  for (const agent of installedAgents) {
    const skillsDir = options.global ? agents[agent].globalSkillsDir : agents[agent].skillsDir;
    const fullPath = options.global 
      ? join(process.env.HOME || process.env.USERPROFILE || '', skillsDir)
      : join(process.cwd(), skillsDir);

    if (existsSync(fullPath)) {
      try {
        const items = readdirSync(fullPath);
        for (const item of items) {
          const itemPath = join(fullPath, item);
          if (statSync(itemPath).isDirectory()) {
            if (!installedSkills.has(item)) {
              installedSkills.set(item, []);
            }
            installedSkills.get(item)!.push({ agent, path: itemPath });
          }
        }
      } catch {}
    }
  }

  if (installedSkills.size === 0) {
    p.log.info('No skills installed yet.');
    return;
  }

  // Show installed skills
  console.log(chalk.bold('Installed Skills:'));
  console.log();

  const skillList = Array.from(installedSkills.entries()).map(([name, locations]) => ({
    name,
    agents: locations.map(l => l.agent),
    paths: locations.map(l => l.path),
  }));

  for (const skill of skillList) {
    console.log(`  ${chalk.green('✓')} ${chalk.cyan(skill.name)}`);
    console.log(`    ${chalk.dim(skill.agents.map(a => agents[a].displayName).join(', '))}`);
  }

  console.log();

  // Actions
  const action = await p.select({
    message: 'What would you like to do?',
    options: [
      { value: 'update', label: '↻ Update All', hint: 'Refresh all installed skills' },
      { value: 'remove', label: '🗑️ Remove Skills', hint: 'Uninstall selected skills' },
      { value: 'back', label: '← Back', hint: 'Return to main menu' },
    ],
  });

  if (p.isCancel(action) || action === 'back') return;

  if (action === 'remove') {
    const toRemove = await p.multiselect({
      message: 'Select skills to remove',
      options: skillList.map(s => ({
        value: s,
        label: s.name,
        hint: s.agents.map(a => agents[a].displayName).join(', '),
      })),
      required: true,
    });

    if (p.isCancel(toRemove)) return;

    const spinner = p.spinner();
    spinner.start('Removing skills...');

    let removed = 0;
    for (const skill of toRemove as typeof skillList[0][]) {
      for (const path of skill.paths) {
        try {
          await uninstallSkill(path);
          removed++;
        } catch {}
      }
    }

    spinner.stop(chalk.green(`✓ Removed ${removed} skill${removed !== 1 ? 's' : ''}`));
  }
}

/**
 * Handle detect and recommend
 */
async function handleDetect(project: ReturnType<typeof detectProject> extends Promise<infer T> ? T : never): Promise<void> {
  console.log();

  if (!project) {
    p.log.warn('Could not detect project type');
    p.log.info('Try running from your project root directory.');
    return;
  }

  const icon = getProjectIcon(project.type);
  
  console.log(chalk.bold('Project Analysis'));
  console.log();
  console.log(`  ${chalk.dim('Type:')}    ${icon} ${project.displayName}`);
  if (project.name) console.log(`  ${chalk.dim('Name:')}    ${project.name}`);
  if (project.version) console.log(`  ${chalk.dim('Version:')} ${project.version}`);
  if (project.framework) console.log(`  ${chalk.dim('Framework:')} ${project.framework}`);
  console.log(`  ${chalk.dim('Config:')}  ${project.configFile}`);
  console.log();

  console.log(chalk.bold('Recommended Skills'));
  for (const skill of project.recommendedSkills) {
    console.log(`  ${chalk.green('●')} ${skill}`);
  }
  console.log();

  if (project.optionalSkills.length > 0) {
    console.log(chalk.bold('Optional Skills'));
    for (const skill of project.optionalSkills) {
      console.log(`  ${chalk.dim('○')} ${skill}`);
    }
  }
}

/**
 * Handle browse repository
 */
async function handleBrowse(options: TuiOptions): Promise<void> {
  console.log();

  const spinner = p.spinner();
  spinner.start('Fetching skill catalog...');

  let tempDir: string | null = null;

  try {
    const source = 'includeHasan/agents-skill';
    const parsed = parseSource(source);
    tempDir = await cloneRepo(parsed.url);
    const skills = await discoverSkills(tempDir, parsed.subpath);

    spinner.stop(`Found ${chalk.green(skills.length)} available skill${skills.length !== 1 ? 's' : ''}`);
    console.log();

    // Group by category/tag if possible
    console.log(chalk.bold('Available Skills'));
    console.log();

    for (const skill of skills) {
      console.log(`  ${chalk.cyan(getSkillDisplayName(skill))}`);
      console.log(`    ${chalk.dim(skill.description)}`);
    }
  } catch (error) {
    spinner.stop(chalk.red('Failed to fetch skills'));
  } finally {
    if (tempDir) {
      try {
        await cleanupTempDir(tempDir);
      } catch {}
    }
  }
}

/**
 * Create a simple ASCII box
 */
function createBox(title: string, width: number): string {
  const padding = Math.floor((width - title.length - 2) / 2);
  const top = `┌${'─'.repeat(width - 2)}┐`;
  const middle = `│${' '.repeat(padding)}${chalk.bold(title)}${' '.repeat(width - padding - title.length - 2)}│`;
  const bottom = `└${'─'.repeat(width - 2)}┘`;
  return `${top}\n${middle}\n${bottom}`;
}

export default tuiCommand;
