/**
 * Rules Command
 * 
 * Manage AI coding rules across different IDEs.
 * Each IDE has its own format for rules:
 * 
 * | IDE            | Rules Location               | Format              |
 * |----------------|------------------------------|---------------------|
 * | Cursor         | .cursor/rules/*.mdc          | MDC (Markdown+YAML) |
 * | Claude Code    | .claude/settings.json        | JSON                |
 * | VS Code Copilot| .github/instructions/*.md    | Markdown            |
 * | OpenCode       | .opencode/rules/             | Markdown            |
 * | Windsurf       | .windsurfrules               | Plain text          |
 * | Antigravity    | .agent/rules/                | Markdown            |
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import type { Rule, RuleSet, PathRule } from '../types/config.js';
import { getAllAdapters } from '../adapters/index.js';
import type { AgentType } from '../types/index.js';

// ============================================================================
// Types
// ============================================================================

interface RulesConfig {
  version: string;
  global: Rule[];
  pathSpecific: PathRule[];
}

interface RulesOptions {
  global?: boolean;
  ide?: string;
}

// ============================================================================
// Constants
// ============================================================================

const RULES_CONFIG_FILE = '.unifai/rules.json';
const DEFAULT_RULES_CONFIG: RulesConfig = {
  version: '1.0.0',
  global: [],
  pathSpecific: [],
};

// Pre-defined rule templates
const RULE_TEMPLATES: Record<string, Rule[]> = {
  'clean-code': [
    { content: 'Use meaningful and descriptive variable names', category: 'style', priority: 'high' },
    { content: 'Keep functions small and focused on a single task', category: 'style', priority: 'high' },
    { content: 'Avoid deep nesting - extract complex conditions into functions', category: 'style', priority: 'medium' },
    { content: 'Write self-documenting code - comments explain why, not what', category: 'documentation', priority: 'medium' },
  ],
  'typescript': [
    { content: 'Use explicit types instead of `any`', category: 'style', priority: 'high' },
    { content: 'Prefer `interface` over `type` for object shapes', category: 'style', priority: 'low' },
    { content: 'Use `readonly` for immutable properties', category: 'style', priority: 'medium' },
    { content: 'Enable strict mode in tsconfig.json', category: 'style', priority: 'high' },
  ],
  'react': [
    { content: 'Use functional components with hooks', category: 'style', priority: 'high' },
    { content: 'Extract reusable logic into custom hooks', category: 'style', priority: 'medium' },
    { content: 'Memoize expensive computations with useMemo', category: 'performance', priority: 'medium' },
    { content: 'Keep components focused - one responsibility per component', category: 'style', priority: 'high' },
  ],
  'security': [
    { content: 'Never expose API keys or secrets in code', category: 'security', priority: 'high' },
    { content: 'Validate and sanitize all user inputs', category: 'security', priority: 'high' },
    { content: 'Use parameterized queries for database operations', category: 'security', priority: 'high' },
    { content: 'Implement proper authentication and authorization', category: 'security', priority: 'high' },
  ],
  'testing': [
    { content: 'Write tests for all new features and bug fixes', category: 'testing', priority: 'high' },
    { content: 'Use descriptive test names that explain the expected behavior', category: 'testing', priority: 'medium' },
    { content: 'Mock external dependencies in unit tests', category: 'testing', priority: 'medium' },
    { content: 'Aim for high test coverage but prioritize critical paths', category: 'testing', priority: 'medium' },
  ],
};

// ============================================================================
// Main Command Handler
// ============================================================================

export async function rulesCommand(action: string, args: string[], options: RulesOptions): Promise<void> {
  console.log();
  
  switch (action) {
    case 'init':
      await rulesInit(options);
      break;
    case 'add':
      await rulesAdd(args, options);
      break;
    case 'list':
      await rulesList(options);
      break;
    case 'remove':
      await rulesRemove(args, options);
      break;
    case 'sync':
      await rulesSync(options);
      break;
    case 'templates':
      await rulesTemplates();
      break;
    default:
      p.log.error(`Unknown action: ${action}`);
      showRulesHelp();
  }
}

// ============================================================================
// Subcommands
// ============================================================================

/**
 * Initialize rules configuration
 */
