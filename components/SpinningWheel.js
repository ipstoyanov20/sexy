'use client'

import { useState, useEffect } from 'react'

export default function SpinningWheel({ onComplete }) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  const messages = [
    "Зареждам любовта... 💕",
    "Подготвям спомените... 📸",
    "Създавам магия... ✨",
    "Почти готово... 🌟"
  ]

  const [currentMessage, setCurrentMessage] = useState(0)

  const startSpinning = () => {
    setIsSpinning(true)
    setShowMessage(true)
    
    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 800)

    // Complete after 3 seconds
    setTimeout(() => {
      setIsSpinning(false)
      setShowMessage(false)
      clearInterval(messageInterval)
      if (onComplete) onComplete()
    }, 3200)
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Main Spinning Wheel */}
      <div className="relative">
        <div 
          className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 flex items-center justify-center shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110 ${
            isSpinning ? 'animate-spin-beautiful' : 'hover:shadow-pink-300/50'
          }`}
          onClick={startSpinning}
        >
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center">
            <span className="text-4xl md:text-5xl animate-pulse-slow">❤️</span>
          </div>
        </div>
        
        {/* Decorative elements around wheel */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}>
          <span className="text-xs">✨</span>
        </div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}>
          <span className="text-xs">💫</span>
        </div>
        <div className="absolute top-1/2 -left-8 w-6 h-6 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}>
          <span className="text-xs">🌟</span>
        </div>
        <div className="absolute top-1/2 -right-8 w-6 h-6 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}>
          <span className="text-xs">⭐</span>
        </div>
      </div>

      {/* Loading Message */}
      {showMessage && (
        <div className="text-center">
          <p className="text-pink-600 text-lg md:text-xl font-medium animate-pulse">
            {messages[currentMessage]}
          </p>
          <div className="flex justify-center space-x-1 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isSpinning && !showMessage && (
        <div className="text-center">
          <p className="text-pink-500 text-lg mb-2">
            Натисни колелото за да започнеш! 🎯
          </p>
          <p className="text-pink-400 text-sm">
            Завърти колелото на любовта
          </p>
        </div>
      )}
    </div>
  )
}