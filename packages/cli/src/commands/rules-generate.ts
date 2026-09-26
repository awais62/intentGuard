import fs from 'node:fs/promises';
import path from 'node:path';
import { getRepoRoot } from '@intentguard/core';
import { success, error } from '../ui/formatters.js';

interface RulesGenerateOptions {
  agent?: string;
}

const UNIVERSAL_RULE_CONTENT = `
# IntentGuard Agent Rules

You are working in a repository protected by IntentGuard — the local intent layer for AI coding agents.

> **Execution Lifecycle:**
> Request → Evidence → Clarify → IntentSpec → Readiness Gate → Code → Scope Check → Verify → Commit

## 1. Before Writing Code (Intent Engineering)
- Call \`intent_create\` with the raw developer request to initialize the IntentSpec.
- Call \`intent_gather_evidence\` to inspect affected files, related tests, and docs.
- Call \`intent_questions\` to identify any missing specifications or ambiguities.
- Call \`intent_readiness\` to run the 6 readiness gates.
  - **CRITICAL GATE**: If readiness score < 70, you are **BLOCKED** from writing code. Address the blockers first.

## 2. While Coding (Scope Fence)
- Before editing ANY file, call \`intent_check_scope\` with the file path.
- If \`intent_check_scope\` returns **BLOCKED**, you **MUST NOT** edit that file. Respect the Scope fence.

## 3. After Coding (Proof & Verification)
- Call \`intent_verify\` to evaluate git diff against Scope and run tests mapped to Outcomes and Health Metrics.
- Call \`intent_report\` to generate the formal Proof Report.
- Never declare work complete without a passing IntentGuard proof report.
`;

const BOB_RULE_CONTENT = `
# IBM Bob 2.0 + IntentGuard Integration Rules

You are IBM Bob 2.0 operating with the IntentGuard local intent layer. Use your parallel subagent architecture to execute intent verification with maximum rigor.

## Subagent Role Matrix
- **Repo Scout**: Call \`intent_gather_evidence\` in parallel across affected modules.
- **Docs Reader**: Inspect API docs and READMEs for constraints to anchor in the IntentSpec.
- **Risk Critic**: Call \`intent_questions\` to challenge assumptions and surface edge cases.
- **Judge Subagent**: Call \`intent_readiness\` and verify all 6 gates pass before triggering Builder.
- **Builder Subagent**: Guard each file change with \`intent_check_scope\`. Fenced by Scope.
- **Verifier Subagent**: Call \`intent_verify\` and \`intent_report\` to generate the Proof Report.

## Mandatory Pipeline
1. Draft: \`intent_create\`
2. Evidence: \`intent_gather_evidence\`
3. Gate: \`intent_readiness\` (Must score >= 70)
4. Build: \`intent_check_scope\` on every file
5. Proof: \`intent_verify\` & \`intent_report\`
`;

/**
 * Generates agent rule files.
 * @param options Options for the rules-generate command
 */
export async function rulesGenerateCommand(options: RulesGenerateOptions): Promise<void> {
  try {
    const repoRoot = await getRepoRoot();
    
    const writeRule = async (filePath: string, content: string) => {
      const fullPath = path.join(repoRoot, filePath);
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, content.trim() + '\n', 'utf8');
      console.log(success(`Generated rule file: ${filePath}`));
    };
    
    if (!options.agent || options.agent === 'universal' || options.agent === 'all') {
      await writeRule('AGENTS.md', UNIVERSAL_RULE_CONTENT);
    }
    
    if (!options.agent || options.agent === 'claude' || options.agent === 'all') {
      await writeRule('CLAUDE.md', UNIVERSAL_RULE_CONTENT);
    }
    
    if (!options.agent || options.agent === 'cursor' || options.agent === 'all') {
      await writeRule('.cursor/rules/intentguard.mdc', UNIVERSAL_RULE_CONTENT);
    }

    if (!options.agent || options.agent === 'bob' || options.agent === 'all') {
      await writeRule('.bob/rules.md', BOB_RULE_CONTENT);
    }
    
  } catch (err: any) {
    console.error(error(`Rules generation failed: ${err.message}`));
    process.exit(1);
  }
}
