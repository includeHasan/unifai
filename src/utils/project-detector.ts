/**
 * Project Detector
 * Auto-detects project type and recommends relevant skills
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface DetectedProject {
  type: string;
  displayName: string;
  name?: string;
  version?: string;
  framework?: string;
  recommendedSkills: string[];
  optionalSkills: string[];
  configFile: string;
}

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface PubspecYaml {
  name?: string;
  version?: string;
  dependencies?: Record<string, unknown>;
}

/**
 * Detect project type from directory
 */
export async function detectProject(dir: string = '.'): Promise<DetectedProject | null> {
  const checks: Array<() => DetectedProject | null> = [
    () => checkFlutter(dir),
    () => checkReact(dir),
    () => checkNextJs(dir),
    () => checkVue(dir),
    () => checkAngular(dir),
    () => checkNode(dir),
    () => checkSpringBoot(dir),
    () => checkPython(dir),
    () => checkGo(dir),
    () => checkRust(dir),
    () => checkGeneric(dir),
  ];

  for (const check of checks) {
    const result = check();
    if (result) {
      return result;
    }
  }

  return null;
}

/**
 * Check for Flutter/Dart project
 */
function checkFlutter(dir: string): DetectedProject | null {
  const pubspecPath = join(dir, 'pubspec.yaml');
  if (!existsSync(pubspecPath)) return null;

  try {
    const content = readFileSync(pubspecPath, 'utf-8');
    const isFlutter = content.includes('flutter:') || content.includes('flutter_');
    
    // Parse name and version (simple regex parsing)
    const nameMatch = content.match(/^name:\s*(.+)$/m);
    const versionMatch = content.match(/^version:\s*(.+)$/m);

    return {
      type: isFlutter ? 'flutter' : 'dart',
      displayName: isFlutter ? 'Flutter' : 'Dart',
      name: nameMatch?.[1]?.trim(),
      version: versionMatch?.[1]?.trim(),
      recommendedSkills: isFlutter 
        ? ['flutter', 'clean-code', 'testing']
        : ['dart', 'clean-code', 'testing'],
      optionalSkills: ['git', 'api-design'],
      configFile: 'pubspec.yaml',
    };
  } catch {
    return null;
  }
}

/**
 * Check for React project
 */
function checkReact(dir: string): DetectedProject | null {
  const pkg = readPackageJson(dir);
  if (!pkg) return null;

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  if (!deps['react']) return null;
  
  // Check for Next.js (handled separately)
  if (deps['next']) return null;

  const hasTypescript = !!deps['typescript'];
  const hasVite = !!deps['vite'];
  
  return {
    type: 'react',
    displayName: hasVite ? 'React (Vite)' : 'React',
    name: pkg.name,
    version: pkg.version,
    framework: hasVite ? 'vite' : 'cra',
    recommendedSkills: hasTypescript 
      ? ['react', 'typescript', 'clean-code']
      : ['react', 'clean-code'],
    optionalSkills: ['testing', 'git', 'api-design'],
    configFile: 'package.json',
  };
}

/**
 * Check for Next.js project
 */
function checkNextJs(dir: string): DetectedProject | null {
  const pkg = readPackageJson(dir);
  if (!pkg) return null;

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  if (!deps['next']) return null;

  const hasTypescript = !!deps['typescript'];
  
  return {
    type: 'nextjs',
    displayName: 'Next.js',
    name: pkg.name,
    version: pkg.version,
    framework: 'nextjs',
    recommendedSkills: hasTypescript 
      ? ['react', 'typescript', 'clean-code', 'api-design']
      : ['react', 'clean-code', 'api-design'],
    optionalSkills: ['testing', 'git'],
    configFile: 'package.json',
  };
}

/**
 * Check for Vue project
 */
function checkVue(dir: string): DetectedProject | null {
  const pkg = readPackageJson(dir);
  if (!pkg) return null;

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  if (!deps['vue']) return null;

  const hasTypescript = !!deps['typescript'];
  const hasNuxt = !!deps['nuxt'];
  
  return {
    type: hasNuxt ? 'nuxt' : 'vue',
    displayName: hasNuxt ? 'Nuxt.js' : 'Vue.js',
    name: pkg.name,
    version: pkg.version,
    framework: hasNuxt ? 'nuxt' : 'vue',
    recommendedSkills: hasTypescript 
      ? ['vue', 'typescript', 'clean-code']
      : ['vue', 'clean-code'],
    optionalSkills: ['testing', 'git', 'api-design'],
    configFile: 'package.json',
  };
}

