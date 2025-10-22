# Ready Player Me Lip Sync 實作指南

## 概述

本文檔說明如何在項目中實現 Ready Player Me Avatar 的即時 Lip Sync 功能，整合 Azure Speech Service 的 Viseme 資料。

## 技術架構

```
使用者對話輸入
    ↓
Azure OpenAI GPT-4 生成回應
    ↓
Azure Speech TTS 生成音訊 + Viseme 資料
    ↓
Viseme ID 映射到 Ready Player Me Morph Targets
    ↓
即時更新 3D Avatar 嘴型（60 FPS）
    ↓
音訊播放 + Lip Sync 動畫同步
```

## 1. Ready Player Me Avatar 準備

### 1.1 確保 Avatar 包含 Morph Targets

在請求 Avatar 時，確保包含 Oculus Viseme：

```typescript
// 範例：修改 Avatar URL 以包含 Morph Targets
const avatarUrl = 'https://models.readyplayer.me/YOUR_AVATAR_ID.glb?morphTargets=Oculus Visemes';

// 或在 constants.ts 中定義
export const AVATARS_METADATA: AvatarMetadata[] = [
  {
    id: 'avatar-with-lipsync',
    name: '支援 Lip Sync 的 Avatar',
    url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=Oculus Visemes',
    // ...其他屬性
  }
];
```

### 1.2 驗證 Morph Targets

載入 Avatar 後，檢查可用的 Morph Targets：

```typescript
// 在 AvatarModel.tsx 的 onLoad 中添加
console.log('Available Morph Targets:', model.morphTargetDictionary);
console.log('Morph Target Influences:', model.morphTargetInfluences);
```

## 2. Viseme 映射配置

### 2.1 創建映射常數

創建檔案：`lib/avatar/visemeMapping.ts`

```typescript
/**
 * Azure Speech Viseme ID 到 Ready Player Me Oculus Viseme 的映射
 */
export const AZURE_TO_RPM_VISEME_MAP: Record<number, string> = {
  0: 'viseme_sil',   // 靜音
  1: 'viseme_aa',    // ae, ax, ah
  2: 'viseme_aa',    // aa
  3: 'viseme_O',     // ao
  4: 'viseme_E',     // ey
  5: 'viseme_E',     // eh
  6: 'viseme_I',     // uh
  7: 'viseme_I',     // y
  8: 'viseme_I',     // iy
  9: 'viseme_U',     // uw
  10: 'viseme_O',    // ow
  11: 'viseme_aa',   // aw
  12: 'viseme_O',    // oy
  13: 'viseme_aa',   // ay
  14: 'viseme_sil',  // h
  15: 'viseme_RR',   // r
  16: 'viseme_nn',   // l
  17: 'viseme_SS',   // s, z
  18: 'viseme_CH',   // sh, ch, jh, zh
  19: 'viseme_TH',   // th, dh
  20: 'viseme_FF',   // f, v
  21: 'viseme_DD',   // d, t, n
};

/**
 * Viseme 強度配置（0.0 - 1.0）
 */
export const AZURE_VISEME_INTENSITY: Record<number, number> = {
  0: 0.0,    // 靜音
  1: 0.8,    // 大張嘴
  2: 1.0,    // 最大張嘴
  3: 0.9,    // 圓嘴
  4: 0.7,    // 微笑
  5: 0.6,    // 中等
  6: 0.5,    // 輕微
  7: 0.6,    // 緊繃
  8: 0.6,    // 窄嘴
  9: 0.9,    // 圓嘴前伸
  10: 0.8,   // 圓嘴
  11: 0.9,   // 大圓嘴
  12: 0.8,   // 複合
  13: 0.8,   // 複合
  14: 0.3,   // 輕吐氣
  15: 0.6,   // 舌頭後縮
  16: 0.5,   // 舌尖
  17: 0.5,   // 齒縫音
  18: 0.6,   // 唇齒音
  19: 0.5,   // 舌尖齒音
  20: 0.6,   // 咬唇
  21: 0.5,   // 舌尖齒根
};

/**
 * 平滑過渡時間（秒）
 */
export const VISEME_TRANSITION_TIME = 0.05; // 50ms
```

### 2.2 創建 Viseme 類型定義

添加到 `types/viseme.ts`：

