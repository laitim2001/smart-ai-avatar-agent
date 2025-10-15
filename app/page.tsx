export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="container mx-auto max-w-4xl">
        {/* 標題區 - 使用新的設計系統 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Smart AI Avatar Agent
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            3D Avatar 即時對話系統
          </p>
          <p className="text-sm text-muted-foreground">
            POC 專案初始化完成 ✅
          </p>
        </div>

        {/* 設計系統展示區 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 主色卡片 */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary rounded-md mb-4"></div>
            <h3 className="font-semibold mb-2 text-card-foreground">主色調</h3>
            <p className="text-sm text-muted-foreground">專業藍色品牌色</p>
          </div>

          {/* 次要色卡片 */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-secondary rounded-md mb-4"></div>
            <h3 className="font-semibold mb-2 text-card-foreground">次要色</h3>
            <p className="text-sm text-muted-foreground">輔助灰藍色調</p>
          </div>

          {/* 強調色卡片 */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-accent rounded-md mb-4"></div>
            <h3 className="font-semibold mb-2 text-card-foreground">強調色</h3>
            <p className="text-sm text-muted-foreground">突出顯示元素</p>
          </div>
        </div>

        {/* 狀態提示 */}
        <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center">
            ✨ 設計系統已就緒 - 16+ 語義化色彩變數 | 完整暗色模式支援 | 響應式佈局
          </p>
        </div>
      </main>
    </div>
  )
}
