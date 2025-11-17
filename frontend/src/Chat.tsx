import { useState, useRef, useEffect } from 'react'
import './Chat.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const API_URL = 'http://localhost:8000/api/chat/stream'

function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    }

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInput('')
    setIsLoading(true)

    const assistantIndex = messages.length + 1

    try {
      abortControllerRef.current = new AbortController()
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedContent += parsed.content
                
                setMessages(prev => {
                  const updated = [...prev]
                  updated[assistantIndex] = { ...updated[assistantIndex], content: accumulatedContent }
                  return updated
                })
              }
            } catch {
              // Invalid JSON chunk, skip
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev]
          updated[assistantIndex] = { 
            ...updated[assistantIndex], 
            content: updated[assistantIndex].content || 'Sorry, I encountered an error. Please try again.'
          }
          return updated
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      <div className="px-6 py-4 border-b border-gray-300">
        <div className="text-xl font-medium text-black">mindseek</div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Ask a question to get started</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-2">
              <div className={`text-sm font-medium text-gray-600 ${message.role === 'user' ? 'self-end' : ''}`}>
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
              <div className={`px-4 py-3.5 border leading-6 max-w-[70%] ${
                message.role === 'user'
                  ? 'self-end bg-black text-white border-black'
                  : 'bg-gray-50 text-black border-gray-300'
              }`}>
                {message.content || <span className="cursor">|</span>}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 py-6 border-t border-gray-300">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 text-base outline-none focus:border-black disabled:bg-gray-100"
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              type="button"
              onClick={handleStop}
              className="px-6 py-3 border border-black bg-white text-black text-base cursor-pointer whitespace-nowrap hover:bg-gray-100"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-3 border border-black bg-black text-white text-base cursor-pointer whitespace-nowrap hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!input.trim()}
            >
              Send
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

export default Chat

