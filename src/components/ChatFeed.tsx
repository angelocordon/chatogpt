import { useEffect, useRef, useState } from 'react'
import type { Message } from '../App'

interface Props {
  messages: Message[]
  isStreaming: boolean
  onSend: (content: string) => void
}

export default function ChatFeed({ messages, isStreaming, onSend }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleSubmit() {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <span className="text-xs tracking-widest text-muted-foreground/50 uppercase">
            chatogpt
          </span>
        </div>
      </header>

      {/* Message feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-8 py-10">
              {messages.map(msg => (
                <MessageRow key={msg.id} message={msg} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 transition-colors focus-within:border-border/80">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Message..."
              rows={1}
              className="max-h-40 flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isStreaming}
              aria-label="Send message"
              className="mb-px flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:text-foreground disabled:opacity-20"
            >
              <ArrowUpIcon />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground/25">
            Enter to send · Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center">
      <p className="text-2xl font-medium tracking-tight text-foreground/80">
        Ask me anything.
      </p>
      <p className="mt-2 text-sm text-muted-foreground/40">
        Runs entirely in your browser — no server, no API key.
      </p>
    </div>
  )
}

function MessageRow({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold tracking-widest text-muted-foreground/40 uppercase">
        {isUser ? 'You' : 'Chato'}
      </span>

      {isUser ? (
        <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
      ) : (
        <div className="border-l-2 border-border pl-4">
          <p className="text-sm leading-relaxed text-foreground/85">
            {message.content ? (
              message.content
            ) : (
              <span className="animate-pulse text-muted-foreground/50">▋</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

function ArrowUpIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  )
}
