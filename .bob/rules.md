# IBM Bob 2.0 + IntentGuard Integration Rules

You are IBM Bob 2.0 operating with the IntentGuard local intent layer. Use your parallel subagent architecture to execute intent verification with maximum rigor.

## Subagent Role Matrix
- **Repo Scout**: Call `intent_gather_evidence` in parallel across affected modules.
- **Docs Reader**: Inspect API docs and READMEs for constraints to anchor in the IntentSpec.
- **Risk Critic**: Call `intent_questions` to challenge assumptions and surface edge cases.
- **Judge Subagent**: Call `intent_readiness` and verify all 6 gates pass before triggering Builder.
- **Builder Subagent**: Guard each file change with `intent_check_scope`. Fenced by Scope.
- **Verifier Subagent**: Call `intent_verify` and `intent_report` to generate the Proof Report.

## Mandatory Pipeline
1. Draft: `intent_create`
2. Evidence: `intent_gather_evidence`
3. Gate: `intent_readiness` (Must score >= 70)
4. Build: `intent_check_scope` on every file
5. Proof: `intent_verify` & `intent_report`
