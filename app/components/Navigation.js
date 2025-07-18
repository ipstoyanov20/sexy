export default function Navigation({ activeSection, setActiveSection, mobileMenuOpen, setMobileMenuOpen }) {
	const navigationItems = [
		{ id: "играй", label: "играй", icon: "🎮" },
		{ id: "галерия", label: "галерия", icon: "📸" },
		{ id: "гадина", label: "гадина", icon: "🐍" }
	];

	return (
		<nav className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-40 border-b border-pink-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16 sm:h-20">
					<div className="flex items-center">
						<span className="text-xl sm:text-2xl font-love text-pink-600">
							💕 МойApp
						</span>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex space-x-8">
						{navigationItems.map((item) => (
							<button
								key={item.id}
								onClick={() => setActiveSection(item.id)}
								className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 capitalize ${
									activeSection === item.id
										? "bg-pink-500 text-white shadow-lg"
										: "text-gray-700 hover:bg-pink-100 hover:text-pink-600"
								}`}
							>
								{item.icon} {item.label}
							</button>
						))}
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="text-gray-700 hover:text-pink-600 focus:outline-none"
						>
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div className="md:hidden bg-white border-t border-pink-200 py-4">
						{navigationItems.map((item) => (
							<button
								key={item.id}
								onClick={() => {
									setActiveSection(item.id);
									setMobileMenuOpen(false);
								}}
								className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 capitalize mb-2 ${
									activeSection === item.id
										? "bg-pink-500 text-white"
										: "text-gray-700 hover:bg-pink-100 hover:text-pink-600"
								}`}
							>
								{item.icon} {item.label}
							</button>
						))}
					</div>
				)}
			</div>
		</nav>
	);
}