/**
 * Init Command
 * Initialize skills with smart project detection
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import { detectProject, getProjectIcon, type DetectedProject } from '../utils/project-detector.js';
import { parseSource, cloneRepo, cleanupTempDir } from '../utils/git.js';
import { discoverSkills, getSkillDisplayName } from '../utils/skills.js';
import { installSkillForAgent, isSkillInstalled } from '../utils/installer.js';
import { detectInstalledAgents, agents } from '../utils/agents.js';
import type { Skill, AgentType } from '../types.js';

export interface InitOptions {
  yes?: boolean;
  source?: string;
  agent?: string[];
  global?: boolean;
}

/**
 * Initialize skills with smart detection
 */
export async function initCommand(options: InitOptions): Promise<void> {
  console.log();
  p.intro(chalk.bgCyan.black(' agent-skills init '));

  const spinner = p.spinner();

  // Step 1: Detect project type
  spinner.start('Detecting project type...');
  const project = await detectProject(process.cwd());
  
  if (project) {
    const icon = getProjectIcon(project.type);
    spinner.stop(`Detected: ${icon} ${chalk.cyan(project.displayName)}${project.name ? ` (${project.name})` : ''}`);
    
    console.log();
    p.log.step(chalk.bold('Recommended Skills'));
    
    // Show recommended skills
    for (const skillId of project.recommendedSkills) {
      p.log.message(`  ${chalk.green('✓')} ${skillId}`);
    }
    
    // Show optional skills
    if (project.optionalSkills.length > 0) {
      p.log.message(chalk.dim(`  Optional: ${project.optionalSkills.join(', ')}`));
    }
    console.log();

    // Ask to install recommended skills
    if (!options.yes) {
      const installRecommended = await p.confirm({
        message: `Install recommended skills for ${project.displayName}?`,
        initialValue: true,
      });

      if (p.isCancel(installRecommended)) {
        p.cancel('Initialization cancelled');
        process.exit(0);
      }

      if (installRecommended) {
        // Ask about optional skills
        let skillsToInstall = [...project.recommendedSkills];
        
        if (project.optionalSkills.length > 0) {
          const includeOptional = await p.multiselect({
            message: 'Include any optional skills?',
            options: project.optionalSkills.map(s => ({
              value: s,
              label: s,
            })),
            required: false,
          });

          if (!p.isCancel(includeOptional)) {
            skillsToInstall = [...skillsToInstall, ...(includeOptional as string[])];
          }
        }

        // Install the skills
        await installSkillsFromSource(skillsToInstall, options);
      }
    } else {
      // Auto-install in yes mode
      await installSkillsFromSource(project.recommendedSkills, options);
    }
  } else {
    spinner.stop('No specific project type detected');
    
    console.log();
    p.log.info('Could not detect project type. You can still install skills manually.');
    
    // Offer general skills
    const generalSkills = ['clean-code', 'git', 'testing'];
    
    if (!options.yes) {
      const installGeneral = await p.multiselect({
        message: 'Select skills to install',
        options: [
          { value: 'clean-code', label: 'clean-code', hint: 'Universal clean code principles' },
          { value: 'git', label: 'git', hint: 'Git workflows and conventions' },
          { value: 'testing', label: 'testing', hint: 'Testing best practices' },
          { value: 'api-design', label: 'api-design', hint: 'API design patterns' },
          { value: 'skill-writer', label: 'skill-writer', hint: 'Create your own skills' },
        ],
        required: false,
      });

      if (!p.isCancel(installGeneral) && (installGeneral as string[]).length > 0) {
        await installSkillsFromSource(installGeneral as string[], options);
      }
    }
  }

  console.log();
  p.outro(chalk.green('Done! Your project is ready.'));
}

/**
 * Install skills from the default source
 */
async function installSkillsFromSource(
  skillIds: string[], 
  options: InitOptions
): Promise<void> {
  const spinner = p.spinner();
  
  // Default source - the openskill repo
  const source = options.source || 'includeHasan/agents-skill';
  
  spinner.start('Fetching skills...');
  
  let tempDir: string | null = null;
  
  try {
    // Clone and discover skills
    const parsed = parseSource(source);
    tempDir = await cloneRepo(parsed.url);
    const allSkills = await discoverSkills(tempDir, parsed.subpath);
    
    // Filter to requested skills
    const skillsToInstall = allSkills.filter(s => 
      skillIds.some(id => 
        s.name.toLowerCase().includes(id.toLowerCase()) ||
        getSkillDisplayName(s).toLowerCase().includes(id.toLowerCase())
      )
    );
    
    if (skillsToInstall.length === 0) {
      spinner.stop(chalk.yellow('No matching skills found'));
      return;
    }
    
    spinner.stop(`Found ${skillsToInstall.length} skill${skillsToInstall.length !== 1 ? 's' : ''}`);

    // Detect agents
    spinner.start('Detecting agents...');
    let targetAgents: AgentType[];
    
    if (options.agent && options.agent.length > 0) {
      targetAgents = options.agent as AgentType[];
    } else {
      const installedAgents = await detectInstalledAgents();
      targetAgents = installedAgents.length > 0 ? installedAgents : ['claude-code'] as AgentType[];
    }
    
    spinner.stop(`Installing to ${targetAgents.length} agent${targetAgents.length !== 1 ? 's' : ''}`);

    // Install each skill
    spinner.start('Installing skills...');
    
    const results: { skill: string; success: boolean; error?: string }[] = [];
    
    for (const skill of skillsToInstall) {
      for (const agent of targetAgents) {
        try {
          const result = await installSkillForAgent(skill, agent, { global: options.global ?? false });
          results.push({
            skill: getSkillDisplayName(skill),
            success: result.success,
            error: result.error,
          });
        } catch (error) {
          results.push({
            skill: getSkillDisplayName(skill),
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }
    
    spinner.stop('Installation complete');

    // Show results
    console.log();
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (successful.length > 0) {
      for (const r of successful) {
        p.log.success(`${chalk.green('✓')} ${r.skill}`);
      }
    }
    
    if (failed.length > 0) {
      for (const r of failed) {
        p.log.error(`${chalk.red('✗')} ${r.skill}: ${r.error}`);
      }
    }
  } finally {
    if (tempDir) {
      try {
        await cleanupTempDir(tempDir);
      } catch {}
    }
  }
}

export default initCommand;
