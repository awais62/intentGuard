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