```typescript
/**
 * Azure Speech Viseme 事件
 */
export interface VisemeEvent {
  visemeId: number;           // Azure Viseme ID (0-21)
  audioOffsetMs: number;      // 音訊偏移時間（毫秒）
  duration?: number;          // 持續時間（可選）
}

/**
 * Viseme 播放狀態
 */
export interface VisemePlaybackState {
  isPlaying: boolean;
  currentVisemeIndex: number;
  audioStartTime: number;
  visemes: VisemeEvent[];
}
```

## 3. AvatarModel 組件更新

### 3.1 添加 Lip Sync 控制介面

修改 `types/avatar.ts`：

```typescript
export interface AvatarAnimationControls {
  // ... 現有方法

  /**
   * 設定嘴型（Lip Sync）
   * @param visemeId Azure Viseme ID (0-21)
   * @param intensity 強度 (0.0 - 1.0)
   */
  setViseme: (visemeId: number, intensity: number) => void;

  /**
   * 重置所有嘴型到靜音狀態
   */
  resetVisemes: () => void;

  /**
   * 開始 Viseme 播放
   * @param visemes Viseme 事件陣列
   * @param audioStartTime 音訊開始時間
   */
  startVisemePlayback: (visemes: VisemeEvent[], audioStartTime: number) => void;

  /**
   * 停止 Viseme 播放
   */
  stopVisemePlayback: () => void;
}
```

### 3.2 實現 Lip Sync 邏輯

修改 `components/avatar/AvatarModel.tsx`：

```typescript
import { AZURE_TO_RPM_VISEME_MAP, AZURE_VISEME_INTENSITY } from '@/lib/avatar/visemeMapping';
import { VisemeEvent } from '@/types/viseme';

// 在組件內添加狀態
const visemePlaybackRef = useRef<{
  isPlaying: boolean;
  visemes: VisemeEvent[];
  audioStartTime: number;
  currentIndex: number;
} | null>(null);

const previousVisemeRef = useRef<string | null>(null);
const targetVisemeRef = useRef<{ name: string; intensity: number } | null>(null);
const currentIntensityRef = useRef<Record<string, number>>({});

// 平滑更新 Morph Target
const smoothUpdateMorphTarget = (
  mesh: THREE.Mesh,
  visemeName: string,
  targetIntensity: number,
  deltaTime: number
) => {
  if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

  const index = mesh.morphTargetDictionary[visemeName];
  if (index === undefined) return;

  const currentIntensity = currentIntensityRef.current[visemeName] || 0;
  const transitionSpeed = 1 / VISEME_TRANSITION_TIME; // 每秒變化率

  let newIntensity = currentIntensity;
  if (currentIntensity < targetIntensity) {
    newIntensity = Math.min(currentIntensity + transitionSpeed * deltaTime, targetIntensity);
  } else if (currentIntensity > targetIntensity) {
    newIntensity = Math.max(currentIntensity - transitionSpeed * deltaTime, targetIntensity);
  }

  mesh.morphTargetInfluences[index] = newIntensity;
  currentIntensityRef.current[visemeName] = newIntensity;
};

// 設定 Viseme
const setViseme = useCallback((visemeId: number, intensity: number) => {
  const visemeName = AZURE_TO_RPM_VISEME_MAP[visemeId];
  if (!visemeName) return;

  // 重置之前的 Viseme
  if (previousVisemeRef.current && previousVisemeRef.current !== visemeName) {
    targetVisemeRef.current = { name: previousVisemeRef.current, intensity: 0 };
  }

  // 設定新的 Viseme
  const adjustedIntensity = intensity * (AZURE_VISEME_INTENSITY[visemeId] || 1.0);
  targetVisemeRef.current = { name: visemeName, intensity: adjustedIntensity };
  previousVisemeRef.current = visemeName;
}, []);

// 重置所有 Visemes
const resetVisemes = useCallback(() => {
  if (!avatarRef.current) return;

  avatarRef.current.traverse((child) => {
    if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
      // 重置所有 Viseme 到 0
      Object.keys(AZURE_TO_RPM_VISEME_MAP).forEach((key) => {
        const visemeName = AZURE_TO_RPM_VISEME_MAP[parseInt(key)];
        const index = child.morphTargetDictionary?.[visemeName];
        if (index !== undefined) {
          child.morphTargetInfluences[index] = 0;
        }
      });
    }
  });

  previousVisemeRef.current = null;
  targetVisemeRef.current = null;
  currentIntensityRef.current = {};
}, []);

// 開始 Viseme 播放
const startVisemePlayback = useCallback((visemes: VisemeEvent[], audioStartTime: number) => {
  visemePlaybackRef.current = {
    isPlaying: true,
    visemes,
    audioStartTime,
    currentIndex: 0,
  };

  console.log('[Lip Sync] Started playback with', visemes.length, 'visemes');
}, []);

// 停止 Viseme 播放
const stopVisemePlayback = useCallback(() => {
  if (visemePlaybackRef.current) {
    visemePlaybackRef.current.isPlaying = false;
    resetVisemes();
    console.log('[Lip Sync] Stopped playback');
  }
}, [resetVisemes]);

// 在 useFrame 中添加 Viseme 播放邏輯
useFrame((state, delta) => {
  if (!avatarRef.current) return;

  // 更新現有動畫...
  blinkController.current.update(avatarRef.current, delta);
  breathingController.current.update(avatarRef.current, delta);
  // ...

  // Viseme 播放邏輯
  if (visemePlaybackRef.current?.isPlaying) {
    const playback = visemePlaybackRef.current;
    const currentTime = (Date.now() - playback.audioStartTime);

    // 找到當前時間對應的 Viseme
    while (
      playback.currentIndex < playback.visemes.length &&
      playback.visemes[playback.currentIndex].audioOffsetMs <= currentTime
    ) {
      const viseme = playback.visemes[playback.currentIndex];
      setViseme(viseme.visemeId, 1.0);
      playback.currentIndex++;
    }

    // 檢查是否播放完成
    if (playback.currentIndex >= playback.visemes.length) {
      stopVisemePlayback();
    }
  }

  // 平滑更新 Morph Targets
  if (targetVisemeRef.current) {
    avatarRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        smoothUpdateMorphTarget(
          child,
          targetVisemeRef.current!.name,
          targetVisemeRef.current!.intensity,
          delta
        );
      }
    });
  }
});

// 暴露 imperativeHandle
useImperativeHandle(ref, () => ({
  // ... 現有方法
  setViseme,
  resetVisemes,
  startVisemePlayback,
  stopVisemePlayback,
}));
```

