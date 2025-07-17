'use client'

export default function MemoriesSection() {
  const memories = [
    {
      id: 1,
      title: "Първата ни среща",
      date: "Преди много време...",
      description: "Момента, в който всичко започна. Усмивката ти промени целия ми свят.",
      icon: "💕",
      color: "from-pink-400 to-rose-400"
    },
    {
      id: 2,
      title: "Първата ни снимка",
      date: "Незабравим ден",
      description: "Когато за първи път се усмихнахме заедно пред камерата.",
      icon: "📸",
      color: "from-purple-400 to-pink-400"
    },
    {
      id: 3,
      title: "Специални моменти",
      date: "Всеки ден",
      description: "Всички малки неща, които правят нашата връзка специална.",
      icon: "✨",
      color: "from-blue-400 to-purple-400"
    },
    {
      id: 4,
      title: "Бъдещите ни планове",
      date: "Скоро...",
      description: "Всички прекрасни неща, които ни очакват напред.",
      icon: "🌟",
      color: "from-green-400 to-blue-400"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-love text-4xl md:text-5xl text-indigo-600 mb-4">
            Нашите Спомени 💭
          </h2>
          <p className="text-indigo-500 text-lg">
            Моменти, които ще носим завинаги в сърцата си
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-pink-300 to-purple-300 rounded-full"></div>

          {memories.map((memory, index) => (
            <div key={memory.id} className={`relative mb-12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
              {/* Timeline dot */}
              <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r ${memory.color} rounded-full border-4 border-white shadow-lg z-10`}></div>
              
              {/* Memory card */}
              <div className={`inline-block max-w-md ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${memory.color} rounded-full flex items-center justify-center text-2xl shadow-lg`}>
                      {memory.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{memory.title}</h3>
                      <p className="text-sm text-gray-500">{memory.date}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{memory.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Love Quote */}
        <div className="mt-16 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-2xl mx-auto">
            <div className="text-6xl mb-4">💖</div>
            <blockquote className="text-2xl text-gray-700 font-medium italic mb-4">
              "Любовта не е това, което виждаш, а това, което чувстваш."
            </blockquote>
            <p className="text-pink-500 font-semibold">
              За теб, с цялата ми любов ❤️
            </p>
          </div>
        </div>

        {/* Floating elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-pink-200 text-xl animate-float opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            >
              {['💕', '💖', '💗', '💝', '💞', '💟'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}