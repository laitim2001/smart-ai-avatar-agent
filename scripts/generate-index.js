#!/usr/bin/env node

/**
 * 自動生成專案索引工具
 *
 * 功能：
 * 1. 掃描專案檔案結構
 * 2. 識別檔案狀態（✅ 已完成 / ⏳ 待建立）
 * 3. 更新 PROJECT_INDEX.md
 * 4. 生成統計報告
 *
 * 使用方式：
 * node scripts/generate-index.js
 *
 * 或透過 npm script:
 * npm run generate-index
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════
// 配置區
// ═══════════════════════════════════════════════════

const CONFIG = {
  // 需要掃描的目錄
  scanDirs: [
    'app',
    'components',
    'lib',
    'store',
    'types',
    'agent-brain',
    'docs',
    'tests',
    'scripts',
  ],

  // 需要忽略的目錄和檔案
  ignorePaths: [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    '.env.local',
  ],

  // 檔案狀態規則
  statusRules: {
    // 如果檔案存在且大小 > 100 bytes，視為已完成
    completedSizeThreshold: 100,
  },

  // 輸出檔案
  outputFile: 'PROJECT_INDEX.md',
};

// ═══════════════════════════════════════════════════
// 檔案掃描器
// ═══════════════════════════════════════════════════

class FileScanner {
  constructor() {
    this.fileTree = {};
    this.stats = {
      total: 0,
      completed: 0,
      pending: 0,
      byType: {},
    };
  }

  /**
   * 掃描專案檔案
   */
  scan() {
    console.log('📂 掃描專案檔案...\n');

    for (const dir of CONFIG.scanDirs) {
      const dirPath = path.join(process.cwd(), dir);

      if (fs.existsSync(dirPath)) {
        this.scanDirectory(dirPath, dir);
      } else {
        console.log(`⚠️  目錄不存在: ${dir}`);
      }
    }

    this.printStats();
    return this.fileTree;
  }

  /**
   * 遞迴掃描目錄
   */
  scanDirectory(dirPath, relativePath) {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name);

        // 檢查是否應該忽略
        if (this.shouldIgnore(relPath)) {
          continue;
        }

        if (entry.isDirectory()) {
          // 遞迴掃描子目錄
          this.scanDirectory(fullPath, relPath);
        } else if (entry.isFile()) {
          // 記錄檔案資訊
          this.recordFile(fullPath, relPath);
        }
      }
    } catch (error) {
      console.error(`❌ 掃描目錄失敗: ${dirPath}`, error.message);
    }
  }

  /**
   * 檢查路徑是否應該被忽略
   */
  shouldIgnore(relativePath) {
    return CONFIG.ignorePaths.some(ignore =>
      relativePath.includes(ignore)
    );
  }

  /**
   * 記錄檔案資訊
   */
  recordFile(fullPath, relativePath) {
    try {
      const stats = fs.statSync(fullPath);
      const ext = path.extname(relativePath);

      // 判斷檔案狀態
      const isCompleted = stats.size > CONFIG.statusRules.completedSizeThreshold;
      const status = isCompleted ? '✅' : '⏳';

      // 記錄到樹狀結構
      this.fileTree[relativePath] = {
        path: relativePath,
        size: stats.size,
        status,
        modified: stats.mtime,
        type: ext,
      };

      // 更新統計
      this.stats.total++;
      if (isCompleted) {
        this.stats.completed++;
      } else {
        this.stats.pending++;
      }

      // 按類型統計
      if (!this.stats.byType[ext]) {
        this.stats.byType[ext] = { completed: 0, pending: 0 };
      }
      if (isCompleted) {
        this.stats.byType[ext].completed++;
      } else {
        this.stats.byType[ext].pending++;
      }

    } catch (error) {
      console.error(`❌ 讀取檔案失敗: ${relativePath}`, error.message);
    }
  }

  /**
   * 印出統計資訊
   */
  printStats() {
    console.log('\n📊 掃描結果統計:\n');
    console.log(`總檔案數: ${this.stats.total}`);
    console.log(`✅ 已完成: ${this.stats.completed} (${this.getPercentage(this.stats.completed)}%)`);
    console.log(`⏳ 待建立: ${this.stats.pending} (${this.getPercentage(this.stats.pending)}%)`);

    console.log('\n按檔案類型統計:');
    for (const [ext, counts] of Object.entries(this.stats.byType)) {
      const typeName = ext || '無副檔名';
      console.log(`  ${typeName}: ✅ ${counts.completed} | ⏳ ${counts.pending}`);
    }
  }

  /**
   * 計算百分比
   */
  getPercentage(count) {
    if (this.stats.total === 0) return 0;
    return ((count / this.stats.total) * 100).toFixed(1);
  }
}

// ═══════════════════════════════════════════════════
// Markdown 生成器
// ═══════════════════════════════════════════════════

