# 項目文件索引

本目錄包含項目的所有技術文件，按功能和階段組織。

## 項目狀態

- **POC 階段**：✅ 100% 完成（2025-10-15）
- **MVP 開發**：🔄 進行中（95.1%）
- **知識庫系統**：✅ 100% 完成

## 目錄結構

### 📦 核心文件（當前目錄）
- **AI_ASSISTANT_GUIDE.md**：AI 助手使用指南
- **INDEX_MAINTENANCE.md**：文件索引維護指南
- **README.md**（本文件）：文件索引導覽

### 📚 功能實作（implementation/）
按功能模組組織的實作文件：
- **lip-sync/**：唇型同步系統實作
- **i18n/**：國際化實作
- **knowledge-system/**：知識庫管理系統
- **custom-avatar/**：自訂頭像功能
- **multi-agent/**：多代理系統

### 🔧 開發相關
- **api/**：API 設計與參考文件
- **design/**：系統架構與設計文件
- **testing/**：測試指南與測試報告
- **deployment/**：部署指南與檢查清單

### 📋 項目管理
- **mvp/**：MVP 開發計劃與進度追蹤
- **training/**：訓練指南
- **misc/**：其他雜項文件

### 🐛 問題修復
- **fixes/**：修復日誌（按日期命名）
- **troubleshooting/**：故障排除指南

### 🗂️ 歷史歸檔（00-archive/）
不再更新的歷史文件：
- **planning/**：項目初期規劃文件
- **poc/**：POC 開發階段文件
  - stories/：按 Epic 1-5 分類的 User Stories
  - epics/：Epic 驗證報告

## 快速導覽

### 🎯 我想要...

#### 開始開發
- 閱讀：`../README.md`（根目錄）
- 環境設置：`deployment/ENVIRONMENT_VARIABLES.md`
- 本地開發：`misc/LOCAL_DEV_GUIDE.md`

#### 了解系統架構
- 整體架構：`design/architecture.md`
- 設計系統：`design/DESIGN-SYSTEM.md`
- API 設計：`api/`

#### 實作新功能
- 實作指南：`implementation/` 對應功能目錄
- API 文件：`api/`
- 測試指南：`testing/`

#### 解決問題
- 故障排除：`troubleshooting/`
- 修復日誌：`fixes/`（按日期查找）
- AI 助手：`AI_ASSISTANT_GUIDE.md`

#### 部署上線
- 部署指南：`deployment/deployment-guide.md`
- Azure 部署：`deployment/AZURE_DEPLOYMENT.md`
- 上線檢查：`deployment/PRE_LAUNCH_CHECKLIST.md`

#### 維護文件
- 維護指南：`INDEX_MAINTENANCE.md`
- 項目索引：`../PROJECT_INDEX.md`（根目錄）

## 文件命名規範

### 修復日誌
- 格式：`YYYY-MM-DD-description.md`
- 範例：`2025-10-20-lipsync-fixes.md`

### 功能文件
- 描述性命名：`FEATURE_NAME_TYPE.md`
- 範例：`LIP_SYNC_IMPLEMENTATION_GUIDE.md`

### 一般文件
- 大寫蛇形命名：`DOCUMENT_NAME.md`
- 範例：`API_REFERENCE.md`

## 文件狀態

- **Active**（活躍）：當前正在更新的文件
- **Completed**（完成）：功能已完成，文件僅供參考
- **Archived**（歸檔）：已移至 `00-archive/`，不再更新

## 維護工作流程

### 每日（Story 完成時）
1. 更新相關實作文件
2. 記錄修復日誌（如有問題）
3. 更新 MVP 進度追蹤

### 每週（Tech Lead）
1. 檢視新增文件的元數據
2. 清理過時文件
3. 更新 PROJECT_INDEX.md

### 每 Sprint
1. 歸檔已完成階段的文件
2. 重組文件結構（如需要）
3. 團隊審查文件品質

## 相關資源

- **根目錄文件索引**：`../PROJECT_INDEX.md`
- **MVP 進度追蹤**：`mvp/MVP_PROGRESS.md`（⭐ 最重要的活躍文件）
- **維護指南**：`INDEX_MAINTENANCE.md`

---

**最後更新**: 2025-10-22
**文件版本**: v2.0（重組後）
**項目狀態**: MVP 開發進行中（95.1%）

