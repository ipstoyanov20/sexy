export default function SnakeSection() {
	return (
		<div className="w-full max-w-4xl mx-auto px-4 text-center">
			<h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-8 sm:mb-12">
				🐍 Гадина секция 🐍
			</h2>
			<div className="bg-white rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl">
				<div className="text-4xl sm:text-6xl md:text-8xl mb-6 animate-bounce">
					🐍
				</div>
				<p className="text-gray-700 text-base sm:text-lg md:text-xl mb-6">
					Тази секция е за специални моменти... 😈
				</p>
				<button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
					Открий гадината 🐍
				</button>
			</div>
		</div>
	);
}