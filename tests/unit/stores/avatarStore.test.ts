/**
 * Avatar Store Unit Tests
 * Sprint 5 Phase 4: 測試 avatarStore 收藏功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAvatarStore } from '@/stores/avatarStore'
import { AVATARS_METADATA } from '@/lib/avatar/constants'

// Mock fetch
global.fetch = vi.fn()

describe('avatarStore - Sprint 5 功能測試', () => {
  beforeEach(() => {
    // 清除 localStorage (persist middleware)
    localStorage.clear()

    // 重置 store 狀態
    const { result } = renderHook(() => useAvatarStore())
    act(() => {
      result.current.availableAvatars = AVATARS_METADATA
      result.current.favoriteAvatarIds = []
      result.current.isFavoriteLoading = false
    })

    // 清除 fetch mock
    vi.clearAllMocks()
  })

  describe('收藏功能 (Phase 2.2)', () => {
    it('應該正確初始化收藏列表為空', () => {
      const { result } = renderHook(() => useAvatarStore())

      expect(result.current.favoriteAvatarIds).toEqual([])
      expect(result.current.isFavoriteLoading).toBe(false)
    })

    it('loadFavorites 應該成功載入收藏列表', async () => {
      const mockFavorites = [
        { id: 'fav1', avatarId: 'alex', createdAt: new Date().toISOString() },
        { id: 'fav2', avatarId: 'jordan', createdAt: new Date().toISOString() },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, favorites: mockFavorites }),
      })

      const { result } = renderHook(() => useAvatarStore())

      await act(async () => {
        await result.current.loadFavorites()
      })

      expect(result.current.favoriteAvatarIds).toEqual(['alex', 'jordan'])
    })

    it('loadFavorites 失敗時應該保持空列表', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      })

      const { result } = renderHook(() => useAvatarStore())

      await act(async () => {
        await result.current.loadFavorites()
      })

      expect(result.current.favoriteAvatarIds).toEqual([])
    })

    it('toggleFavorite 應該新增收藏 (樂觀更新)', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const { result } = renderHook(() => useAvatarStore())

      await act(async () => {
        await result.current.toggleFavorite('alex')
      })

      expect(result.current.favoriteAvatarIds).toContain('alex')
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/avatars/alex/favorite',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('toggleFavorite 應該移除收藏 (樂觀更新)', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const { result } = renderHook(() => useAvatarStore())

      // 先新增收藏
      act(() => {
        result.current.favoriteAvatarIds = ['alex']
      })

      await act(async () => {
        await result.current.toggleFavorite('alex')
      })

      expect(result.current.favoriteAvatarIds).not.toContain('alex')
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/avatars/alex/favorite',
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('toggleFavorite 失敗時應該還原狀態', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed' }),
      })

      const { result } = renderHook(() => useAvatarStore())

      const initialFavorites: string[] = []
      act(() => {
        result.current.favoriteAvatarIds = initialFavorites
      })

      await act(async () => {
        await result.current.toggleFavorite('alex')
      })

      // 應該還原為初始狀態
      expect(result.current.favoriteAvatarIds).toEqual(initialFavorites)
    })

    it('isFavorite 應該正確檢查收藏狀態', () => {
      const { result } = renderHook(() => useAvatarStore())

      act(() => {
        result.current.favoriteAvatarIds = ['alex', 'jordan']
      })

      expect(result.current.isFavorite('alex')).toBe(true)
      expect(result.current.isFavorite('jordan')).toBe(true)
      expect(result.current.isFavorite('casey')).toBe(false)
    })

    it('toggleFavorite 執行期間應該設置 loading 狀態', async () => {
      let resolvePromise: any
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(global.fetch as any).mockReturnValueOnce(promise)

      const { result } = renderHook(() => useAvatarStore())

      // 開始 toggle
      const togglePromise = act(async () => {
        await result.current.toggleFavorite('alex')
      })

      // 檢查 loading 狀態
      await waitFor(() => {
        expect(result.current.isFavoriteLoading).toBe(true)
      })

      // 完成請求
      resolvePromise({
        ok: true,
        json: async () => ({ success: true }),
      })

      await togglePromise

      // Loading 應該結束
      expect(result.current.isFavoriteLoading).toBe(false)
    })
  })

  describe('Avatar 列表載入 (Phase 1 & 2.1)', () => {
    it('loadAvatars 應該成功載入 Avatar 列表', async () => {
      const mockAvatars = AVATARS_METADATA.slice(0, 3)

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, avatars: mockAvatars }),
      })

      const { result } = renderHook(() => useAvatarStore())

      await act(async () => {
        await result.current.loadAvatars()
      })

      expect(result.current.availableAvatars).toEqual(mockAvatars)
      expect(result.current.isLoading).toBe(false)
    })

    it('loadAvatars 載入期間應該設置 loading 狀態', async () => {
      let resolvePromise: any
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(global.fetch as any).mockReturnValueOnce(promise)

      const { result } = renderHook(() => useAvatarStore())

      const loadPromise = act(async () => {
        await result.current.loadAvatars()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      resolvePromise({
        ok: true,
        json: async () => ({ success: true, avatars: [] }),
      })

      await loadPromise

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Avatar 選擇功能', () => {
    it('setAvatar 應該更新當前 Avatar', async () => {
      const { result } = renderHook(() => useAvatarStore())

      // 確保 availableAvatars 已設置
      const targetAvatar = AVATARS_METADATA[1] // 'avatar-female-casual'

      await act(async () => {
        await result.current.setAvatar(targetAvatar.id, false)
      })

      expect(result.current.currentAvatarId).toBe(targetAvatar.id)
      expect(result.current.currentAvatarUrl).toBe(targetAvatar.url)
    })

    it('setAvatar 使用不存在的 ID 應該發出警告', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { result } = renderHook(() => useAvatarStore())

      await act(async () => {
        await result.current.setAvatar('non-existent-id', false)
      })

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('not found')
      )

      consoleWarnSpy.mockRestore()
    })

    it('setAvatar 帶 saveToServer=true 應該呼叫 API', async () => {
      // 在 renderHook 之前設置 fetch mock
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const { result } = renderHook(() => useAvatarStore())

      // 確保使用正確的 Avatar
      const targetAvatar = AVATARS_METADATA[1] // 'avatar-female-casual'

      await act(async () => {
        await result.current.setAvatar(targetAvatar.id, true)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user/preferences',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining(targetAvatar.id),
        })
      )
    })
  })

  describe('Selector 切換', () => {
    it('toggleSelector 應該切換顯示狀態', () => {
      const { result } = renderHook(() => useAvatarStore())

      expect(result.current.isSelectorOpen).toBe(false)

      act(() => {
        result.current.toggleSelector()
      })

      expect(result.current.isSelectorOpen).toBe(true)

      act(() => {
        result.current.toggleSelector()
      })

      expect(result.current.isSelectorOpen).toBe(false)
    })
  })
})
