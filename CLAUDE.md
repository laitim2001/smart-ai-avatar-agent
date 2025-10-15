# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A 3D Avatar real-time conversation system built with Next.js 15, Three.js, and Azure AI services. The system enables users to have natural conversations with an AI assistant that has 3D visual representation, voice synthesis, and planned lip-sync animation.

**Primary Language**: Traditional Chinese (繁體中文) for UI and conversation content, but code documentation uses English.

**Current Status**: Epic 1-3 complete (59% - 17/29 Stories). Epic 4 (Lip Sync) pending.

## Development Commands

```bash
# Start development server (localhost:3000)
npm run dev

# Production build
npm run build

# Run production server
npm start

# Lint code
npm run lint

# Format code with Prettier
npm run format

# Test Azure OpenAI and Speech services
npm run test:azure

# Generate/update PROJECT_INDEX.md
npm run generate-index    # Generate from scratch
npm run validate-index    # Validate existing index
npm run sync-index        # Sync with current codebase (preferred)
```

**Important**: Always run `npm run sync-index` after completing features to update PROJECT_INDEX.md.

## Architecture Overview

### Core Stack
- **Frontend**: Next.js 15.5.5 (App Router), React 19.2.0, TypeScript 5.9.3
- **3D Rendering**: Three.js 0.180.0 + @react-three/fiber 9.4.0 + @react-three/drei
- **State Management**: Zustand 5.0.8 (3 separate stores: avatar, chat, audio)
- **Styling**: Tailwind CSS 4.1.14 (utility-first, no @apply directives)
- **AI Services**: Azure OpenAI (GPT-4 Turbo) + Azure Speech Services (TTS)

### Directory Structure

```
app/
├── api/                      # API Routes (Edge Runtime)
│   ├── chat/route.ts        # LLM with SSE streaming
│   ├── tts/route.ts         # Text-to-speech synthesis
│   └── health/route.ts      # Health check endpoint
├── layout.tsx               # Root layout (Noto Sans TC + Inter fonts)
├── page.tsx                 # Home page (Avatar left, Chat right)
└── globals.css              # Tailwind imports only

components/
├── avatar/                   # 3D Avatar components
│   ├── AvatarCanvas.tsx     # Three.js Canvas wrapper
│   ├── AvatarModel.tsx      # Avatar 3D model renderer
│   ├── AvatarLoadingState.tsx
│   ├── AvatarControlPanel.tsx  # Animation test controls
│   ├── AvatarSelector.tsx   # Avatar selection modal
│   ├── AvatarChangeButton.tsx
│   └── hooks/
│       └── useAvatarAnimation.ts  # Animation orchestration
├── chat/                    # Chat interface
│   ├── ChatInterface.tsx    # Main chat UI
│   └── Spinner.tsx          # Loading spinner
└── ui/                      # Reusable UI components
    ├── button.tsx           # Button with variants
    └── input.tsx            # Input with label/error

lib/
├── azure/                   # Azure SDK wrappers
│   ├── openai.ts           # AzureOpenAI client factory
│   └── speech.ts           # Speech SDK configuration
├── avatar/                  # Avatar-specific logic
│   ├── animations.ts       # Animation controllers (blink, breath, expression, nod)
│   ├── loaders.ts          # GLB model loading utilities
│   └── constants.ts        # Avatar URLs and config
├── audio/
│   └── player.ts           # Web Audio API player singleton
├── api/
│   ├── client.ts           # API client utilities
│   └── chat.ts             # SSE streaming client
└── utils/
    ├── error-handler.ts    # Error handling utilities
    └── utils.ts            # cn() utility for class merging

stores/                      # Zustand state management
├── avatarStore.ts          # Avatar selection (persisted to localStorage)
├── chatStore.ts            # Conversation state + SSE integration
└── audioStore.ts           # Audio playback state + TTS integration

types/                       # TypeScript type definitions
├── api.ts                  # API response types
├── chat.ts                 # Chat-related types
└── audio.ts                # Audio-related types
```

### State Management Architecture

**Three Independent Stores** (Zustand):

1. **avatarStore**: Avatar selection state
   - Persisted to localStorage
   - Controls which 3D model to render
   - Stores: currentAvatarId, currentAvatarUrl, isSelectorOpen

2. **chatStore**: Conversation state
   - Messages array (user + avatar roles)
   - Input text, loading state
   - SSE streaming integration
   - Auto-triggers TTS when LLM response completes

3. **audioStore**: Audio playback state
   - Current audio, queue, playback state
   - TTS API integration
   - Web Audio API playback control
   - Blob URL lifecycle management

**State Flow**:
```
User Input → chatStore.sendMessage()
  → POST /api/chat (SSE streaming)
  → chatStore updates message character-by-character
  → On stream complete → audioStore.speakText()
  → POST /api/tts
  → Web Audio API playback
  → Cleanup on complete
```

### API Architecture

**All API routes use Edge Runtime** for performance:

1. **POST /api/chat**: LLM conversation with SSE streaming
   - Input: `{ messages: ChatMessage[] }`
   - Output: SSE stream `data: {"content": "..."}\n\n`
   - System Prompt: Friendly, concise, Traditional Chinese
   - Timeout: 10 seconds
   - Streaming: character-by-character via ReadableStream

2. **POST /api/tts**: Text-to-speech synthesis
   - Input: `{ text: string, voice?: string, speed?: number, pitch?: number }`
   - Output: MP3 audio blob (32kbps, Mono)
   - Voice: zh-TW-HsiaoChenNeural (default)
   - Timeout: 5 seconds
   - SSML support for prosody control

3. **GET /api/health**: Health check
   - Output: `{ status: "ok", timestamp: string }`

### Animation System

**Controller Pattern** (lib/avatar/animations.ts):
- `BlinkController`: Random eye blinks (2-6s interval)
- `BreathingController`: Sine wave chest movement via Spine2 bone
- `ExpressionController`: Smile blendshape with easing
- `HeadNodController`: Sine wave head rotation

**Animation Hook** (components/avatar/hooks/useAvatarAnimation.ts):
- Orchestrates all animation controllers
- useFrame() for 60 FPS updates
- Exposes imperativeHandle for external control
- All animations can run simultaneously without conflict

**Avatar Model Loading**:
- Ready Player Me GLB models (3 avatars: Alex, Jordan, Casey)
- GLTFLoader via useGLTF (auto-cached by drei)
- Supports morphTargets (blendshapes) for facial animation
- Skeleton manipulation for body animation

## Azure Services Configuration

### Required Environment Variables

Create `.env.local` (never commit!):

```bash
# Azure OpenAI (GPT-4 Turbo)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_DEPLOYMENT=gpt-4-turbo
AZURE_OPENAI_API_VERSION=2024-02-01

# Azure Speech Services (TTS/STT)
AZURE_SPEECH_KEY=your_speech_key_here
AZURE_SPEECH_REGION=eastasia
```

### Testing Azure Services

```bash
npm run test:azure
```

This validates both OpenAI and Speech SDK configurations.

## Important Development Patterns

### 1. Azure OpenAI Client Usage

```typescript
import { getOpenAIClient, DEPLOYMENT_NAME } from '@/lib/azure/openai'

const client = getOpenAIClient()
const response = await client.chat.completions.create({
  model: DEPLOYMENT_NAME,
  messages: [...],
  stream: true,  // Enable for SSE
})
```

**Never instantiate AzureOpenAI directly** - always use `getOpenAIClient()` for consistent error handling.

### 2. SSE Streaming Pattern

**Server** (API Route):
```typescript
const encoder = new TextEncoder()
const stream = new ReadableStream({
  async start(controller) {
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || ''
      const sseChunk = `data: ${JSON.stringify({ content })}\n\n`
      controller.enqueue(encoder.encode(sseChunk))
    }
    controller.close()
  }
})

return new NextResponse(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  }
})
```

**Client** (lib/api/chat.ts):
```typescript
const response = await fetch('/api/chat', { method: 'POST', body: ... })
const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  const lines = chunk.split('\n')

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6))
      onChunk(data.content)
    }
  }
}
```

### 3. Zustand Store Pattern

```typescript
import { create } from 'zustand'

export const useMyStore = create<MyStore>((set, get) => ({
  // State
  value: 0,

  // Actions
  increment: () => set((state) => ({ value: state.value + 1 })),

  // Async actions with get()
  fetchData: async () => {
    const { value } = get()
    const result = await api.fetch(value)
    set({ value: result })
  },
}))
```

**With Persistence**:
```typescript
import { persist } from 'zustand/middleware'

export const useMyStore = create<MyStore>()(
  persist(
    (set, get) => ({ /* ... */ }),
    { name: 'my-storage' }
  )
)
```

### 4. Three.js Animation Pattern

```typescript
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function MyMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Animation logic (60 FPS)
    meshRef.current.rotation.y += delta * 0.5
  })

  return <mesh ref={meshRef}>{/* ... */}</mesh>
}
```

### 5. Web Audio API Pattern

```typescript
class AudioPlayer {
  private audioContext: AudioContext | null = null
  private currentSource: AudioBufferSourceNode | null = null

  async loadAudio(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return await this.audioContext.decodeAudioData(arrayBuffer)
  }

  play(buffer: AudioBuffer, onEnded?: () => void) {
    this.stop()  // Stop any current playback

    const source = this.audioContext!.createBufferSource()
    source.buffer = buffer
    source.connect(this.audioContext!.destination)
    source.onended = onEnded

    this.currentSource = source
    source.start(0)
  }

  stop() {
    if (this.currentSource) {
      try { this.currentSource.stop() } catch {}
      this.currentSource = null
    }
  }
}
```

**Always use singleton pattern** via `getAudioPlayer()` to avoid multiple AudioContext instances.

## Common Development Tasks

### Adding a New Avatar Animation