/**
 * Check for Angular project
 */
function checkAngular(dir: string): DetectedProject | null {
  const pkg = readPackageJson(dir);
  if (!pkg) return null;

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  if (!deps['@angular/core']) return null;
  
  return {
    type: 'angular',
    displayName: 'Angular',
    name: pkg.name,
    version: pkg.version,
    framework: 'angular',
    recommendedSkills: ['angular', 'typescript', 'clean-code'],
    optionalSkills: ['testing', 'git', 'api-design'],
    configFile: 'package.json',
  };
}

/**
 * Check for Node.js backend project
 */
function checkNode(dir: string): DetectedProject | null {
  const pkg = readPackageJson(dir);
  if (!pkg) return null;

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  // Check for backend frameworks
  const hasExpress = !!deps['express'];
  const hasFastify = !!deps['fastify'];
  const hasNestJS = !!deps['@nestjs/core'];
  const hasHono = !!deps['hono'];
  const hasTypescript = !!deps['typescript'];
  
  if (!hasExpress && !hasFastify && !hasNestJS && !hasHono) {
    // Check if it's a generic Node project
    if (!existsSync(join(dir, 'package.json'))) return null;
    
    return {
      type: 'node',
      displayName: 'Node.js',
      name: pkg.name,
      version: pkg.version,
      recommendedSkills: hasTypescript 
        ? ['node', 'typescript', 'clean-code']
        : ['node', 'clean-code'],
      optionalSkills: ['testing', 'git', 'api-design'],
      configFile: 'package.json',
    };
  }

  let framework = 'express';
  let displayName = 'Express.js';
  
  if (hasNestJS) {
    framework = 'nestjs';
    displayName = 'NestJS';
  } else if (hasFastify) {
    framework = 'fastify';
    displayName = 'Fastify';
  } else if (hasHono) {
    framework = 'hono';
    displayName = 'Hono';
  }
  
  return {
    type: 'node',
    displayName,
    name: pkg.name,
    version: pkg.version,
    framework,
    recommendedSkills: hasTypescript 
      ? ['node', 'typescript', 'api-design', 'clean-code']
      : ['node', 'api-design', 'clean-code'],
    optionalSkills: ['testing', 'git'],
    configFile: 'package.json',
  };
}

/**
 * Check for Spring Boot project
 */
function checkSpringBoot(dir: string): DetectedProject | null {
  const pomPath = join(dir, 'pom.xml');
  const gradlePath = join(dir, 'build.gradle');
  const gradleKtsPath = join(dir, 'build.gradle.kts');
  
  const hasPom = existsSync(pomPath);
  const hasGradle = existsSync(gradlePath) || existsSync(gradleKtsPath);
  
  if (!hasPom && !hasGradle) return null;

  let isSpringBoot = false;
  let configFile = '';

  if (hasPom) {
    try {
      const content = readFileSync(pomPath, 'utf-8');
      isSpringBoot = content.includes('spring-boot');
      configFile = 'pom.xml';
    } catch {}
  }
  
  if (!isSpringBoot && hasGradle) {
    try {
      const gradleFile = existsSync(gradleKtsPath) ? gradleKtsPath : gradlePath;
      const content = readFileSync(gradleFile, 'utf-8');
      isSpringBoot = content.includes('spring-boot') || content.includes('org.springframework.boot');
      configFile = existsSync(gradleKtsPath) ? 'build.gradle.kts' : 'build.gradle';
    } catch {}
  }
  
  if (isSpringBoot) {
    return {
      type: 'springboot',
      displayName: 'Spring Boot',
      framework: 'springboot',
      recommendedSkills: ['springboot', 'clean-code', 'api-design'],
      optionalSkills: ['testing', 'git'],
      configFile,
    };
  }

  // Generic Java project
  return {
    type: 'java',
    displayName: 'Java',
    recommendedSkills: ['clean-code'],
    optionalSkills: ['testing', 'git'],
    configFile,
  };
}

