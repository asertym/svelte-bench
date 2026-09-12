# AGENTS.md

## Project Overview

SvelteBench: LLM benchmark for Svelte 5 components, HumanEval methodology. Evaluate LLM-generated Svelte components vs predefined test suites, compute pass@k.

**Core Architecture:**

- `index.ts` - Main benchmark orchestrator, full test cycle
- `src/llms/` - Provider abstraction: OpenAI, Anthropic, Google, OpenRouter
- `src/tests/` - Test defs: `prompt.md` + `test.ts` pairs
- `src/utils/test-manager.ts` - Sequential HumanEval logic (default)
- `src/utils/parallel-test-manager.ts` - Parallel HumanEval logic (optional)
- `src/utils/test-runner.ts` - Vitest integration for component testing
- `tmp/` - Runtime dir for generated components (subdirs per test/sample)

## Execution Modes

Two modes:

- **Sequential (default)**: Tests one at a time, samples sequential. Full sample-level checkpointing + resumption. Detailed progress, reliable for long runs.
- **Parallel**: Tests one at a time, samples within test parallel (faster). Full checkpointing + resumption, optimized output. Set `PARALLEL_EXECUTION=true`.

## Common Commands

```bash
# Run full benchmark (sequential execution)
pnpm start

# Run with parallel execution (faster but more verbose)
PARALLEL_EXECUTION=true pnpm start

# Run only tests (without building visualization)
pnpm run run-tests

# Run with context file (Svelte docs)
pnpm run run-tests -- --context ./context/svelte.dev/llms-small.txt

# Run with both parallel execution and context
PARALLEL_EXECUTION=true pnpm run run-tests -- --context ./context/svelte.dev/llms-small.txt

# Run specific test with vitest
pnpm test

# Build visualization from results
pnpm run build

# Verify benchmark results
pnpm run verify
```

## Environment Variables

Control behavior via env vars:

```bash
# Debug mode for faster development testing
DEBUG_MODE=true
DEBUG_PROVIDER=openrouter
DEBUG_MODEL=openai/gpt-oss-20b:free

# Enable parallel execution for faster benchmark runs
PARALLEL_EXECUTION=true
```

Multiple models: `DEBUG_MODEL=model1,model2,model3`

## Test Structure

Each test in `src/tests/` needs:

- `prompt.md` - LLM instructions to generate Svelte component
- `test.ts` - Vitest tests validating generated component
- `Reference.svelte` - Reference impl for validation

Generate components in `tmp/{provider}/`, run tests via integrated Vitest.

## Versioning System

**Current Results:** Fixed test prompts, improved error handling. New runs produce results with:

- Fixed quotation mark issues in prompts (caused model confusion)
- Corrected Svelte binding syntax (`bind:value={text}` not `bind:value="{text}"`)
- Improved test reliability + accuracy
- Clean filenames, no version suffixes (`benchmark-results-2025-08-27T12-34-56.789Z.json`)

**Legacy Results:** Original suite, in `benchmarks/v1/`. May have inconsistencies from prompt formatting.

## Environment Setup

Copy `.env.example` to `.env`, set API keys:

- `OPENAI_API_KEY` - GPT models
- `ANTHROPIC_API_KEY` - Codex models
- `GEMINI_API_KEY` - Gemini models
- `OPENROUTER_API_KEY` - OpenRouter

## Testing and Validation

- Vitest + @testing-library/svelte for component testing
- 120-second timeout per test
- Pass@k via HumanEval (10 samples/test default, 1 for expensive models)
- Results saved to timestamped JSON in `benchmarks/`
