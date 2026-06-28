import { useState, useEffect, useRef } from 'react'
import { CreateMLCEngine, type MLCEngine, type InitProgressReport } from '@mlc-ai/web-llm'
import LoadingScreen from './components/LoadingScreen'
import ChatFeed from './components/ChatFeed'
import { TITA_CHAT_PROMPT } from './prompts/titaChat'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type AppState = 'unsupported' | 'loading' | 'ready'

const MODEL = 'Phi-3.5-mini-instruct-q4f16_1-MLC'

export default function App() {
  const [appState, setAppState] = useState<AppState>(
    !navigator.gpu ? 'unsupported' : 'loading'
  )
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing...')
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const engineRef = useRef<MLCEngine | null>(null)

  useEffect(() => {
    if (appState === 'unsupported') return

    CreateMLCEngine(MODEL, {
      initProgressCallback: (report: InitProgressReport) => {
        setProgress(Math.round(report.progress * 100))
        setStatusText(report.text)
      },
    }).then(engine => {
      engineRef.current = engine
      setAppState('ready')
    })
  }, [])

  async function sendMessage(content: string) {
    if (isStreaming || !engineRef.current) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content }
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    const chunks = await engineRef.current.chat.completions.create({
      messages: [{ role: 'system', content: TITA_CHAT_PROMPT }, ...messages, { role: 'user', content }],
      stream: true,
    })

    for await (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta?.content ?? ''
      if (delta) {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + delta,
          }
          return updated
        })
      }
    }

    setIsStreaming(false)
  }

  if (appState === 'unsupported') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-xs tracking-widest text-muted-foreground/60 uppercase">
          chatogpt
        </span>
        <p className="text-sm text-muted-foreground/60">
          This app requires WebGPU, which is only available in Chrome or Edge on desktop.
        </p>
      </div>
    )
  }

  if (appState === 'loading') {
    return <LoadingScreen progress={progress} statusText={statusText} />
  }

  return <ChatFeed messages={messages} isStreaming={isStreaming} onSend={sendMessage} />
}
