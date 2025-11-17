import { useState } from 'react'
import Chat from './Chat'

function App() {
  const [showChat, setShowChat] = useState(false)

  if (showChat) {
    return <Chat />
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <header className="px-8 py-4 border-b border-gray-300">
        <div className="text-xl font-medium">mindseek</div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <h1 className="text-3xl font-medium mb-4">AI Diagnosis Assistant</h1>
        <p className="text-base text-gray-600 mb-8">
          DSM-5 trained AI for mental health diagnosis support.
        </p>
        <button
          onClick={() => setShowChat(true)}
          className="px-8 py-3 text-base bg-black text-white border border-black hover:bg-gray-800 cursor-pointer"
        >
          Start
        </button>
      </main>
    </div>
  )
}

export default App
