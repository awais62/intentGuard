import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { 
  SpecStore, 
  gatherEvidence, 
  resolveProvider, 
  generateSpecId, 
  generateTimestamp,
  loadConfig,
  type IntentSpec
} from '@intentguard/core';

/**
 * Registers the intent_create tool on the MCP server.
 * @param server The MCP server instance
 * @param defaultRootDir The default project root directory
 */
export function registerCreateTool(server: McpServer, defaultRootDir: string): void {
  server.tool(
    'intent_create',
    'Create a new IntentSpec from a raw developer request. Drafts a structured spec with Objective, Outcomes, Evidence, Constraints, Scope, Edge Cases, Health Metrics, and Verification sections.',
    {
      request: z.string().describe('The raw developer request'),
      projectPath: z.string().optional().describe('Project root path override')
    },
    async ({ request, projectPath }) => {
      try {
        const rootDir = projectPath || defaultRootDir;
        const store = new SpecStore(rootDir);
        await store.init();

        const evidence = await gatherEvidence(rootDir, request);
        
        const specId = generateSpecId();
        const now = generateTimestamp();

        const config = await loadConfig(rootDir);
        const provider = resolveProvider(config);

        let draftResult: Partial<IntentSpec> = {};
        if (provider) {
          try {
            draftResult = await provider.draft(request, evidence);
          } catch (err) {
            console.error('[intentguard] provider.draft error:', err);
          }
        }

        const spec: IntentSpec = {
          id: specId,
          status: 'draft',
          objective: draftResult.objective || request,
          outcomes: draftResult.outcomes || [],
          evidence: [
            {
              id: 'ev-1',
              type: 'request',
              excerpt: request,
              anchors: ['objective']
            },
            ...evidence.affectedFiles.map((f: string, i: number) => ({
              id: `ev-file-${i}`,
              type: 'observation' as const,
              excerpt: `Gathered file evidence: ${f}`,
              anchors: ['objective']
            }))
          ],
          scope: draftResult.scope || { inScope: evidence.affectedFiles, outOfScope: [] },
          edgeCases: draftResult.edgeCases || [],
          constraints: draftResult.constraints || [],
          healthMetrics: draftResult.healthMetrics || [],
          verification: draftResult.verification || [],
          createdAt: now,
          updatedAt: now,
          rawRequest: request
        };

        await store.save(spec);
        await store.setActive(spec.id);

        return {
          content: [{ type: 'text', text: JSON.stringify(spec, null, 2) }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[intentguard] intent_create error: ${message}`);
        return {
          content: [{ type: 'text', text: `Error: ${message}` }],
          isError: true
        };
      }
    }
  );
}