class MarkdownGenerator {
  constructor(fileTree, stats) {
    this.fileTree = fileTree;
    this.stats = stats;
    this.content = [];
  }

  /**
   * 生成 Markdown 內容
   */
  generate() {
    console.log('\n📝 生成 Markdown 內容...\n');

    this.addHeader();
    this.addStats();
    this.addFileTree();
    this.addFooter();

    return this.content.join('\n');
  }

  /**
   * 添加標題區塊
   */
  addHeader() {
    const now = new Date().toISOString().split('T')[0];

    this.content.push('# Project Index - 專案完整索引');
    this.content.push('');
    this.content.push('> **自動生成** - 由 `scripts/generate-index.js` 生成');
    this.content.push(`> **最後更新**: ${now}`);
    this.content.push('');
    this.content.push('---');
    this.content.push('');
  }

  /**
   * 添加統計資訊
   */
  addStats() {
    this.content.push('## 📊 專案統計');
    this.content.push('');
    this.content.push('```yaml');
    this.content.push(`總檔案數: ${this.stats.total}`);
    this.content.push(`已完成: ${this.stats.completed} (${this.getPercentage(this.stats.completed)}%)`);
    this.content.push(`待建立: ${this.stats.pending} (${this.getPercentage(this.stats.pending)}%)`);
    this.content.push('');
    this.content.push('按類型統計:');
    for (const [ext, counts] of Object.entries(this.stats.byType)) {
      const typeName = ext || '無副檔名';
      this.content.push(`  ${typeName}: ✅ ${counts.completed} | ⏳ ${counts.pending}`);
    }
    this.content.push('```');
    this.content.push('');
    this.content.push('---');
    this.content.push('');
  }

  /**
   * 添加檔案樹
   */
  addFileTree() {
    this.content.push('## 📁 檔案結構');
    this.content.push('');

    // 按目錄分組
    const grouped = this.groupByDirectory();

    for (const [dir, files] of Object.entries(grouped)) {
      this.content.push(`### ${dir}/`);
      this.content.push('');
      this.content.push('| 檔案 | 狀態 | 大小 | 最後修改 |');
      this.content.push('|------|------|------|---------|');

      files.forEach(file => {
        const sizeStr = this.formatSize(file.size);
        const dateStr = new Date(file.modified).toLocaleDateString('zh-TW');
        const fileName = path.basename(file.path);

        this.content.push(`| ${fileName} | ${file.status} | ${sizeStr} | ${dateStr} |`);
      });

      this.content.push('');
    }
  }

  /**
   * 添加頁尾
   */
  addFooter() {
    const now = new Date().toISOString();

    this.content.push('---');
    this.content.push('');
    this.content.push('**生成時間**: ' + now);
    this.content.push('**生成工具**: `scripts/generate-index.js`');
    this.content.push('');
    this.content.push('**維護說明**: 執行 `npm run generate-index` 自動更新此檔案');
  }

  /**
   * 按目錄分組檔案
   */
  groupByDirectory() {
    const grouped = {};

    for (const file of Object.values(this.fileTree)) {
      const dir = path.dirname(file.path);

      if (!grouped[dir]) {
        grouped[dir] = [];
      }

      grouped[dir].push(file);
    }

    // 排序
    for (const files of Object.values(grouped)) {
      files.sort((a, b) => a.path.localeCompare(b.path));
    }

    return grouped;
  }

  /**
   * 格式化檔案大小
   */
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * 計算百分比
   */
  getPercentage(count) {
    if (this.stats.total === 0) return 0;
    return ((count / this.stats.total) * 100).toFixed(1);
  }
}

// ═══════════════════════════════════════════════════
// 主程式
// ═══════════════════════════════════════════════════

function main() {
  console.log('🚀 專案索引生成工具\n');
  console.log('═'.repeat(50));

  try {
    // 1. 掃描檔案
    const scanner = new FileScanner();
    const fileTree = scanner.scan();

    console.log('\n' + '═'.repeat(50));

    // 2. 生成 Markdown
    const generator = new MarkdownGenerator(fileTree, scanner.stats);
    const markdown = generator.generate();

    // 3. 寫入檔案
    const outputPath = path.join(process.cwd(), CONFIG.outputFile);
    fs.writeFileSync(outputPath, markdown, 'utf-8');

    console.log(`✅ 索引已生成: ${CONFIG.outputFile}`);
    console.log('\n建議下一步:');
    console.log('  1. 檢視生成的索引檔案');
    console.log('  2. 手動補充詳細說明');
    console.log('  3. 提交到 Git');
    console.log('\n' + '═'.repeat(50));

  } catch (error) {
    console.error('\n❌ 生成失敗:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 執行主程式
if (require.main === module) {
  main();
}

module.exports = { FileScanner, MarkdownGenerator };
