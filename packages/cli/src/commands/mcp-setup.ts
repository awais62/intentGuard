import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { getRepoRoot } from '@intentguard/core';
import { success, error, warning } from '../ui/formatters.js';

interface McpSetupOptions {
  all?: boolean;
  agent?: string;
}

/**
 * Detects and configures MCP for AI agents.
 * @param options Options for the mcp-setup command
 */
export async function mcpSetupCommand(options: McpSetupOptions): Promise<void> {
  try {
    const repoRoot = await getRepoRoot();
    const homeDir = os.homedir();
    
    let configured = 0;
    
    // 1. Claude Code
    if (options.all || options.agent === 'claude') {
      const claudeDir = path.join(homeDir, '.claude');
      const mcpServersPath = path.join(claudeDir, 'mcp_servers.json');
      try {
        await fs.mkdir(claudeDir, { recursive: true });
        let mcpConfig: any = {};
        try {
          const content = await fs.readFile(mcpServersPath, 'utf8');
          mcpConfig = JSON.parse(content);
        } catch {
          // File doesn't exist or is invalid JSON
        }
        
        mcpConfig.intentguard = {
          command: 'npx',
          args: ['@intentguard/mcp-server'],
          env: { INTENT_ROOT: repoRoot }
        };
        
        await fs.writeFile(mcpServersPath, JSON.stringify(mcpConfig, null, 2));
        console.log(success('Configured Claude Code MCP (~/.claude/mcp_servers.json).'));
        configured++;
      } catch (err: any) {
        if (options.agent === 'claude') {
          console.log(warning(`Claude Code setup failed: ${err.message}`));
        }
      }
    }
    
    // 2. Cursor
    if (options.all || options.agent === 'cursor') {
      const cursorDirLocal = path.join(repoRoot, '.cursor');
      const targetFile = path.join(cursorDirLocal, 'mcp.json');
      
      try {
        await fs.mkdir(cursorDirLocal, { recursive: true });
        let mcpConfig: any = { mcpServers: {} };
        try {
          const content = await fs.readFile(targetFile, 'utf8');
          mcpConfig = JSON.parse(content);
          if (!mcpConfig.mcpServers) mcpConfig.mcpServers = {};
        } catch {
          // File doesn't exist or is invalid JSON
        }
        
        mcpConfig.mcpServers.intentguard = {
          command: 'npx',
          args: ['@intentguard/mcp-server']
        };
        
        await fs.writeFile(targetFile, JSON.stringify(mcpConfig, null, 2));
        console.log(success(`Configured Cursor MCP (.cursor/mcp.json).`));
        configured++;
      } catch (err: any) {
        if (options.agent === 'cursor') {
          console.log(warning(`Cursor setup failed: ${err.message}`));
        }
      }
    }

    // 3. IBM Bob 2.0
    if (options.all || options.agent === 'bob') {
      const bobDirLocal = path.join(repoRoot, '.bob');
      const bobMcpPath = path.join(bobDirLocal, 'mcp.json');
      
      try {
        await fs.mkdir(bobDirLocal, { recursive: true });
        let mcpConfig: any = { mcpServers: {} };
        try {
          const content = await fs.readFile(bobMcpPath, 'utf8');
          mcpConfig = JSON.parse(content);
          if (!mcpConfig.mcpServers) mcpConfig.mcpServers = {};
        } catch {
          // File doesn't exist
        }

        mcpConfig.mcpServers.intentguard = {
          command: 'npx',
          args: ['@intentguard/mcp-server']
        };

        await fs.writeFile(bobMcpPath, JSON.stringify(mcpConfig, null, 2));
        console.log(success('Configured IBM Bob 2.0 MCP (.bob/mcp.json).'));
        configured++;
      } catch (err: any) {
        if (options.agent === 'bob') {
          console.log(warning(`Bob setup failed: ${err.message}`));
        }
      }
    }

    // 4. Codex
    if (options.all || options.agent === 'codex') {
      const codexDirLocal = path.join(repoRoot, '.codex');
      const codexMcpPath = path.join(codexDirLocal, 'mcp.json');
      
      try {
        await fs.mkdir(codexDirLocal, { recursive: true });
        let mcpConfig: any = { mcpServers: {} };
        try {
          const content = await fs.readFile(codexMcpPath, 'utf8');
          mcpConfig = JSON.parse(content);
          if (!mcpConfig.mcpServers) mcpConfig.mcpServers = {};
        } catch {
          // File doesn't exist
        }

        mcpConfig.mcpServers.intentguard = {
          command: 'npx',
          args: ['@intentguard/mcp-server']
        };

        await fs.writeFile(codexMcpPath, JSON.stringify(mcpConfig, null, 2));
        console.log(success('Configured Codex MCP (.codex/mcp.json).'));
        configured++;
      } catch (err: any) {
        if (options.agent === 'codex') {
          console.log(warning(`Codex setup failed: ${err.message}`));
        }
      }
    }
    
    if (configured === 0) {
      console.log(warning('No supported agents configured. Try: intent mcp setup --all'));
    } else {
      console.log(success(`Successfully configured MCP for ${configured} agent(s).`));
    }
  } catch (err: any) {
    console.error(error(`MCP setup failed: ${err.message}`));
    process.exit(1);
  }
}
