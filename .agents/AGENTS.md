# Agent Rules

## Privacy & Environment Isolation
- NEVER hardcode local environment-specific paths, system-specific directories (such as `/Users/username/project`), or sensitive user details in repository files or code.
- If a path is required to run the application, design the code to accept it dynamically via command-line arguments (e.g., `process.argv`), environment variables, or user prompts, defaulting to the current working directory (`process.cwd()`) where appropriate.
- Always use generic, neutral placeholders (e.g., `/path/to/media`, `/path/to/project`, or `<username>`) in READMEs, examples, and documentation.
