'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function GallerySection() {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)

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
      if (!file.type.startsWith('image/')) {
        throw new Error('Моля изберете снимка')
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Снимката е твърде голяма (максимум 10MB)')
      }

      const processedImage = await processImage(file)
      
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = now.toLocaleTimeString('bg-BG')

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
          const maxSize = 1200
          let { width, height } = img
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          
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

      const objectUrl = URL.createObjectURL(file)
      img.src = objectUrl
      
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-love text-4xl md:text-5xl text-purple-600 mb-4">
            Нашата Галерия 📸
          </h2>
          <p className="text-purple-500 text-lg">
            Всички наши прекрасни моменти на едно място
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 mb-8 shadow-xl">
          <div className="text-center">
            <label className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              {uploading ? (
                <span className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Качване...</span>
                </span>
              ) : (
                '📸 Добави нова снимка'
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl text-center">
              {success}
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => setSelectedImage(image)}>
                <img
                  src={image.image_data}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate mb-2">
                  {image.title}
                </h3>
                <div className="text-sm text-gray-600 mb-3">
                  <p className="flex items-center space-x-1">
                    <span>📅</span>
                    <span>{image.date_taken}</span>
                  </p>
                  {image.time_taken && (
                    <p className="flex items-center space-x-1">
                      <span>🕐</span>
                      <span>{image.time_taken}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteImage(image.id)}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>🗑️</span>
                  <span>Изтрий</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-purple-400 text-xl mb-2">
              Все още няма качени снимки
            </p>
            <p className="text-purple-300">
              Добавете първата снимка, за да започнете галерията!
            </p>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <div className="max-w-4xl max-h-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">{selectedImage.title}</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <img
                src={selectedImage.image_data}
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] object-contain"
              />
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600">
                  📅 {selectedImage.date_taken} {selectedImage.time_taken && `🕐 ${selectedImage.time_taken}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}