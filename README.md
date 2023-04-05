# Gitpod Question Answering

Uses the GPT LLM to answer questions about Gitpod!

> **Note**
> This is a work in progress, and it might not always give correct answers

# Repo 

We are mostly running a pnpm monorepo, to run scripts use `pnpm run <script name>`

## Scripts

- `start:discord` - start running the discord bot
- `generate:discord-index` - (re)generate the discord question index

## Important folders/files

```
packages/       # The TypeScript packages for this project
  discord/      # The Discord integration
  qa/           # The code for the question answering
scripts/        # Scripts
search-index/   # Generated search index - don't modify!
```