async function rulesInit(options: RulesOptions): Promise<void> {
  p.intro(chalk.bgCyan.black(' rules init '));

  const configPath = join(process.cwd(), RULES_CONFIG_FILE);
  
  if (existsSync(configPath)) {
    p.log.warn('Rules configuration already exists');
    
    const overwrite = await p.confirm({
      message: 'Overwrite existing configuration?',
      initialValue: false,
    });
    
    if (p.isCancel(overwrite) || !overwrite) {
      p.outro('Cancelled');
      return;
    }
  }

  // Ask about starting templates
  const templateChoices = Object.keys(RULE_TEMPLATES).map(key => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' '),
  }));

  const selectedTemplates = await p.multiselect({
    message: 'Select rule templates to include',
    options: templateChoices,
    required: false,
  });

  if (p.isCancel(selectedTemplates)) {
    p.outro('Cancelled');
    return;
  }

  // Build initial rules
  const initialRules: Rule[] = [];
  for (const template of selectedTemplates as string[]) {
    if (RULE_TEMPLATES[template]) {
      initialRules.push(...RULE_TEMPLATES[template]);
    }
  }

  // Create config
  const config: RulesConfig = {
    ...DEFAULT_RULES_CONFIG,
    global: initialRules,
  };

  // Write config
  const configDir = join(process.cwd(), '.unifai');
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  p.log.success(`Created ${chalk.cyan(RULES_CONFIG_FILE)}`);

  // Show what was added
  if (initialRules.length > 0) {
    p.log.info(`Added ${initialRules.length} rules from templates`);
  }

  // Suggest next steps
  console.log();
  p.log.info('Next steps:');
  p.log.message(`  ${chalk.cyan('unifai rules add')} - Add custom rules`);
  p.log.message(`  ${chalk.cyan('unifai rules sync')} - Sync to your IDEs`);

  p.outro('Rules initialized!');
}

/**
 * Add new rules
 */
async function rulesAdd(args: string[], options: RulesOptions): Promise<void> {
  p.intro(chalk.bgCyan.black(' rules add '));

  const config = loadRulesConfig();

  // Check if adding from template
  if (args.length > 0 && RULE_TEMPLATES[args[0]]) {
    const template = args[0];
    const templateRules = RULE_TEMPLATES[template];
    
    config.global.push(...templateRules);
    saveRulesConfig(config);
    
    p.log.success(`Added ${templateRules.length} rules from "${template}" template`);
    p.outro('Done!');
    return;
  }

  // Interactive rule addition
  const ruleContent = await p.text({
    message: 'Enter your rule',
    placeholder: 'e.g., Use consistent naming conventions',
    validate: (value) => {
      if (!value.trim()) return 'Rule cannot be empty';
    },
  });

  if (p.isCancel(ruleContent)) {
    p.outro('Cancelled');
    return;
  }

  const category = await p.select({
    message: 'Select category',
    options: [
      { value: 'style', label: 'Style', hint: 'Code formatting, naming, structure' },
      { value: 'security', label: 'Security', hint: 'Security best practices' },
      { value: 'performance', label: 'Performance', hint: 'Optimization guidelines' },
      { value: 'testing', label: 'Testing', hint: 'Testing requirements' },
      { value: 'documentation', label: 'Documentation', hint: 'Documentation standards' },
      { value: 'other', label: 'Other', hint: 'General rules' },
    ],
  });

  if (p.isCancel(category)) {
    p.outro('Cancelled');
    return;
  }

  const priority = await p.select({
    message: 'Select priority',
    options: [
      { value: 'high', label: 'High', hint: 'Must follow' },
      { value: 'medium', label: 'Medium', hint: 'Should follow' },
      { value: 'low', label: 'Low', hint: 'Nice to have' },
    ],
  });

  if (p.isCancel(priority)) {
    p.outro('Cancelled');
    return;
  }

  // Ask about path-specific rules
  const isPathSpecific = await p.confirm({
    message: 'Is this rule for specific file patterns only?',
    initialValue: false,
  });

  if (p.isCancel(isPathSpecific)) {
    p.outro('Cancelled');
    return;
  }

  const newRule: Rule = {
    id: `rule-${Date.now()}`,
    content: ruleContent as string,
    category: category as Rule['category'],
    priority: priority as Rule['priority'],
  };

  if (isPathSpecific) {
    const pattern = await p.text({
      message: 'Enter file pattern (glob)',
      placeholder: 'e.g., src/api/**/*.ts or *.test.ts',
    });

    if (p.isCancel(pattern)) {
      p.outro('Cancelled');
      return;
    }

    // Find or create path rule
    let pathRule = config.pathSpecific.find(pr => pr.pattern === pattern);
    if (!pathRule) {
      pathRule = { pattern: pattern as string, rules: [] };
      config.pathSpecific.push(pathRule);
    }
    pathRule.rules.push(newRule);
  } else {
    config.global.push(newRule);
  }

  saveRulesConfig(config);
  p.log.success('Rule added!');

  // Ask if want to add more
  const addMore = await p.confirm({
    message: 'Add another rule?',
    initialValue: false,
  });

  if (addMore && !p.isCancel(addMore)) {
    await rulesAdd([], options);
    return;
  }

  p.outro('Done!');
}

