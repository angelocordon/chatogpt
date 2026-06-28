import { useState, useEffect } from 'react'
import LoadingScreen from './components/LoadingScreen'
import ChatFeed from './components/ChatFeed'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type AppState = 'loading' | 'ready'

const FAKE_RESPONSE =
  "I'm a placeholder response. WebLLM integration is coming — when it arrives, I'll run entirely in your browser using WebGPU. No server, no API key, no data leaving your machine."

const LOAD_STAGES: { at: number; text: string }[] = [
  { at: 0, text: 'Initializing...' },
  { at: 8, text: 'Downloading model weights...' },
  { at: 78, text: 'Loading into memory...' },
  { at: 94, text: 'Finalizing...' },
]

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing...')
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  // Simulate model loading progress
  useEffect(() => {
    let current = 0

    const interval = setInterval(() => {
      // Ease-out: fast at first, slows as it approaches 100
      const remaining = 100 - current
      const step = Math.max(0.2, remaining * 0.03) * (0.6 + Math.random() * 0.8)
      current = Math.min(100, current + step)

      const pct = Math.floor(current)
      setProgress(pct)

      const stage = [...LOAD_STAGES].reverse().find(s => pct >= s.at)
      if (stage) setStatusText(stage.text)

      if (current >= 100) {
        clearInterval(interval)
        setTimeout(() => setAppState('ready'), 400)
      }
    }, 60)

    return () => clearInterval(interval)
  }, [])

  function sendMessage(content: string) {
    if (isStreaming) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content }
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    let i = 0
    const interval = setInterval(() => {
      i++
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: FAKE_RESPONSE.slice(0, i),
        }
        return updated
      })

      if (i >= FAKE_RESPONSE.length) {
        clearInterval(interval)
        setIsStreaming(false)
      }
    }, 18)
  }

  if (appState === 'loading') {
    return <LoadingScreen progress={progress} statusText={statusText} />
  }

  return <ChatFeed messages={messages} isStreaming={isStreaming} onSend={sendMessage} />
}
