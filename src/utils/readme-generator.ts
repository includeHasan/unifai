import { writeFile } from 'fs/promises';
import * as path from 'path';
import { getAgentsDir, getInstalledSkills } from './fs-helpers.js';
import { registry } from '../registry.js';

/**
 * Generate the README.md content for .agents folder
 */
export function generateReadmeContent(installedFolders: string[]): string {
  const date = new Date().toISOString().split('T')[0];

  // Map folder names back to skill info
  const skills = installedFolders.map(folderName => {
    const skillEntry = Object.entries(registry).find(
      ([_, info]) => info.folderName === folderName
    );

    if (skillEntry) {
      const [id, info] = skillEntry;
      return {
        folderName,
        id,
        description: info.description
      };
    }

    // Unknown skill (manually added)
    return {
      folderName,
      id: folderName.replace('-skills', ''),
      description: 'Custom skill'
    };
  });

  // Sort alphabetically by folder name
  skills.sort((a, b) => a.folderName.localeCompare(b.folderName));

  let content = `# Development Skills & Patterns

AI agents: Read the \`skills.md\` in each folder for specific patterns and guidelines.

## Installed Skills

`;

  if (skills.length === 0) {
    content += `_No skills installed yet._

Install skills using:
\`\`\`bash
npx agent-skills install flutter react
\`\`\`
`;
  } else {
    content += `| Skill | Description |
|-------|-------------|
`;

    for (const skill of skills) {
      content += `| [${skill.id}](./${skill.folderName}/skills.md) | ${skill.description} |
`;
    }
  }

  content += `
---

_Last updated: ${date}_
_Managed by [agent-skills](https://www.npmjs.com/package/agent-skills)_
`;

  return content;
}

/**
 * Update the README.md in .agents folder
 */
export async function updateReadme(targetDir: string = '.'): Promise<string> {
  const agentsDir = getAgentsDir(targetDir);
  const readmePath = path.join(agentsDir, 'README.md');

  // Get installed skills
  const installedFolders = await getInstalledSkills(targetDir);

  // Generate content
  const content = generateReadmeContent(installedFolders);

  // Write file
  await writeFile(readmePath, content, 'utf8');

  return readmePath;
}
