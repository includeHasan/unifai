# Agent Skills

Install AI agent skills for any project. Works with **Claude Code**, **Cursor**, **OpenCode**, and other AI agents.

## Installation

```bash
# Install skills directly (recommended)
npx agent-skills install flutter react

# Or install globally
npm install -g agent-skills
agent-skills install flutter
```

## Usage

### Install Skills

```bash
# Install one skill
npx agent-skills install flutter

# Install multiple skills
npx agent-skills install flutter react clean-code

# Short form
npx agent-skills i flutter react
```

### List Skills

```bash
npx agent-skills list

# Output:
# Available Skills:
#   ✓ flutter       Flutter/Dart best practices (installed)
#   ✓ react         React/Next.js patterns (installed)
#     clean-code    Universal clean code principles
#     typescript    TypeScript patterns
```

### Remove Skills

```bash
npx agent-skills remove flutter

# Remove multiple
npx agent-skills rm flutter react
```

### Initialize

```bash
# Create .agents folder without installing skills
npx agent-skills init
```

## Result

After installation, your project will have:

```
.agents/
├── README.md              # Auto-generated index
├── flutter-skills/
│   ├── skills.md          # Main skill file
│   └── references/        # Detailed documentation
└── react-skills/
    ├── skills.md
    └── references/
```

## Available Skills

| Skill | Description |
|-------|-------------|
| `flutter` | Flutter/Dart best practices and patterns |
| `react` | React/Next.js performance optimization |
| `clean-code` | Universal clean code principles |
| `typescript` | TypeScript type patterns |
| `api-design` | REST and GraphQL API design |
| `git` | Git workflows and conventions |
| `testing` | Testing strategies and patterns |
| `springboot` | Spring Boot and Java patterns |
| `node` | Node.js/Express patterns |
| `python` | Python best practices |

## How It Works

1. Skills are installed in `.agents/` folder in your project root
2. AI agents automatically read these files for context
3. Each skill contains `skills.md` with patterns and `references/` with details
4. Auto-generated `README.md` indexes all installed skills

## For AI Agents

The `.agents/README.md` serves as an index. Read `skills.md` in each subfolder for specific patterns and guidelines.

## Contributing

Want to add a new skill? See our [contribution guide](CONTRIBUTING.md).

## License

MIT
