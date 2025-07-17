'use client'

import SpinningWheel from './SpinningWheel'
import { useState } from 'react'

export default function HomeSection() {
  const [wheelCompleted, setWheelCompleted] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Title */}
        <div className="mb-12">
          <h1 className="font-love text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 mb-6">
            За малката ❤️
          </h1>
          <p className="text-pink-500 text-xl md:text-2xl mb-4">
            Място за нашите най-скъпи спомени
          </p>
          <p className="text-pink-400 text-lg">
            От Иво с много любов 💕
          </p>
        </div>

        {/* Spinning Wheel */}
        <div className="mb-12">
          <SpinningWheel onComplete={() => setWheelCompleted(true)} />
        </div>

        {/* Welcome Message after wheel completion */}
        {wheelCompleted && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl animate-fade-in">
            <h2 className="text-2xl md:text-3xl text-pink-600 font-semibold mb-4">
              Добре дошла в нашия свят! 🌟
            </h2>
            <p className="text-pink-500 text-lg mb-6">
              Тук ще намериш всички наши споделени моменти, снимки и спомени.
              Всяка снимка разказва история, всеки момент е специален.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="text-4xl mb-2">📸</div>
                <h3 className="text-pink-600 font-semibold mb-2">Галерия</h3>
                <p className="text-pink-400 text-sm">Нашите най-красиви снимки</p>
              </div>
              <div className="p-4">
                <div className="text-4xl mb-2">💭</div>
                <h3 className="text-pink-600 font-semibold mb-2">Спомени</h3>
                <p className="text-pink-400 text-sm">Моменти, които никога няма да забравим</p>
              </div>
              <div className="p-4">
                <div className="text-4xl mb-2">💕</div>
                <h3 className="text-pink-600 font-semibold mb-2">Любов</h3>
                <p className="text-pink-400 text-sm">Всичко това е за теб</p>
              </div>
            </div>
          </div>
        )}

        {/* Floating hearts animation */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-pink-300 text-2xl animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            >
              💖
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}