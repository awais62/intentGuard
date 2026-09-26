# IntentGuard

**Any agent. Clear intent. Proven changes.**

> Request → Intent → Code → Proof → Commit

IntentGuard is a **local intent layer** for AI coding agents (IBM Bob 2.0, Claude Code, Cursor, Codex). It doesn't replace your coding agent — it plugs into it through a **CLI + MCP server + Web Dashboard**, so that before the agent writes code, the intent is clear, and after it writes code, the result is verified against that intent.

---

## Quick Start: Running IntentGuard

### 1. Prerequisites
- **Node.js**: `>= 20.0.0`
- **Package Manager**: `pnpm` (Install via `npm install -g pnpm`)

### 2. Install & Build Monorepo

```bash
# Clone the repository
git clone https://github.com/awaisaziz/IntentGuard.git
cd IntentGuard

# Install dependencies across all packages
pnpm install

# Build all packages (@intentguard/core, mcp-server, cli, web)
pnpm run build
```

---

## Running the Web Dashboard (Frontend)

IntentGuard includes an interactive, real-time web dashboard built with **Next.js 15 App Router**, **React 19**, and **Tailwind CSS**.

```bash
# Start the web dashboard in development mode
pnpm run dev:web

# Or start directly with the web filter
pnpm --filter @intentguard/web dev
```

Open your browser at **[http://localhost:3847](http://localhost:3847)** (or default port).

### Dashboard Capabilities
- **Overview (`/`)**: Displays the 5-step `IntentFlow` pipeline visualizer (Request → Intent → Code → Proof → Commit), active spec readiness score, and quick metrics.
- **Spec Inventory (`/specs`)**: Search, filter, and inspect all repository IntentSpecs by status (`draft`, `approved`, `shipped`, `verified`).
- **8-Part Spec Detail (`/specs/[id]`)**: Deep-dive into each section:
  1. *Objective & Problem Severity*
  2. *Measurable Outcomes* (with test mappings)
  3. *Evidence Board* (with trust tiers: `high`, `medium`, `low` and signal excerpts)
  4. *Constraints*
  5. *Scope Fence* (interactive in-scope vs. out-of-scope boundaries)
  6. *Edge Cases*
  7. *Health Metrics*
  8. *Verification Plan*
- **Readiness Gate Audit (`/specs/[id]/readiness`)**: Live scorecard evaluating the 6 readiness gates and highlighting any blocking issues before coding starts.
- **Proof Report (`/specs/[id]/report`)**: Inspection view verifying git diff against scope and automated test passes for commit readiness.
- **Settings & Integrations (`/settings`)**: Monitor detected coding agents (IBM Bob, Claude Code, Cursor, Codex) and LLM providers (IBM watsonx Granite / local Ollama).

---

## Running the CLI

You can execute the CLI binary directly or through the root npm script:

```bash
# Via npm script
pnpm run cli -- <command>

# Or directly using Node
node packages/cli/dist/index.js <command>
```

### CLI Command Reference

| Command | Action |
|---|---|
| `pnpm run cli -- init` | Initializes `.intent/` directory and detects project metadata |
| `pnpm run cli -- new "<request>"` | Drafts a new IntentSpec using LLM with interactive refinement |
| `pnpm run cli -- check [specId]` | Runs the 6 readiness gates; outputs score (0-100%) and blockers |
| `pnpm run cli -- verify [specId]` | Evaluates git diff against the scope fence and runs mapped tests |
| `pnpm run cli -- report [specId]` | Formats and outputs the complete proof report |
| `pnpm run cli -- commit [specId]` | Enforces verification before creating git commit with `[intent:{id}]` |
| `pnpm run cli -- mcp setup --all` | Configures detected AI agents (Bob, Claude Code, Cursor, Codex) |
| `pnpm run cli -- rules generate` | Generates `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, `.bob/rules.md` |

### Try It Now: Verify the Demo Specs

```bash
# Check the sample IBM Galaxium Travels spec (approved, score: 100%)
pnpm run cli -- check intent-demo-galaxium

# Check an intentionally vague request (blocked, score: 20%)
pnpm run cli -- check intent-vague-request

# Print the proof report for the active spec
pnpm run cli -- report intent-demo-galaxium
```

---

## Running the MCP Server for AI Agents

The Model Context Protocol (MCP) server allows AI agents (IBM Bob 2.0, Claude Code, Cursor, Codex) to invoke IntentGuard tools natively via `stdio`.

### 1. Auto-configure Agents (Recommended)

```bash
pnpm run cli -- mcp setup --all
pnpm run cli -- rules generate
```

This automatically writes the proper configuration files:
- **Claude Code**: `~/.claude/mcp_servers.json`
- **Cursor**: `.cursor/mcp.json`
- **IBM Bob 2.0**: `.bob/mcp.json` and `.bob/rules.md`
- **Codex**: `.codex/mcp.json`

### 2. Manual Agent Configuration Example

```json
{
  "mcpServers": {
    "intentguard": {
      "command": "npx",
      "args": ["@intentguard/mcp-server"]
    }
  }
}
```

### Available MCP Tools

| Tool | Trigger | Action |
|---|---|---|
| `intent_create` | New user request | Creates structured IntentSpec draft |
| `intent_gather_evidence` | Before planning | Extracts affected files, tests, and documentation |
| `intent_questions` | When gaps exist | Surfaces questions the codebase cannot answer |
| `intent_readiness` | Before editing | **Blocks coding** if readiness score < 70% |
| `intent_get_spec` | While coding | Retrieves approved spec as working brief |
| `intent_check_scope` | Before file edit | **Blocks file edits** outside `inScope` or within `outOfScope` |
| `intent_verify` | After coding | Verifies diff against scope and runs mapped test suite |
| `intent_report` | Before commit | Generates human-readable and commit-ready proof report |

---

## Running Automated Tests

Run the Vitest test suite for `@intentguard/core`:

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm --filter @intentguard/core run test:watch
```

---

## Project Structure

```
IntentGuard/
├── packages/
│   ├── core/          # IntentSpec engine, 6-gate readiness scorer, scope fence, verifier
│   ├── mcp-server/    # Model Context Protocol stdio server exposing 8 tools
│   ├── cli/           # `intent` binary implementation
│   └── web/           # Next.js 15 App Router local dashboard (port 3847)
├── .intent/           # Local versioned intent store (specs, reports, config.json)
├── AGENTS.md          # Universal multi-agent rule specification
├── CLAUDE.md          # Claude Code rule file
├── .cursor/rules/     # Cursor rule file (.mdc)
└── .bob/rules.md      # IBM Bob 2.0 parallel subagent workflow rules
```

## The Three Engineering Layers

| Layer | Question | Example tool | IntentGuard's Role |
|---|---|---|---|
| **Prompt** | What did the developer ask? | The agent itself | Captures raw request |
| **Context** | What does the code look like? | CodeAtlas, repo indexers, LSP | Gathers repo evidence |
| **Intent** | **Is this the right change, and did it work?** | **IntentGuard** | Structure, Gate, Scope, Proof |

> Context tools tell the agent *what the code looks like*. IntentGuard tells the agent *what should change, what must not, and how to prove it*.

---

## License

MIT © Awais Aziz
