/**
 * Default Prompt Templates
 * 
 * Standard intro paragraphs and templates that get included in generated
 * agent configurations and rules files. Users can copy-paste and customize.
 */

/**
 * Default intro paragraph for AGENTS.md / CLAUDE.md files
 */
export const DEFAULT_AGENT_INTRO = `You are an expert AI coding assistant working on this project. Follow these instructions carefully to provide the best assistance.

## Your Behavior

- **Be precise**: Write clean, efficient code following the project's conventions
- **Be proactive**: Suggest improvements and catch potential issues early
- **Be thorough**: Consider edge cases, error handling, and testing
- **Be concise**: Explain only what's necessary, focus on the code
- **Ask clarifying questions** when requirements are ambiguous

## When Writing Code

1. Follow the existing code style and patterns
2. Add appropriate error handling
3. Include helpful comments for complex logic
4. Consider performance implications
5. Write testable code

## When Reviewing Code

1. Check for bugs and edge cases
2. Suggest performance improvements
3. Ensure proper error handling
4. Verify code follows project conventions
`;

/**
 * Default rules that should be included in every project
 */
export const DEFAULT_RULES = [
    'Follow the existing code style and formatting conventions',
    'Write clear, self-documenting code with meaningful names',
    'Add error handling for all external calls and user inputs',
    'Keep functions small and focused on a single responsibility',
    'Write tests for new functionality when applicable',
];

/**
 * Technology-specific prompts
 */
export const TECH_PROMPTS: Record<string, string> = {
    typescript: `
## TypeScript Guidelines

- Use strict TypeScript with proper type annotations
- Prefer interfaces over type aliases for object shapes
- Use \`unknown\` instead of \`any\` when type is uncertain
- Leverage utility types (Partial, Required, Pick, Omit)
- Enable strict null checks and handle nullability properly
`,

    react: `
## React Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use proper TypeScript types for props
- Implement proper error boundaries
- Memoize expensive computations with useMemo/useCallback
`,

    node: `
## Node.js Guidelines

- Use async/await for asynchronous operations
- Implement proper error handling middleware
- Use environment variables for configuration
- Follow REST API best practices
- Add request validation and sanitization
`,

    flutter: `
## Flutter Guidelines

- Follow Flutter's widget composition patterns
- Use const constructors where possible
- Implement proper state management
- Handle platform-specific code appropriately
- Follow Dart naming conventions
`,

    python: `
## Python Guidelines

- Follow PEP 8 style guidelines
- Use type hints for function signatures
- Write docstrings for public functions
- Use virtual environments for dependencies
- Handle exceptions appropriately
`,
};

/**
 * Get combined prompt for a tech stack
 */
export function getPromptForTechStack(techStack: string[]): string {
    const prompts: string[] = [];

    for (const tech of techStack) {
        const normalizedTech = tech.toLowerCase();
        if (TECH_PROMPTS[normalizedTech]) {
            prompts.push(TECH_PROMPTS[normalizedTech]);
        }
    }

    return prompts.join('\n');
}

/**
 * MCP instruction template
 */
export const MCP_INTRO = `
## Available Tools (MCP)

You have access to the following tools through the Model Context Protocol.
Use them when appropriate to assist with tasks:
`;

/**
 * Generate a complete agent intro with optional customizations
 */
export function generateAgentIntro(options?: {
    projectName?: string;
    description?: string;
    techStack?: string[];
    includeMCP?: boolean;
}): string {
    const sections: string[] = [];

    // Project header
    if (options?.projectName) {
        sections.push(`# ${options.projectName}\n`);
    } else {
        sections.push('# Project Instructions\n');
    }

    // Description
    if (options?.description) {
        sections.push(`${options.description}\n`);
    }

    // Default intro
    sections.push(DEFAULT_AGENT_INTRO);

    // Tech-specific prompts
    if (options?.techStack && options.techStack.length > 0) {
        const techPrompts = getPromptForTechStack(options.techStack);
        if (techPrompts) {
            sections.push(techPrompts);
        }
    }

    // MCP section
    if (options?.includeMCP) {
        sections.push(MCP_INTRO);
    }

    return sections.join('\n');
}
