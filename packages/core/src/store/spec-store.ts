import fs from 'node:fs/promises';
import path from 'node:path';
import type { IntentSpec, ProofReport, IntentConfig } from '../schema/intentspec.js';
import { specToMarkdown } from '../utils/markdown.js';
import { loadConfig } from './config.js';

export class SpecStore {
  private config: IntentConfig;
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.config = {
      projectName: undefined,
      llmProvider: 'auto',
      readinessThreshold: 70,
      specDir: '.intent/specs',
      reportDir: '.intent/reports',
    };
  }

  private async ensureConfig(): Promise<IntentConfig> {
    try {
      this.config = await loadConfig(this.rootDir);
    } catch {
      // Keep default config
    }
    return this.config;
  }

  async init(): Promise<void> {
    await this.ensureConfig();
    await fs.mkdir(path.join(this.rootDir, this.config.specDir), { recursive: true });
    await fs.mkdir(path.join(this.rootDir, this.config.reportDir), { recursive: true });
  }

  async save(spec: IntentSpec): Promise<void> {
    await this.ensureConfig();
    const specsDir = path.join(this.rootDir, this.config.specDir);
    await fs.mkdir(specsDir, { recursive: true });
    const jsonPath = path.join(specsDir, `${spec.id}.json`);
    const mdPath = path.join(specsDir, `${spec.id}.md`);

    await fs.writeFile(jsonPath, JSON.stringify(spec, null, 2), 'utf8');
    const mdContent = specToMarkdown(spec);
    await fs.writeFile(mdPath, mdContent, 'utf8');
  }

  async load(id: string): Promise<IntentSpec> {
    await this.ensureConfig();
    const jsonPath = path.join(this.rootDir, this.config.specDir, `${id}.json`);
    const content = await fs.readFile(jsonPath, 'utf8');
    return JSON.parse(content) as IntentSpec;
  }

  async loadActive(): Promise<IntentSpec | null> {
    try {
      await this.ensureConfig();
      const activePath = path.join(this.rootDir, '.intent', 'active.json');
      const content = await fs.readFile(activePath, 'utf8');
      const data = JSON.parse(content);
      if (data.activeSpecId) {
        return await this.load(data.activeSpecId);
      }
      return null;
    } catch {
      return null;
    }
  }

  async setActive(id: string | null): Promise<void> {
    const intentDir = path.join(this.rootDir, '.intent');
    await fs.mkdir(intentDir, { recursive: true });
    const activePath = path.join(intentDir, 'active.json');
    if (id) {
      await fs.writeFile(activePath, JSON.stringify({ activeSpecId: id }, null, 2), 'utf8');
    } else {
      try {
        await fs.unlink(activePath);
      } catch {
        // Ignore if file doesn't exist
      }
    }
  }

  async list(): Promise<string[]> {
    try {
      await this.ensureConfig();
      const specsDir = path.join(this.rootDir, this.config.specDir);
      const files = await fs.readdir(specsDir);
      return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    } catch {
      return [];
    }
  }

  async saveReport(report: ProofReport): Promise<void> {
    await this.ensureConfig();
    const reportsDir = path.join(this.rootDir, this.config.reportDir);
    await fs.mkdir(reportsDir, { recursive: true });
    const reportPath = path.join(reportsDir, `${report.specId}-report.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
  }

  async loadReport(specId: string): Promise<ProofReport | null> {
    try {
      await this.ensureConfig();
      const reportPath = path.join(this.rootDir, this.config.reportDir, `${specId}-report.json`);
      const content = await fs.readFile(reportPath, 'utf8');
      return JSON.parse(content) as ProofReport;
    } catch {
      return null;
    }
  }
}