1. Create controller in `lib/avatar/animations.ts`:
```typescript
export class MyAnimationController {
  private isActive = false

  start() { this.isActive = true }
  stop() { this.isActive = false }

  update(avatar: THREE.Group, delta: number) {
    if (!this.isActive) return
    // Animation logic
  }
}
```

2. Integrate in `useAvatarAnimation.ts`:
```typescript
const myAnim = useRef(new MyAnimationController())

useFrame((state, delta) => {
  myAnim.current.update(avatarRef.current, delta)
})

useImperativeHandle(ref, () => ({
  startMyAnimation: () => myAnim.current.start(),
  stopMyAnimation: () => myAnim.current.stop(),
}))
```

3. Test in `AvatarControlPanel.tsx`

### Adding a New API Route

1. Create `app/api/my-route/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'  // Always use Edge Runtime

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Logic here
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[My Route Error]', error)
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}
```

2. Create client function in `lib/api/`:
```typescript
export async function callMyApi(data: any) {
  const response = await fetch('/api/my-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('API call failed')
  return await response.json()
}
```

### Updating Progress Documents

After completing a Story/Epic:

1. Run index sync:
```bash
npm run sync-index
```

2. Update `DEVELOPMENT_STATUS.md`:
   - Mark Story as complete with ✅
   - Update Epic/Sprint progress percentages
   - Add Git commit to development log
   - Update performance metrics if applicable

3. Update `PROJECT_STATUS.md`:
   - Update overall progress table
   - Add completed Story details
   - Update milestone tracking
   - Add Git commits to changelog

4. Commit and push:
```bash
git add .
git commit -m "docs: update progress - Story X.Y complete"
git push
```

## Testing and Debugging

### Browser Testing

Development server runs on `http://localhost:3000`

**Common Issues**:

1. **3D Avatar not loading**: Check browser console for CORS errors. Verify Ready Player Me URLs are accessible.

2. **Chat not responding**: Check Network tab for `/api/chat` SSE stream. Verify Azure OpenAI credentials in `.env.local`.

3. **No audio playback**: Check console for Web Audio API errors. Ensure `/api/tts` returns valid audio blob. Test with headphones to rule out speaker issues.

4. **Animation stuttering**: Open Performance tab. Target 60 FPS. If below 30 FPS, check for expensive operations in useFrame().

### Performance Monitoring

**Built-in logging** in chatStore:
```
[Performance] LLM Response Time: 1234ms
[Performance] TTS Time: 567ms
[Performance] Total E2E Time: 1801ms
```

Target: <2500ms end-to-end latency (user input → audio playback)

### Testing Azure Services

```bash
npm run test:azure
```

Expected output:
```
✅ Azure OpenAI 連接成功
   - 端點: https://your-resource.openai.azure.com/
   - 模型: gpt-4-turbo
   - 測試回應: [AI response here]

✅ Azure Speech Services 連接成功
   - 區域: eastasia
   - 預設語音: zh-TW-HsiaoChenNeural
```

## Known Technical Constraints

1. **Tailwind CSS 4**: `@apply` directive not supported. Use utility classes directly or CSS properties.

2. **Azure OpenAI v2.0**: Requires both `@azure/openai` and `openai` packages. Use `openai` package's `AzureOpenAI` class.

3. **Ready Player Me**: Only `.glb` format supported. Ensure models include:
   - Skeleton (for body animation)
   - Morph targets/blendshapes (for facial animation)
   - Correctly named bones: Head, Spine2, etc.

4. **Web Audio API**: Requires user interaction before first playback (browser security). First audio might be silent until user clicks.

5. **SSE Streaming**: Must use Edge Runtime. Server Functions don't support streaming responses properly.

## Project Documentation

- **DEVELOPMENT_STATUS.md**: Current development progress (working document, updated frequently)
- **PROJECT_STATUS.md**: Project overview and milestones (updated after Epic completion)
- **PROJECT_INDEX.md**: Complete file catalog (auto-generated via npm scripts)
- **SPRINT_PLAN.md**: Original 12-week development plan (read-only reference)
- **README.md**: User-facing quick start guide
- **docs/**: Story documentation, guides, deployment instructions

## Git Workflow

**Commit Message Format**:
```
<type>: <description>

Examples:
feat: 實作對話介面 UI (Story 3.1)
fix: 修復 Avatar 模型載入錯誤
docs: 更新 Epic 3 完成狀態
refactor: 重構 audioStore 音訊佇列邏輯
```

**Branch Strategy**: Currently using `main` branch for POC development. Feature branches recommended for experimental changes.

## Deployment

**Platform**: Azure Static Web Apps

**CI/CD**: GitHub Actions (`.github/workflows/azure-static-web-apps.yml`)

**Workflow**:
1. Push to `main` → GitHub Actions triggered
2. ESLint → TypeScript check → Build → Deploy
3. ~5-10 minutes to production

**Environment Variables**: Must be set in both:
- GitHub Secrets (for CI/CD)
- Azure Portal → Static Web Apps → Configuration

See `docs/deployment-guide.md` for complete setup instructions.
