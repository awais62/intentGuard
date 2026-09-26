# AGENTS.md

Guide for any AI coding agent (Claude Code, Cursor, Codex, IBM Bob) working in this repository.

- **What we are building:** see [PRD.md](PRD.md).
- **How intent is captured, gated, and proven:** see [INTENT.md](INTENT.md).

## Current Focus

This stage covers the **backend and the MCP connector** only: `packages/core`, `packages/server`, `packages/mcp-server`, and `packages/cli`.
**Do not change `packages/web`** (frontend UI) unless the developer explicitly asks for it. It still runs on mock data.

## Repository Layout

| Path | Purpose |
|---|---|
| `packages/core` | All domain logic: IntentSpec schema, readiness gates, scope fence, verifier, spec store, LLM providers, agent registry |
| `packages/server` | HTTP API (Hono) over `core`, default port `3848` |
| `packages/mcp-server` | MCP stdio server exposing the 8 `intent_*` tools |
| `packages/cli` | The `intent` command |
| `packages/web` | Next.js dashboard (out of scope for now) |
| `.intent/` | Specs, proof reports, and `config.json` (`active.json` is local state and git-ignored) |

## Commands

```bash
pnpm install          # install workspace dependencies
pnpm build            # build every package (core builds first)
pnpm test             # vitest for core and server
pnpm dev:server       # run the API with reload on http://localhost:3848/api
pnpm agents:setup     # regenerate agent MCP configs and rule blocks
```

## Conventions

- ESM throughout. Relative imports in TypeScript use the `.js` suffix (`import { x } from './y.js'`).
- Logic belongs in `core`. The server, MCP server, and CLI stay thin wrappers that call `core`, so every entry point behaves the same (for example `draftSpec` is shared by all three).
- Add or update Vitest tests next to the package you change (`packages/<pkg>/test`).
- Agent integrations are defined once in `packages/core/src/agents/`. Never hand-edit `.mcp.json`, `.cursor/`, `.codex/`, or `.bob/`: they are generated and git-ignored.
- Never commit secrets, absolute local paths, or personal data. Configuration comes from environment variables (`WATSONX_API_KEY`, `INTENT_ROOT`, `INTENTGUARD_API_PORT`).

<!-- intentguard:start (managed by `intent agents setup`, edits inside are overwritten) -->
# IntentGuard Agent Rules

You are working in a repository protected by IntentGuard — the local intent layer for AI coding agents.

> **Execution Lifecycle:**
> Request → Evidence → Clarify → IntentSpec → Readiness Gate → Code → Scope Check → Verify → Commit

## 1. Before Writing Code (Intent Engineering)
- Call `intent_create` with the raw developer request to initialize the IntentSpec.
- Call `intent_gather_evidence` to inspect affected files, related tests, and docs.
- Call `intent_questions` to identify any missing specifications or ambiguities.
- Call `intent_readiness` to run the 6 readiness gates.
  - **CRITICAL GATE**: If readiness score < 70, you are **BLOCKED** from writing code. Address the blockers first.

## 2. While Coding (Scope Fence)
- Before editing ANY file, call `intent_check_scope` with the file path.
- If `intent_check_scope` returns **BLOCKED**, you **MUST NOT** edit that file. Respect the Scope fence.

## 3. After Coding (Proof & Verification)
- Call `intent_verify` to evaluate git diff against Scope and run tests mapped to Outcomes and Health Metrics.
- Call `intent_report` to generate the formal Proof Report.
- Never declare work complete without a passing IntentGuard proof report.
<!-- intentguard:end -->
