#!/usr/bin/env node

/**
 * 專案索引同步工具
 *
 * 功能：
 * 1. 掃描實際檔案系統
 * 2. 比對 PROJECT_INDEX.md 的內容
 * 3. 自動更新檔案狀態（⏳ → ✅）
 * 4. 識別新增/刪除的檔案
 * 5. 更新統計數據
 * 6. 生成變更報告
 *
 * 使用方式：
 * node scripts/sync-index.js [options]
 *
 * Options:
 * --dry-run   預覽變更但不實際修改檔案
 * --verbose   顯示詳細資訊
 *
 * 或透過 npm script:
 * npm run sync-index
 * npm run sync-index -- --dry-run
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════
// 配置區
// ═══════════════════════════════════════════════════

const CONFIG = {
  indexFile: 'PROJECT_INDEX.md',
  completedSizeThreshold: 100,

  // 需要掃描的目錄
  scanDirs: [
    '.', // 掃描根目錄檔案（不遞迴）
    'app',
    'components',
    'lib',
    'store',
    'types',
    'agent-brain',
    'docs',
    'scripts',
  ],

  // 忽略的路徑
  ignorePaths: [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    '.env.local',
  ],
};

// 解析命令列參數
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

// ═══════════════════════════════════════════════════
// 索引同步器類別
// ═══════════════════════════════════════════════════

class IndexSynchronizer {
  constructor() {
    this.changes = {
      statusUpdated: [],
      filesAdded: [],
      filesRemoved: [],
      statsUpdated: false,
    };

    this.currentIndex = null;
    this.actualFiles = new Map();
  }

  /**
   * 執行同步
   */
  async sync() {
    console.log('🔄 開始同步專案索引...\n');

    if (isDryRun) {
      console.log('⚠️  DRY RUN 模式：不會實際修改檔案\n');
    }

    console.log('═'.repeat(50));

    try {
      // 1. 讀取當前索引
      await this.loadCurrentIndex();

      // 2. 掃描實際檔案
      await this.scanActualFiles();

      // 3. 比對差異
      await this.compareAndSync();

      // 4. 生成報告
      this.generateReport();

      // 5. 寫入更新（如果不是 dry-run）
      if (!isDryRun && this.hasChanges()) {
        await this.writeUpdatedIndex();
        console.log('\n✅ 索引已更新！');
      } else if (!this.hasChanges()) {
        console.log('\n✅ 索引已是最新狀態，無需更新');
      }

      console.log('\n' + '═'.repeat(50));

      return true;

    } catch (error) {
      console.error('\n❌ 同步失敗:', error.message);
      if (isVerbose) {
        console.error(error.stack);
      }
      return false;
    }
  }

  /**
   * 載入當前索引
   */
  async loadCurrentIndex() {
    console.log('📖 讀取當前索引...\n');

    const indexPath = path.join(process.cwd(), CONFIG.indexFile);

    if (!fs.existsSync(indexPath)) {
      throw new Error(`索引檔案不存在: ${CONFIG.indexFile}`);
    }

    this.currentIndex = fs.readFileSync(indexPath, 'utf-8');
    console.log(`  ✅ 已讀取 ${CONFIG.indexFile}`);
  }

  /**
   * 掃描實際檔案
   */
  async scanActualFiles() {
    console.log('\n📂 掃描實際檔案系統...\n');

    for (const dir of CONFIG.scanDirs) {
      const dirPath = path.join(process.cwd(), dir);

      if (fs.existsSync(dirPath)) {
        // 根目錄只掃描檔案，不遞迴
        if (dir === '.') {
          this.scanRootDirectory(dirPath);
        } else {
          this.scanDirectory(dirPath, dir);
        }
      }
    }

    console.log(`  ✅ 掃描完成：發現 ${this.actualFiles.size} 個檔案`);
  }

  /**
   * 掃描根目錄（不遞迴）
   */
  scanRootDirectory(dirPath) {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile()) {
          const fullPath = path.join(dirPath, entry.name);
          const relPath = entry.name;

          if (this.shouldIgnore(relPath)) {
            continue;
          }

          const stats = fs.statSync(fullPath);
          const isCompleted = stats.size > CONFIG.completedSizeThreshold;

          this.actualFiles.set(relPath, {
            path: relPath,
            size: stats.size,
            status: isCompleted ? '✅' : '⏳',
            exists: true,
          });
        }
      }
    } catch (error) {
      console.error(`  ⚠️  掃描根目錄失敗: ${dirPath}`, error.message);
    }
  }

  /**
   * 遞迴掃描目錄
   */
  scanDirectory(dirPath, relativePath) {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name).replace(/\\/g, '/');

        if (this.shouldIgnore(relPath)) {
          continue;
        }

        if (entry.isDirectory()) {
          this.scanDirectory(fullPath, relPath);
        } else if (entry.isFile()) {
          const stats = fs.statSync(fullPath);
          const isCompleted = stats.size > CONFIG.completedSizeThreshold;

          this.actualFiles.set(relPath, {
            path: relPath,
            size: stats.size,
            status: isCompleted ? '✅' : '⏳',
            exists: true,
          });
        }
      }
    } catch (error) {
      console.error(`  ⚠️  掃描目錄失敗: ${dirPath}`, error.message);
    }
  }

  /**
   * 檢查是否應忽略
   */
  shouldIgnore(relativePath) {
    return CONFIG.ignorePaths.some(ignore =>
      relativePath.includes(ignore)
    );
  }

  /**
   * 比對差異並同步
   */
  async compareAndSync() {
    console.log('\n🔍 比對差異...\n');

    // 提取索引中的檔案
    const indexedFiles = this.extractFilesFromIndex();

    // 比對每個索引中的檔案
    for (const indexFile of indexedFiles) {
      const actualFile = this.actualFiles.get(indexFile.path);

      if (!actualFile) {
        // 檔案在索引中但實際不存在
        if (indexFile.status === '✅') {
          this.changes.filesRemoved.push(indexFile);
          if (isVerbose) {
            console.log(`  ⚠️  檔案已刪除: ${indexFile.path}`);
          }
        }
      } else if (indexFile.status !== actualFile.status) {
        // 檔案狀態不同，需要更新
        this.changes.statusUpdated.push({
          path: indexFile.path,
          oldStatus: indexFile.status,
          newStatus: actualFile.status,
        });

        if (isVerbose) {
          console.log(`  🔄 狀態變更: ${indexFile.path} (${indexFile.status} → ${actualFile.status})`);
        }
      }
    }

    // 檢查實際存在但未索引的檔案
    const indexedPaths = new Set(indexedFiles.map(f => f.path));

    for (const [filePath, fileInfo] of this.actualFiles.entries()) {
      if (!indexedPaths.has(filePath)) {
        this.changes.filesAdded.push(fileInfo);

        if (isVerbose) {
          console.log(`  ➕ 新增檔案: ${filePath}`);
        }
      }
    }

    // 顯示摘要
    console.log(`\n  變更摘要:`);
    console.log(`    狀態更新: ${this.changes.statusUpdated.length} 個`);
    console.log(`    新增檔案: ${this.changes.filesAdded.length} 個`);
    console.log(`    刪除檔案: ${this.changes.filesRemoved.length} 個`);
  }

  /**
   * 從索引中提取檔案清單
   */
  extractFilesFromIndex() {
    const files = [];
    const fileRegex = /\|\s*`([^`]+)`\s*\|\s*([✅⏳🔄])/g;

    let match;
    while ((match = fileRegex.exec(this.currentIndex)) !== null) {
      files.push({
        path: match[1],
        status: match[2],
        fullMatch: match[0],
      });
    }

    return files;
  }

  /**
   * 檢查是否有變更
   */
  hasChanges() {
    return (
      this.changes.statusUpdated.length > 0 ||
      this.changes.filesAdded.length > 0 ||
      this.changes.filesRemoved.length > 0
    );
  }

  /**
   * 寫入更新後的索引
   */
  async writeUpdatedIndex() {
    console.log('\n💾 更新索引檔案...');

    let updatedIndex = this.currentIndex;

    // 1. 更新檔案狀態
    for (const change of this.changes.statusUpdated) {
      // 替換狀態標記
      const oldPattern = new RegExp(
        `(\\|\\s*\`${this.escapeRegex(change.path)}\`\\s*\\|\\s*)${change.oldStatus}`,
        'g'
      );
      updatedIndex = updatedIndex.replace(oldPattern, `$1${change.newStatus}`);
    }

    // 2. 更新最後更新日期
    const today = new Date().toISOString().split('T')[0];
    updatedIndex = updatedIndex.replace(
      /(\*\*最後更新\*\*:\s*)\d{4}-\d{2}-\d{2}/,
      `$1${today}`
    );

    // 3. 更新版本號（可選）
    updatedIndex = updatedIndex.replace(
      /(\*\*版本\*\*:\s*v)(\d+)\.(\d+)\.(\d+)/,
      (match, prefix, major, minor, patch) => {
        const newPatch = parseInt(patch) + 1;
        return `${prefix}${major}.${minor}.${newPatch}`;
      }
    );

    // 4. 寫入檔案
    const indexPath = path.join(process.cwd(), CONFIG.indexFile);
    fs.writeFileSync(indexPath, updatedIndex, 'utf-8');

    console.log(`  ✅ 已更新 ${CONFIG.indexFile}`);

    // 5. 如果有新增檔案，提示手動處理
    if (this.changes.filesAdded.length > 0) {
      console.log('\n  ⚠️  注意：發現 ' + this.changes.filesAdded.length + ' 個新檔案');
      console.log('     請手動將它們添加到索引中並補充說明');
      console.log('     新檔案清單：');
      this.changes.filesAdded.slice(0, 5).forEach(file => {
        console.log(`       - ${file.path}`);
      });
      if (this.changes.filesAdded.length > 5) {
        console.log(`       ... 還有 ${this.changes.filesAdded.length - 5} 個檔案`);
      }
    }
  }

  /**
   * 轉義正則表達式特殊字符
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 生成報告
   */
  generateReport() {
    console.log('\n📊 同步報告');
    console.log('═'.repeat(50));

    if (!this.hasChanges()) {
      console.log('\n✅ 索引已是最新狀態');
      return;
    }

    // 狀態更新
    if (this.changes.statusUpdated.length > 0) {
      console.log(`\n🔄 狀態更新 (${this.changes.statusUpdated.length})`);
      console.log('─'.repeat(50));

      this.changes.statusUpdated.slice(0, 10).forEach((change, index) => {
        console.log(`  ${index + 1}. ${change.path}`);
        console.log(`     ${change.oldStatus} → ${change.newStatus}`);
      });

      if (this.changes.statusUpdated.length > 10) {
        console.log(`  ... 還有 ${this.changes.statusUpdated.length - 10} 個變更`);
      }
    }

    // 新增檔案
    if (this.changes.filesAdded.length > 0) {
      console.log(`\n➕ 新增檔案 (${this.changes.filesAdded.length})`);
      console.log('─'.repeat(50));

      this.changes.filesAdded.slice(0, 10).forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.path} (${file.status})`);
      });

      if (this.changes.filesAdded.length > 10) {
        console.log(`  ... 還有 ${this.changes.filesAdded.length - 10} 個檔案`);
      }
    }

    // 刪除檔案
    if (this.changes.filesRemoved.length > 0) {
      console.log(`\n➖ 刪除檔案 (${this.changes.filesRemoved.length})`);
      console.log('─'.repeat(50));

      this.changes.filesRemoved.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.path}`);
      });
    }

    // 建議
    console.log('\n💡 建議操作:');
    if (isDryRun) {
      console.log('  1. 檢視上述變更是否合理');
      console.log('  2. 執行 npm run sync-index（不加 --dry-run）應用變更');
    } else {
      console.log('  1. 檢查更新後的索引檔案');
      console.log('  2. 手動添加新檔案的詳細說明');
      console.log('  3. 提交變更: git add PROJECT_INDEX.md && git commit');
    }
  }
}

// ═══════════════════════════════════════════════════
// 主程式
// ═══════════════════════════════════════════════════

async function main() {
  console.log('🔄 專案索引同步工具\n');

  const synchronizer = new IndexSynchronizer();
  const success = await synchronizer.sync();

  process.exit(success ? 0 : 1);
}

// 執行主程式
if (require.main === module) {
  main();
}

module.exports = { IndexSynchronizer };
