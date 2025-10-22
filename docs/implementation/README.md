# 實作指南

本目錄按功能模組組織實作文件。

## 目錄結構

### lip-sync/（唇型同步）
- **LIPSYNC_FIXES_2025-10-20.md**：Lip Sync 系統完整診斷與修復
- **LIP_SYNC_IMPLEMENTATION_GUIDE.md**：Lip Sync 實作指南
- **WAV2LIP_INTEGRATION_TEST_RESULTS.md**：Wav2Lip 整合測試結果

### i18n/（國際化）
- **I18N_IMPLEMENTATION_STATUS.md**：i18n 實作狀態
- **TRANSLATION_GUIDE.md**：翻譯指南

### knowledge-system/（知識庫管理）
- **KNOWLEDGE_MANAGEMENT_SYSTEM_DESIGN.md**：系統設計
- **KNOWLEDGE_SYSTEM_IMPLEMENTATION_STATUS.md**：實作狀態
- **KNOWLEDGE_SYSTEM_ISSUES_AND_FIXES.md**：問題診斷與修復
- **KNOWLEDGE_SYSTEM_USER_GUIDE.md**：用戶使用指南

### custom-avatar/（自訂頭像）
- **CUSTOM_AVATAR_SOLUTION.md**：自訂頭像解決方案
- **READY_PLAYER_ME_PHOTO_UPLOAD_STATUS.md**：照片上傳功能狀態

### multi-agent/（多代理系統）
- **MULTI_AGENT_ARCHITECTURE_DESIGN.md**：架構設計
- **MULTILINGUAL_AND_MULTI_AGENT_IMPLEMENTATION_PLAN.md**：多語言與多代理實作計劃

## 使用指南

### 開發新功能

1. 在對應功能目錄創建實作文件
2. 使用標準模板（見下方）
3. 記錄設計決策、實作步驟、測試結果
4. 完成後移至 `docs/00-archive/`（如果功能已穩定且不再更新）

### 文件模板

```markdown
# [功能名稱] 實作指南

## 概述
簡要描述功能的目的和範圍

## 架構設計
系統架構圖和組件說明

## 實作步驟
1. 步驟 1
2. 步驟 2
...

## 技術細節
關鍵技術點和實作細節

## 測試方法
如何測試此功能

## 已知問題
當前的限制和已知問題

## 後續計劃
未來的改進方向
```

## 相關資源

- 程式碼實作：`lib/`、`components/`、`app/`
- API 文件：`docs/api/`
- 測試文件：`docs/testing/`
