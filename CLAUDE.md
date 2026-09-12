# CLAUDE.md

Guidance for Claude Code in this repo.

## Overview

SvelteBench: LLM benchmark for Svelte 5 components. HumanEval method. Tests
LLM-generated Svelte components vs predefined suites. Computes pass@k.

**Arch:**

- `index.ts` - Main orchestrator, full test cycle
- `src/llms/` - Provider abstraction: OpenAI, Anthropic, Google, OpenRouter
- `src/tests/` - Test defs: `prompt.md` + `test.ts` pairs
- `src/utils/test-manager.ts` - Sequential HumanEval (default)
- `src/utils/parallel-test-manager.ts` - Parallel HumanEval (optional)
- `src/utils/test-runner.ts` - Vitest for components
- `tmp/` - Runtime dir, generated components (subdirs per test/sample)

## Modes

- **Sequential (default)**: One test at a time, samples sequential. Full
  checkpointing + resumption. Detailed progress. Reliable for long runs.
- **Parallel**: One test at a time, samples within test parallel (faster).
  Full checkpointing + resumption. Set `PARALLEL_EXECUTION=true`.

## Commands

```bash
pnpm start                     # full benchmark (sequential)
pnpm tui                       # interactive TUI
pnpm run-tests                 # env/CLI benchmark directly
PARALLEL_EXECUTION=true pnpm run-tests   # parallel (faster, verbose)
pnpm run run-tests             # tests only (no viz build)
pnpm run run-tests -- --context ./context/svelte.dev/llms-small.txt
PARALLEL_EXECUTION=true pnpm run run-tests -- --context ./context/svelte.dev/llms-small.txt
pnpm test                      # specific test (vitest)
pnpm run build                 # build visualization
pnpm run verify                # verify results
```

## Env Vars

```bash
DEBUG_MODE=true
DEBUG_PROVIDER=openrouter
DEBUG_MODEL=openai/gpt-oss-20b:free
PARALLEL_EXECUTION=true
```

Multiple models: `DEBUG_MODEL=model1,model2,model3`

## Test Structure

Each test in `src/tests/`:

- `prompt.md` - LLM instructions to generate component
- `test.ts` - Vitest tests validating component
- `Reference.svelte` - Reference impl for validation

Components generated in `tmp/{provider}/`, tested via Vitest.

## Versioning

**Current Results:** Fixed prompts, better error handling. New runs:

- Fixed quotation mark issues in prompts (caused model confusion)
- Corrected Svelte binding (`bind:value={text}` not `bind:value="{text}"`)
- Better test reliability
- Clean filenames, no version suffix (`benchmark-results-2025-08-27T12-34-56.789Z.json`)

**Legacy Results:** Original suite in `benchmarks/v1/`. May have inconsistencies.

## Setup

Copy `.env.example` to `.env`, set keys:

- `OPENAI_API_KEY` - GPT
- `ANTHROPIC_API_KEY` - Claude
- `GEMINI_API_KEY` - Gemini
- `OPENROUTER_API_KEY` - OpenRouter

## Testing

- Vitest + @testing-library/svelte
- 120s timeout per test
- pass@k via HumanEval (10 samples/test default, 1 for expensive models)
- Results: timestamped JSON in `benchmarks/`