/**
 * Check for Python project
 */
function checkPython(dir: string): DetectedProject | null {
  const requirementsPath = join(dir, 'requirements.txt');
  const pyprojectPath = join(dir, 'pyproject.toml');
  const setupPyPath = join(dir, 'setup.py');
  
  const hasRequirements = existsSync(requirementsPath);
  const hasPyproject = existsSync(pyprojectPath);
  const hasSetupPy = existsSync(setupPyPath);
  
  if (!hasRequirements && !hasPyproject && !hasSetupPy) return null;

  let framework: string | undefined;
  let displayName = 'Python';
  
  // Check for frameworks in requirements or pyproject
  const filesToCheck = [requirementsPath, pyprojectPath].filter(existsSync);
  
  for (const file of filesToCheck) {
    try {
      const content = readFileSync(file, 'utf-8').toLowerCase();
      if (content.includes('django')) {
        framework = 'django';
        displayName = 'Django';
        break;
      } else if (content.includes('fastapi')) {
        framework = 'fastapi';
        displayName = 'FastAPI';
        break;
      } else if (content.includes('flask')) {
        framework = 'flask';
        displayName = 'Flask';
        break;
      }
    } catch {}
  }
  
  return {
    type: 'python',
    displayName,
    framework,
    recommendedSkills: ['python', 'clean-code'],
    optionalSkills: framework ? ['api-design', 'testing', 'git'] : ['testing', 'git'],
    configFile: hasPyproject ? 'pyproject.toml' : hasRequirements ? 'requirements.txt' : 'setup.py',
  };
}

/**
 * Check for Go project
 */
function checkGo(dir: string): DetectedProject | null {
  const goModPath = join(dir, 'go.mod');
  if (!existsSync(goModPath)) return null;

  try {
    const content = readFileSync(goModPath, 'utf-8');
    const moduleMatch = content.match(/^module\s+(.+)$/m);
    
    return {
      type: 'go',
      displayName: 'Go',
      name: moduleMatch?.[1]?.trim(),
      recommendedSkills: ['clean-code'],
      optionalSkills: ['api-design', 'testing', 'git'],
      configFile: 'go.mod',
    };
  } catch {
    return null;
  }
}

/**
 * Check for Rust project
 */
function checkRust(dir: string): DetectedProject | null {
  const cargoPath = join(dir, 'Cargo.toml');
  if (!existsSync(cargoPath)) return null;

  try {
    const content = readFileSync(cargoPath, 'utf-8');
    const nameMatch = content.match(/^name\s*=\s*"(.+)"/m);
    const versionMatch = content.match(/^version\s*=\s*"(.+)"/m);
    
    return {
      type: 'rust',
      displayName: 'Rust',
      name: nameMatch?.[1],
      version: versionMatch?.[1],
      recommendedSkills: ['clean-code'],
      optionalSkills: ['testing', 'git'],
      configFile: 'Cargo.toml',
    };
  } catch {
    return null;
  }
}

/**
 * Check for generic project with git
 */
function checkGeneric(dir: string): DetectedProject | null {
  const gitPath = join(dir, '.git');
  if (!existsSync(gitPath)) return null;
  
  return {
    type: 'generic',
    displayName: 'Project',
    recommendedSkills: ['clean-code', 'git'],
    optionalSkills: ['testing'],
    configFile: '.git',
  };
}

/**
 * Read and parse package.json
 */
function readPackageJson(dir: string): PackageJson | null {
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return null;

  try {
    const content = readFileSync(pkgPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Get project type display with icon
 */
export function getProjectIcon(type: string): string {
  const icons: Record<string, string> = {
    flutter: '🦋',
    dart: '🎯',
    react: '⚛️',
    nextjs: '▲',
    vue: '🍃',
    nuxt: '🍃',
    angular: '🅰️',
    node: '🟢',
    springboot: '🍃',
    java: '☕',
    python: '🐍',
    go: '🐹',
    rust: '🦀',
    generic: '📁',
  };
  return icons[type] || '📁';
}
