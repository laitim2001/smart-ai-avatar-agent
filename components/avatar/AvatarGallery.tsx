'use client'

/**
 * Avatar Gallery Component
 * Sprint 5: 擴充分類、標籤、搜尋、排序功能
 * Avatar 圖庫元件 - 顯示所有可用的 Avatar
 */

import { useEffect, useState, useMemo } from 'react'
import { useAvatarStore, type AvatarMetadata } from '@/stores/avatarStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Search, SlidersHorizontal, Star } from 'lucide-react'

interface AvatarGalleryProps {
  /** 是否顯示為選擇模式 */
  selectionMode?: boolean
  /** 選擇 Avatar 時的回調 */
  onSelect?: (avatar: AvatarMetadata) => void
  /** 當前選中的 Avatar ID */
  selectedId?: string
}

export default function AvatarGallery({
  selectionMode = false,
  onSelect,
  selectedId,
}: AvatarGalleryProps) {
  const {
    availableAvatars,
    currentAvatarId,
    isLoading,
    loadAvatars,
    setAvatar,
  } = useAvatarStore()

  // Sprint 5: 擴充篩選狀態
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('popularity')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(false)

  // 載入 Avatar 列表
  useEffect(() => {
    loadAvatars()
  }, [loadAvatars])

  // 取得目前選中的 ID
  const activeId = selectedId || currentAvatarId

  // 取得所有可用標籤
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    availableAvatars.forEach((avatar) => {
      avatar.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [availableAvatars])

  // 計算分類統計
  const categoryStats = useMemo(() => {
    const stats = availableAvatars.reduce((acc, avatar) => {
      acc[avatar.category] = (acc[avatar.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return stats
  }, [availableAvatars])

  // 篩選與排序 Avatar
  const filteredAvatars = useMemo(() => {
    let result = [...availableAvatars]

    // 類別篩選
    if (categoryFilter !== 'all') {
      result = result.filter((a) => a.category === categoryFilter)
    }

    // 標籤篩選 (OR 邏輯)
    if (selectedTags.length > 0) {
      result = result.filter((a) =>
        a.tags.some((tag) => selectedTags.includes(tag))
      )
    }

    // 搜尋篩選 (名稱)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.nameEn.toLowerCase().includes(query)
      )
    }

    // Featured 篩選
    if (showFeaturedOnly) {
      result = result.filter((a) => a.featured)
    }

    // 排序
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.popularity - a.popularity)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'))
        break
      case 'newest':
      default:
        // 預設按 popularity 排序 (因為沒有 createdAt 在前端)
        result.sort((a, b) => b.popularity - a.popularity)
    }

    return result
  }, [
    availableAvatars,
    categoryFilter,
    selectedTags,
    searchQuery,
    showFeaturedOnly,
    sortBy,
  ])

  // 處理選擇
  const handleSelect = async (avatar: AvatarMetadata) => {
    if (onSelect) {
      onSelect(avatar)
    } else {
      await setAvatar(avatar.id, selectionMode)
    }
  }

  // 處理標籤切換
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">載入 Avatar 中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 搜尋與排序列 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 搜尋框 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜尋 Avatar 名稱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 排序選擇器 */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">熱門優先</SelectItem>
            <SelectItem value="name">名稱排序</SelectItem>
            <SelectItem value="newest">最新優先</SelectItem>
          </SelectContent>
        </Select>

        {/* 篩選按鈕 */}
        <Button
          variant={showFilters ? 'primary' : 'outline'}
          size="md"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          篩選
        </Button>
      </div>

      {/* 篩選區域 (可收合) */}
      {showFilters && (
        <Card className="p-4 space-y-4">
          {/* Featured 切換 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={showFeaturedOnly}
              onCheckedChange={(checked) => setShowFeaturedOnly(checked as boolean)}
            />
            <Label
              htmlFor="featured"
              className="flex items-center gap-1 cursor-pointer"
            >
              <Star className="h-4 w-4 text-yellow-500" />
              只顯示推薦 Avatar
            </Label>
          </div>

          <Separator />

          {/* 分類篩選 (Tabs) */}
          <div>
            <Label className="text-sm font-medium mb-2 block">分類篩選</Label>
            <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  全部 ({availableAvatars.length})
                </TabsTrigger>
                <TabsTrigger value="female">
                  女性 ({categoryStats.female || 0})
                </TabsTrigger>
                <TabsTrigger value="male">
                  男性 ({categoryStats.male || 0})
                </TabsTrigger>
                <TabsTrigger value="neutral">
                  中性 ({categoryStats.neutral || 0})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Separator />

          {/* 標籤篩選 (Checkboxes) */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              標籤篩選 (可多選)
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                  />
                  <Label
                    htmlFor={`tag-${tag}`}
                    className="text-sm cursor-pointer"
                  >
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="mt-2"
              >
                清除標籤篩選
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* 結果統計 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          顯示 {filteredAvatars.length} 個 Avatar
          {(searchQuery || selectedTags.length > 0 || categoryFilter !== 'all' || showFeaturedOnly) && (
            <span> (已篩選)</span>
          )}
        </div>
        {(searchQuery || selectedTags.length > 0 || categoryFilter !== 'all' || showFeaturedOnly) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCategoryFilter('all')
              setSelectedTags([])
              setSearchQuery('')
              setShowFeaturedOnly(false)
            }}
          >
            清除所有篩選
          </Button>
        )}
      </div>

      {/* Avatar 網格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAvatars.map((avatar) => {
          const isSelected = activeId === avatar.id

          return (
            <Card
              key={avatar.id}
              className={`cursor-pointer transition-all hover:shadow-lg relative ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => handleSelect(avatar)}
            >
              <div className="p-4">
                {/* Featured 徽章 */}
                {avatar.featured && (
                  <div className="absolute top-2 right-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                )}

                {/* Avatar 縮圖 */}
                <div className="text-6xl mb-3 text-center">
                  {avatar.thumbnail}
                </div>

                {/* Avatar 資訊 */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-base">
                    {avatar.name}
                    {avatar.nameEn && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({avatar.nameEn})
                      </span>
                    )}
                  </h3>

                  {avatar.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {avatar.description.split('\n')[0]}
                    </p>
                  )}

                  {/* 標籤 */}
                  {avatar.tags && avatar.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {avatar.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {avatar.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded">
                          +{avatar.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 熱門度指示 */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>熱門度: {avatar.popularity}</span>
                  </div>

                  {/* 選中指示 */}
                  {isSelected && (
                    <div className="mt-2 text-sm text-primary font-medium flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      已選擇
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 無結果提示 */}
      {filteredAvatars.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🔍</div>
          <p>找不到符合條件的 Avatar</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCategoryFilter('all')
              setSelectedTags([])
              setSearchQuery('')
              setShowFeaturedOnly(false)
            }}
            className="mt-4"
          >
            清除篩選條件
          </Button>
        </div>
      )}
    </div>
  )
}
