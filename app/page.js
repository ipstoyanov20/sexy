'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import HomeSection from '../components/HomeSection'
import GallerySection from '../components/GallerySection'
import MemoriesSection from '../components/MemoriesSection'
import AboutSection from '../components/AboutSection'

export default function Home() {
  const [activeSection, setActiveSection] = useState('home')

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection />
      case 'gallery':
        return <GallerySection />
      case 'memories':
        return <MemoriesSection />
      case 'about':
        return <AboutSection />
      default:
        return <HomeSection />
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      {renderSection()}
    </div>
  )
}