/**
 * List all rules
 */
async function rulesList(options: RulesOptions): Promise<void> {
  p.intro(chalk.bgCyan.black(' rules list '));

  const config = loadRulesConfig();

  if (config.global.length === 0 && config.pathSpecific.length === 0) {
    p.log.warn('No rules configured');
    p.log.info(`Run ${chalk.cyan('unifai rules add')} to add rules`);
    p.outro('');
    return;
  }

  // Show global rules
  if (config.global.length > 0) {
    console.log();
    console.log(chalk.bold('Global Rules:'));
    console.log();
    
    for (const rule of config.global) {
      const priorityIcon = rule.priority === 'high' ? '🔴' : rule.priority === 'medium' ? '🟡' : '🟢';
      const category = rule.category ? chalk.dim(`[${rule.category}]`) : '';
      console.log(`  ${priorityIcon} ${rule.content} ${category}`);
    }
  }

  // Show path-specific rules
  if (config.pathSpecific.length > 0) {
    console.log();
    console.log(chalk.bold('Path-Specific Rules:'));
    
    for (const pathRule of config.pathSpecific) {
      console.log();
      console.log(chalk.cyan(`  ${pathRule.pattern}:`));
      
      for (const rule of pathRule.rules) {
        const priorityIcon = rule.priority === 'high' ? '🔴' : rule.priority === 'medium' ? '🟡' : '🟢';
        console.log(`    ${priorityIcon} ${rule.content}`);
      }
    }
  }

  console.log();
  p.log.info(`Total: ${config.global.length} global, ${config.pathSpecific.reduce((acc, pr) => acc + pr.rules.length, 0)} path-specific`);
  
  p.outro('');
}

/**
 * Remove rules
 */
async function rulesRemove(args: string[], options: RulesOptions): Promise<void> {
  p.intro(chalk.bgCyan.black(' rules remove '));

  const config = loadRulesConfig();
  
  if (config.global.length === 0 && config.pathSpecific.length === 0) {
    p.log.warn('No rules to remove');
    p.outro('');
    return;
  }

  // Select rules to remove
  const ruleOptions = config.global.map((rule, idx) => ({
    value: `global-${idx}`,
    label: rule.content.slice(0, 60) + (rule.content.length > 60 ? '...' : ''),
    hint: rule.category,
  }));

  const toRemove = await p.multiselect({
    message: 'Select rules to remove',
    options: ruleOptions,
    required: true,
  });

  if (p.isCancel(toRemove)) {
    p.outro('Cancelled');
    return;
  }

  // Remove selected rules
  const indicesToRemove = (toRemove as string[])
    .filter(id => id.startsWith('global-'))
    .map(id => parseInt(id.replace('global-', '')))
    .sort((a, b) => b - a); // Sort descending to remove from end first

  for (const idx of indicesToRemove) {
    config.global.splice(idx, 1);
  }

  saveRulesConfig(config);
  p.log.success(`Removed ${indicesToRemove.length} rule(s)`);
  
  p.outro('Done!');
}

/**
 * Sync rules to all detected IDEs
 */
