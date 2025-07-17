'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load images on component mount
  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    if (!supabase) {
      setError('Supabase не е конфигуриран правилно')
      return
    }

    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('Грешка при зареждане на снимки:', error)
      setError('Грешка при зареждане на снимки')
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Моля изберете снимка')
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Снимката е твърде голяма (максимум 10MB)')
      }

      // Process image
      const processedImage = await processImage(file)
      
      // Get current date and time
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = now.toLocaleTimeString('bg-BG')

      // Upload to Supabase
      if (!supabase) {
        throw new Error('Supabase не е конфигуриран правилно')
      }

      const { error } = await supabase
        .from('gallery_images')
        .insert([
          {
            title: file.name,
            image_data: processedImage,
            date_taken: dateStr,
            time_taken: timeStr
          }
        ])

      if (error) throw error

      setSuccess('Снимката е качена успешно! ✨')
      await loadImages()
      
      // Clear file input
      event.target.value = ''
      
    } catch (error) {
      console.error('Грешка при качване:', error)
      setError(error.message || 'Грешка при качване на снимката')
    } finally {
      setUploading(false)
    }
  }

  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        try {
          // Calculate new dimensions (max 1200px)
          const maxSize = 1200
          let { width, height } = img
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }

          // Set canvas size and draw image
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to base64 with compression
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          
          // Check size limit (8MB for processed image)
          if (dataUrl.length > 8 * 1024 * 1024) {
            reject(new Error('Снимката е твърде голяма след обработка'))
            return
          }

          resolve(dataUrl)
        } catch (error) {
          reject(new Error('Грешка при обработка на снимката'))
        }
      }

      img.onerror = () => {
        reject(new Error('Грешка при зареждане на снимката'))
      }

      // Create object URL and load image
      const objectUrl = URL.createObjectURL(file)
      img.src = objectUrl
      
      // Cleanup after 30 seconds
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl)
      }, 30000)
    })
  }

  const deleteImage = async (id) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази снимка?')) return

    try {
      if (!supabase) {
        throw new Error('Supabase не е конфигуриран правилно')
      }

      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccess('Снимката е изтрита успешно')
      await loadImages()
    } catch (error) {
      console.error('Грешка при изтриване:', error)
      setError('Грешка при изтриване на снимката')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-love text-4xl md:text-6xl text-pink-600 mb-4">
            За малката ❤️
          </h1>
          <p className="text-pink-500 text-lg">
            Споделени спомени и моменти
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
          <div className="text-center">
            <label className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full cursor-pointer hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              {uploading ? '⏳ Качване...' : '📸 Добави снимка'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-center">
              {success}
            </div>
          )}
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="aspect-square overflow-hidden">
                <img
                  src={image.image_data}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate mb-2">
                  {image.title}
                </h3>
                <div className="text-sm text-gray-600 mb-3">
                  <p>📅 {image.date_taken}</p>
                  {image.time_taken && <p>🕐 {image.time_taken}</p>}
                </div>
                <button
                  onClick={() => deleteImage(image.id)}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  🗑️ Изтрий
                </button>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-pink-400 text-lg">
              Все още няма качени снимки. Добавете първата! 📸
            </p>
          </div>
        )}
      </div>
    </div>
  )
}