## 4. ChatInterface 整合

### 4.1 修改 ChatInterface 組件

修改 `components/chat/ChatInterface.tsx`：

```typescript
import { useRef } from 'react';
import { AvatarAnimationControls } from '@/types/avatar';

// 在組件內獲取 Avatar 控制 ref
const avatarControlsRef = useRef<AvatarAnimationControls | null>(null);

// 從父組件接收 Avatar ref（需要修改 ConversationsPage）
useEffect(() => {
  // 透過 context 或 props 獲取 avatarControlsRef
}, []);

// 在接收到 TTS 回應時啟動 Lip Sync
const handleTTSResponse = useCallback(async (text: string) => {
  try {
    // 調用 TTS API（已實現）
    const response = await fetch('/api/tts-viseme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    // 播放音訊
    const audio = new Audio(data.audioUrl);
    const audioStartTime = Date.now() + 100; // 100ms 緩衝

    // 啟動 Lip Sync
    if (avatarControlsRef.current) {
      avatarControlsRef.current.startVisemePlayback(
        data.visemes,
        audioStartTime
      );
    }

    audio.play();

    // 音訊結束時停止 Lip Sync
    audio.onended = () => {
      if (avatarControlsRef.current) {
        avatarControlsRef.current.stopVisemePlayback();
      }
    };

  } catch (error) {
    console.error('[Lip Sync] Error:', error);
  }
}, []);
```

### 4.2 修改 ConversationsPage

修改 `app/[locale]/(dashboard)/conversations/page.tsx`：

```typescript
// 添加 Avatar 控制 ref
const avatarModelRef = useRef<AvatarAnimationControls>(null);

// 將 ref 傳遞給 AvatarCanvas
<AvatarCanvas ref={avatarModelRef} />

// 透過 Context 或 Props 傳遞給 ChatInterface
```

## 5. 測試和調試

