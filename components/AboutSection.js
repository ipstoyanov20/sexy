'use client'

export default function AboutSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-love text-4xl md:text-5xl text-rose-600 mb-4">
            За нас 💕
          </h2>
          <p className="text-rose-500 text-lg">
            Историята на нашата любов
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left side - About the relationship */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">💑</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Нашата история</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Това място е създадено с много любов и грижа, за да съхраним всички наши 
              прекрасни моменти заедно. Всяка снимка, всеки спомен тук е част от нашата 
              уникална история.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Независимо къде ни отведе животът, тези спомени ще останат завинаги с нас, 
              напомняйки ни за всички усмивки, смях и щастливи моменти, които споделихме.
            </p>
          </div>

          {/* Right side - About the creator */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">👨‍💻</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">От Иво</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Създадох този сайт специално за теб, за да имаме едно място, където да 
              съхраняваме всичките ни спомени. Всеки ред код е написан с мисъл за теб 
              и за нас.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Надявам се това място да ти донесе усмивка всеки път, когато го посетиш, 
              и да ни напомня колко специални са моментите, които споделяме заедно.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">📱</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Мобилно приложение</h4>
            <p className="text-gray-600 text-sm">Достъпно от всяко устройство, по всяко време</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">☁️</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Облачно съхранение</h4>
            <p className="text-gray-600 text-sm">Всички снимки са сигурно запазени в облака</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">🔒</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Сигурност</h4>
            <p className="text-gray-600 text-sm">Само ние имаме достъп до нашите спомени</p>
          </div>
        </div>

        {/* Love message */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 text-center text-white shadow-2xl">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-3xl font-bold mb-4">За теб, малката ми</h3>
          <p className="text-xl leading-relaxed max-w-2xl mx-auto">
            Всеки ден с теб е подарък. Всяка усмивка, всеки смях, всеки момент - 
            всичко това прави живота ми по-красив и пълноценен. Обичам те безкрайно много! 💕
          </p>
        </div>

        {/* Decorative hearts */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute text-rose-200 text-2xl animate-float opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${8 + Math.random() * 6}s`
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