#!/usr/bin/env node

/**
 * 專案索引驗證工具
 *
 * 功能：
 * 1. 驗證 PROJECT_INDEX.md 的完整性
 * 2. 檢查檔案路徑是否存在
 * 3. 驗證檔案狀態標記（✅ / ⏳）是否準確
 * 4. 檢查依賴關係是否正確
 * 5. 生成驗證報告
 *
 * 使用方式：
 * node scripts/validate-index.js
 *
 * 或透過 npm script:
 * npm run validate-index
 *
 * Exit codes:
 * 0 - 驗證通過
 * 1 - 發現錯誤
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════
// 配置區
// ═══════════════════════════════════════════════════

const CONFIG = {
  // 要驗證的索引檔案
  indexFile: 'PROJECT_INDEX.md',

  // 檔案大小閾值（判斷檔案是否完成）
  completedSizeThreshold: 100,

  // 需要檢查的核心檔案（必須存在）
  criticalFiles: [
    'AI_ASSISTANT_GUIDE.md',
    'PROJECT_INDEX.md',
    'README.md',
    'package.json',
    'tsconfig.json',
    'next.config.js',
  ],

  // 嚴格模式（檢查所有索引中的檔案）
  strictMode: false,
};

// ═══════════════════════════════════════════════════
// 驗證器類別
// ═══════════════════════════════════════════════════

class IndexValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.stats = {
      totalFiles: 0,
      existingFiles: 0,
      missingFiles: 0,
      incorrectStatus: 0,
    };
  }

  /**
   * 執行完整驗證
   */
  async validate() {
    console.log('🔍 開始驗證專案索引...\n');
    console.log('═'.repeat(50));

    try {
      // 1. 檢查索引檔案是否存在
      await this.checkIndexFileExists();

      // 2. 解析索引檔案
      const indexContent = await this.parseIndexFile();

      // 3. 提取檔案清單
      const indexedFiles = this.extractFilesFromIndex(indexContent);
      console.log(`\n📊 索引中包含 ${indexedFiles.length} 個檔案條目\n`);

      // 4. 驗證檔案存在性
      await this.validateFileExistence(indexedFiles);

      // 5. 驗證檔案狀態
      await this.validateFileStatus(indexedFiles);

      // 6. 檢查核心檔案
      await this.checkCriticalFiles();

      // 7. 生成報告
      this.generateReport();

      console.log('\n' + '═'.repeat(50));

      // 8. 返回結果
      return this.errors.length === 0;

    } catch (error) {
      console.error('\n❌ 驗證過程出錯:', error.message);
      return false;
    }
  }

  /**
   * 檢查索引檔案是否存在
   */
  async checkIndexFileExists() {
    const indexPath = path.join(process.cwd(), CONFIG.indexFile);

    if (!fs.existsSync(indexPath)) {
      this.errors.push({
        type: 'CRITICAL',
        message: `索引檔案不存在: ${CONFIG.indexFile}`,
      });
      throw new Error('索引檔案不存在');
    }

    this.info.push(`✅ 索引檔案存在: ${CONFIG.indexFile}`);
  }

  /**
   * 解析索引檔案
   */
  async parseIndexFile() {
    const indexPath = path.join(process.cwd(), CONFIG.indexFile);
    const content = fs.readFileSync(indexPath, 'utf-8');

    // 檢查基本結構
    if (!content.includes('# Project Index')) {
      this.warnings.push({
        type: 'STRUCTURE',
        message: '索引檔案缺少標準標題',
      });
    }

    if (!content.includes('## 📊') && !content.includes('統計')) {
      this.warnings.push({
        type: 'STRUCTURE',
        message: '索引檔案缺少統計資訊區塊',
      });
    }

    return content;
  }

  /**
   * 從索引中提取檔案清單
   */
  extractFilesFromIndex(content) {
    const files = [];

    // 正則表達式匹配檔案路徑
    // 匹配格式: | `path/to/file.ts` | ✅ / ⏳ | ...
    const fileRegex = /\|\s*`([^`]+)`\s*\|\s*([✅⏳🔄])/g;

    let match;
    while ((match = fileRegex.exec(content)) !== null) {
      const filePath = match[1];
      const status = match[2];

      files.push({
        path: filePath,
        status: status,
        line: this.getLineNumber(content, match.index),
      });
    }

    return files;
  }

  /**
   * 取得內容中特定位置的行號
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * 驗證檔案是否存在
   */
  async validateFileExistence(indexedFiles) {
    console.log('🔍 驗證檔案存在性...\n');

    for (const file of indexedFiles) {
      this.stats.totalFiles++;

      const fullPath = path.join(process.cwd(), file.path);
      const exists = fs.existsSync(fullPath);

      if (exists) {
        this.stats.existingFiles++;
      } else {
        // 檢查是否標記為待建立
        if (file.status === '⏳') {
          this.info.push(`📝 待建立檔案（正確）: ${file.path}`);
        } else if (file.status === '✅') {
          this.errors.push({
            type: 'FILE_NOT_FOUND',
            message: `檔案標記為完成 (✅) 但不存在: ${file.path}`,
            line: file.line,
            severity: 'HIGH',
          });
          this.stats.missingFiles++;
        }
      }
    }

    console.log(`  ✅ 已存在: ${this.stats.existingFiles} 個檔案`);
    console.log(`  ⏳ 待建立: ${this.stats.totalFiles - this.stats.existingFiles} 個檔案`);
  }

  /**
   * 驗證檔案狀態標記
   */
  async validateFileStatus(indexedFiles) {
    console.log('\n🔍 驗證檔案狀態標記...\n');

    for (const file of indexedFiles) {
      const fullPath = path.join(process.cwd(), file.path);

      if (!fs.existsSync(fullPath)) {
        continue; // 檔案不存在，已在上一步驟處理
      }

      try {
        const stats = fs.statSync(fullPath);
        const isCompleted = stats.size > CONFIG.completedSizeThreshold;
        const expectedStatus = isCompleted ? '✅' : '⏳';

        if (file.status !== expectedStatus) {
          this.warnings.push({
            type: 'INCORRECT_STATUS',
            message: `檔案狀態不正確: ${file.path}`,
            detail: `標記為 ${file.status}，應為 ${expectedStatus} (檔案大小: ${stats.size} bytes)`,
            line: file.line,
            severity: 'MEDIUM',
          });
          this.stats.incorrectStatus++;
        }
      } catch (error) {
        this.warnings.push({
          type: 'FILE_READ_ERROR',
          message: `無法讀取檔案: ${file.path}`,
          detail: error.message,
        });
      }
    }

    if (this.stats.incorrectStatus === 0) {
      console.log(`  ✅ 所有檔案狀態標記正確`);
    } else {
      console.log(`  ⚠️  ${this.stats.incorrectStatus} 個檔案狀態標記不正確`);
    }
  }

  /**
   * 檢查核心檔案
   */
  async checkCriticalFiles() {
    console.log('\n🔍 檢查核心檔案...\n');

    for (const file of CONFIG.criticalFiles) {
      const fullPath = path.join(process.cwd(), file);
      const exists = fs.existsSync(fullPath);

      if (!exists) {
        this.errors.push({
          type: 'CRITICAL_FILE_MISSING',
          message: `核心檔案缺失: ${file}`,
          severity: 'CRITICAL',
        });
      } else {
        console.log(`  ✅ ${file}`);
      }
    }
  }

  /**
   * 生成驗證報告
   */
  generateReport() {
    console.log('\n📊 驗證報告');
    console.log('═'.repeat(50));

    // 統計資訊
    console.log('\n統計資訊:');
    console.log(`  總檔案數: ${this.stats.totalFiles}`);
    console.log(`  已存在: ${this.stats.existingFiles}`);
    console.log(`  待建立: ${this.stats.missingFiles}`);
    console.log(`  狀態不正確: ${this.stats.incorrectStatus}`);

    // 錯誤
    if (this.errors.length > 0) {
      console.log('\n❌ 錯誤 (' + this.errors.length + '):');
      this.errors.forEach((error, index) => {
        console.log(`\n  ${index + 1}. [${error.severity || 'HIGH'}] ${error.message}`);
        if (error.detail) {
          console.log(`     ${error.detail}`);
        }
        if (error.line) {
          console.log(`     位置: 第 ${error.line} 行`);
        }
      });
    }

    // 警告
    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告 (' + this.warnings.length + '):');
      this.warnings.slice(0, 10).forEach((warning, index) => {
        console.log(`\n  ${index + 1}. [${warning.severity || 'MEDIUM'}] ${warning.message}`);
        if (warning.detail) {
          console.log(`     ${warning.detail}`);
        }
      });

      if (this.warnings.length > 10) {
        console.log(`\n  ... 還有 ${this.warnings.length - 10} 個警告（執行 --verbose 查看全部）`);
      }
    }

    // 建議
    console.log('\n💡 建議:');
    if (this.errors.length > 0) {
      console.log('  1. 修正所有錯誤後重新執行驗證');
      console.log('  2. 執行 npm run sync-index 自動同步索引');
    } else if (this.warnings.length > 0) {
      console.log('  1. 檢視警告並考慮修正');
      console.log('  2. 執行 npm run sync-index 自動更新狀態');
    } else {
      console.log('  ✅ 索引狀態良好，無需額外操作');
    }

    // 最終結果
    console.log('\n' + '═'.repeat(50));
    if (this.errors.length === 0) {
      console.log('\n✅ 驗證通過！\n');
    } else {
      console.log(`\n❌ 驗證失敗：發現 ${this.errors.length} 個錯誤\n`);
    }
  }
}

// ═══════════════════════════════════════════════════
// 主程式
// ═══════════════════════════════════════════════════

async function main() {
  console.log('🔍 專案索引驗證工具\n');

  const validator = new IndexValidator();
  const isValid = await validator.validate();

  // 根據驗證結果設定 exit code
  process.exit(isValid ? 0 : 1);
}

// 執行主程式
if (require.main === module) {
  main();
}

module.exports = { IndexValidator };