### 5.1 測試檢查清單

- [ ] Avatar 載入時包含 Oculus Viseme Morph Targets
- [ ] TTS API 正確返回 Viseme 資料
- [ ] Viseme ID 映射正確
- [ ] 音訊播放與 Lip Sync 同步
- [ ] 嘴型過渡平滑自然
- [ ] 播放結束後正確重置

### 5.2 調試工具

在 `AvatarControlPanel.tsx` 添加 Lip Sync 測試控制：

```typescript
<button
  onClick={() => {
    // 測試單個 Viseme
    if (avatarRef.current) {
      avatarRef.current.setViseme(2, 1.0); // 測試 'aa' 音
      setTimeout(() => {
        avatarRef.current?.resetVisemes();
      }, 1000);
    }
  }}
>
  測試 Viseme (aa)
</button>
```

### 5.3 常見問題

**問題 1：Morph Targets 未找到**
- 檢查 Avatar URL 是否包含 `?morphTargets=Oculus Visemes`
- 在控制台檢查 `morphTargetDictionary`

**問題 2：Lip Sync 不同步**
- 檢查 `audioStartTime` 計算是否正確
- 確認 Viseme `audioOffsetMs` 時間戳準確

**問題 3：嘴型變化不平滑**
- 調整 `VISEME_TRANSITION_TIME` 值
- 檢查 `useFrame` 的 `delta` 時間

**問題 4：某些音素沒有對應的嘴型**
- 檢查 `AZURE_TO_RPM_VISEME_MAP` 映射表
- 可能需要微調映射關係

## 6. 效能優化

### 6.1 Morph Target 更新優化

```typescript
// 只更新有變化的 Morph Targets
const changedVisemes = new Set<string>();

const updateOnlyChangedMorphTargets = (mesh: THREE.Mesh) => {
  changedVisemes.forEach((visemeName) => {
    const index = mesh.morphTargetDictionary?.[visemeName];
    if (index !== undefined) {
      mesh.morphTargetInfluences![index] = targetIntensityRef.current[visemeName];
    }
  });
  changedVisemes.clear();
};
```

### 6.2 減少不必要的計算

```typescript
// 使用 requestAnimationFrame 節流
let rafId: number | null = null;

const scheduleVisemeUpdate = () => {
  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      updateVisemes();
      rafId = null;
    });
  }
};
```

## 7. 未來擴展

### 7.1 表情與 Lip Sync 結合

```typescript
// 同時控制嘴型和表情
const setVisemeWithExpression = (visemeId: number, emotion: 'happy' | 'sad' | 'neutral') => {
  setViseme(visemeId, 1.0);

  // 根據情緒調整表情 Blendshapes
  if (emotion === 'happy') {
    setBlendshape('mouthSmileLeft', 0.5);
    setBlendshape('mouthSmileRight', 0.5);
  }
};
```

### 7.2 多語言 Viseme 優化

```typescript
// 根據語言調整映射表
export const getVisemeMapForLanguage = (language: 'zh-TW' | 'en-US' | 'ja-JP') => {
  switch (language) {
    case 'zh-TW':
      return AZURE_TO_RPM_VISEME_MAP_ZH_TW;
    case 'en-US':
      return AZURE_TO_RPM_VISEME_MAP_EN_US;
    default:
      return AZURE_TO_RPM_VISEME_MAP;
  }
};
```

## 8. 參考資源

### 官方文檔

- [Ready Player Me Morph Targets](https://docs.readyplayer.me/ready-player-me/api-reference/avatars/morph-targets)
- [Ready Player Me Oculus Viseme](https://docs.readyplayer.me/ready-player-me/api-reference/avatars/morph-targets/oculus-ovr-libsync)
- [Azure Speech Viseme](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme)

### 第三方資源

- [TalkingHead GitHub](https://github.com/met4citizen/TalkingHead) - JavaScript Lip Sync 參考實現
- [Medium Tutorial](https://medium.com/@israr46ansari/integrating-a-ready-player-me-3d-model-with-lipsyncing-in-react-for-beginners-af5b0c4977cd) - React 整合教學

---

**版本**: 1.0.0
**最後更新**: 2025-10-20
**作者**: AI Assistant
**項目**: Smart AI Avatar Agent