async function rulesSync(options: RulesOptions): Promise<void> {
  p.intro(chalk.bgCyan.black(' rules sync '));

  const config = loadRulesConfig();
  const spinner = p.spinner();

  if (config.global.length === 0 && config.pathSpecific.length === 0) {
    p.log.warn('No rules to sync. Run `unifai rules add` first.');
    p.outro('');
    return;
  }

  const ruleSet: RuleSet = {
    global: config.global,
    pathSpecific: config.pathSpecific,
  };

  spinner.start('Detecting IDEs...');
  
  const adapters = getAllAdapters();
  const detectedIDEs: { id: AgentType; name: string; adapter: typeof adapters[0] }[] = [];

  for (const adapter of adapters) {
    if (await adapter.isInstalled()) {
      detectedIDEs.push({ id: adapter.id, name: adapter.displayName, adapter });
    }
  }

  if (detectedIDEs.length === 0) {
    spinner.stop('No IDEs detected');
    p.log.warn('No supported IDEs found on your system');
    p.outro('');
    return;
  }

  spinner.stop(`Found ${detectedIDEs.length} IDE(s)`);

  // Let user select which IDEs to sync to
  const ideChoices = detectedIDEs.map(ide => ({
    value: ide.id,
    label: ide.name,
  }));

  const selectedIDEs = await p.multiselect({
    message: 'Sync rules to which IDEs?',
    options: ideChoices,
    required: true,
  });

  if (p.isCancel(selectedIDEs)) {
    p.outro('Cancelled');
    return;
  }

  spinner.start('Syncing rules...');

  const results: { ide: string; success: boolean; path: string; error?: string }[] = [];

  for (const ideId of selectedIDEs as AgentType[]) {
    const ide = detectedIDEs.find(i => i.id === ideId);
    if (!ide) continue;

    try {
      const rulesOutput = await ide.adapter.generateRulesConfig(ruleSet);
      const rulesPath = ide.adapter.getRulesPath(process.cwd(), options.global);

      if (typeof rulesOutput === 'string') {
        // Single file output
        const dir = rulesPath.includes('.') ? join(rulesPath, '..') : rulesPath;
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        writeFileSync(rulesPath, rulesOutput);
        results.push({ ide: ide.name, success: true, path: rulesPath });
      } else {
        // Multiple files (like Cursor .mdc files)
        if (!existsSync(rulesPath)) {
          mkdirSync(rulesPath, { recursive: true });
        }
        
        for (const [filename, content] of Object.entries(rulesOutput)) {
          const filePath = join(rulesPath, filename);
          writeFileSync(filePath, content);
          results.push({ ide: ide.name, success: true, path: filePath });
        }
      }
    } catch (error) {
      results.push({
        ide: ide.name,
        success: false,
        path: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  spinner.stop('Sync complete');

  // Show results
  console.log();
  for (const result of results) {
    if (result.success) {
      p.log.success(`${chalk.green('✓')} ${result.ide}`);
      p.log.message(`  ${chalk.dim(result.path)}`);
    } else {
      p.log.error(`${chalk.red('✗')} ${result.ide}: ${result.error}`);
    }
  }

  p.outro('Rules synced!');
}

/**
 * Show available templates
 */
async function rulesTemplates(): Promise<void> {
  p.intro(chalk.bgCyan.black(' rules templates '));

  console.log();
  console.log(chalk.bold('Available Rule Templates:'));
  console.log();

  for (const [name, rules] of Object.entries(RULE_TEMPLATES)) {
    console.log(chalk.cyan(`  ${name}`) + chalk.dim(` (${rules.length} rules)`));
    
    for (const rule of rules.slice(0, 3)) {
      console.log(`    • ${rule.content}`);
    }
    
    if (rules.length > 3) {
      console.log(chalk.dim(`    ... and ${rules.length - 3} more`));
    }
    console.log();
  }

  p.log.info(`Use ${chalk.cyan('unifai rules add <template>')} to add a template`);
  p.outro('');
}

// ============================================================================
// Helpers
// ============================================================================

function loadRulesConfig(): RulesConfig {
  const configPath = join(process.cwd(), RULES_CONFIG_FILE);
  
  if (!existsSync(configPath)) {
    return { ...DEFAULT_RULES_CONFIG };
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { ...DEFAULT_RULES_CONFIG };
  }
}

function saveRulesConfig(config: RulesConfig): void {
  const configPath = join(process.cwd(), RULES_CONFIG_FILE);
  const configDir = join(process.cwd(), '.unifai');
  
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function showRulesHelp(): void {
  console.log();
  console.log(chalk.bold('Usage: unifai rules <action> [options]'));
  console.log();
  console.log('Actions:');
  console.log('  init        Initialize rules configuration');
  console.log('  add         Add new rules (interactive or from template)');
  console.log('  list        List all configured rules');
  console.log('  remove      Remove rules');
  console.log('  sync        Sync rules to detected IDEs');
  console.log('  templates   Show available rule templates');
  console.log();
  console.log('Options:');
  console.log('  --global    Sync to global IDE configuration');
  console.log('  --ide       Sync to specific IDE only');
  console.log();
}

export default rulesCommand;
