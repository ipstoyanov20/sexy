"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function Home() {
		const [isSpinning, setIsSpinning] = useState(false);
		const [showBlur, setShowBlur] = useState(true);
		const [shuffledImages, setShuffledImages] = useState([]);
		const [showModal, setShowModal] = useState(false);
		const [selectedImage, setSelectedImage] = useState(null);
		const [processing, setProcessing] = useState(false);
		const [activeSection, setActiveSection] = useState("играй");
		const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
		const audioRef = useRef(null);

		const images = [
				"/kamasutra.png",
				"/chair.webp",
				"/doggy.png",
				"/lizane.webp",
				"/mis.png",
				"/doggy2.png",
		];

		const galleryImages = [
				{ src: "/kamasutra.png", date: "2024-01-15", title: "Класическа поза" },
				{ src: "/chair.webp", date: "2024-01-20", title: "Стол варианция" },
				{ src: "/doggy.png", date: "2024-02-01", title: "Догги стил" },
				{ src: "/lizane.webp", date: "2024-02-10", title: "Интимна близост" },
				{ src: "/mis.png", date: "2024-02-15", title: "Мисионерска" },
				{ src: "/doggy2.png", date: "2024-03-01", title: "Алтернативен догги" }
		];

		// Fisher-Yates Shuffle
		function shuffleArray(arr) {
				const shuffled = [...arr];
				for (let i = shuffled.length - 1; i > 0; i--) {
						const j = Math.floor(Math.random() * (i + 1));
						[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
				}
				return shuffled;
		}

		// Initial shuffle + blur on refresh
		useEffect(() => {
				setShuffledImages(shuffleArray(images));
				const timer = setTimeout(() => setShowBlur(false), 500);
				return () => clearTimeout(timer);
		}, []);

		// Setup modal sound
		useEffect(() => {
				audioRef.current = new Audio("/win.wav");
				audioRef.current.preload = "auto";
		}, []);

		// Play sound when modal opens
		useEffect(() => {
				if (showModal && audioRef.current) {
						audioRef.current.play();
				}
		}, [showModal]);

		function toggleSpin() {
				if (processing) return;
				setProcessing(true);

				const randomIndex = Math.floor(Math.random() * shuffledImages.length);
				const chosen = shuffledImages[randomIndex];
				const newOrder = [...shuffledImages];
				[newOrder[0], newOrder[randomIndex]] = [
						shuffledImages[randomIndex],
						shuffledImages[0],
				];

				setSelectedImage(chosen);
				setShuffledImages(newOrder);
				setIsSpinning(true);
				setShowBlur(true);

				setTimeout(() => {
						setIsSpinning(false);
						setTimeout(() => {
								setShowBlur(false);
								setTimeout(() => {
										setShowModal(true);
										setProcessing(false);
								}, 500);
						}, 2000);
				}, 3000);
		}

		const handleImageUpload = (event) => {
				const file = event.target.files[0];
				if (file) {
						const date = new Date().toISOString().split('T')[0]; // Using current date
						const reader = new FileReader();

						reader.onloadend = () => {
								setGalleryImages((prevImages) => [
										...prevImages,
										{ src: reader.result, date, title: file.name }
								]);
						};

						reader.readAsDataURL(file);
				}
		};

		const renderGameSection = () => (
				<div className="w-full max-w-4xl mx-auto px-3 sm:px-4">
						<h1 className="font-bold text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-3 sm:mt-5 text-center text-black mb-6 sm:mb-8 md:mb-12 leading-tight">
								За малката ❤️
								<br />завърти и се отпусни ❤️
						</h1>
						<div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
								<div className="relative mb-6 sm:mb-8 md:mb-12">
										<div
												className={`relative w-56 h-56 xs:w-64 xs:h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full border-3 xs:border-4 sm:border-6 md:border-8 border-gradient-to-r from-pink-400 via-purple-500 to-pink-600 flex items-center justify-center transition-all duration-500 shadow-2xl ${
														isSpinning ? "animate-spin-beautiful" : ""
												} ${showBlur ? "filter blur-md" : "filter blur-0"} touch-none select-none`}
												style={{
														background: "linear-gradient(45deg, #ff8fab, #ffb3c6, #ff8fab)",
														boxShadow: "0 0 30px rgba(255, 139, 171, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2)"
												}}
										>
												<div className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-50 to-pink-100 shadow-inner"></div>
												{shuffledImages.map((src, index) => {
														const startAngle = 90;
														const angle = startAngle + (360 / shuffledImages.length) * index;
														const radius = window.innerWidth < 360 ? 85 : window.innerWidth < 480 ? 95 : window.innerWidth < 640 ? 105 : window.innerWidth < 768 ? 115 : window.innerWidth < 1024 ? 125 : 140;
														const x = radius * Math.cos((angle * Math.PI) / 180);
														const y = radius * Math.sin((angle * Math.PI) / 180);
														return (
																<div
																		key={index}
																		className="absolute w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full overflow-hidden shadow-lg active:scale-95 sm:hover:scale-110 transition-transform duration-200 touch-manipulation"
																		style={{
																				transform: `translate(${x}px, ${y}px)`,
																				border: "2px solid white",
																				boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
																		}}
																>
																		<Image
																				src={src}
																				alt={`pose-${index}`}
																				width={100}
																				height={100}
																				className="w-full h-full object-cover pointer-events-none"
																		/>
																</div>
														);
												})}
												<div className="absolute inset-0 rounded-full animate-pulse-slow bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
										</div>

										<div className="flex justify-center mt-6 sm:mt-8">
												<button
														className="text-white font-love rounded-full px-6 py-3 xs:px-8 xs:py-4 sm:px-12 sm:py-5 md:px-16 md:py-6 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 active:from-rose-600 active:via-pink-600 active:to-fuchsia-600 sm:hover:from-rose-600 sm:hover:via-pink-600 sm:hover:to-fuchsia-600 border-2 sm:border-3 border-white shadow-2xl active:shadow-pink-500/50 sm:hover:shadow-pink-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-105 sm:hover:scale-110 active:translate-y-1 sm:hover:-translate-y-2 text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-wider animate-pulse touch-manipulation min-h-[48px] min-w-[120px] flex items-center justify-center"
														onClick={toggleSpin}
														disabled={processing}
														style={{
																boxShadow: "0 8px 25px rgba(236, 72, 153, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
														}}
												>
														{processing ? "💫 ВЪРТЕНЕ..." : "✨ SPIN ✨"}
												</button>
										</div>
								</div>
						</div>
				</div>
		);

		const renderGallerySection = () => (
				<div className="w-full max-w-6xl mx-auto px-4">
						<h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-center text-black mb-8 sm:mb-12">
								📸 Галерия с дати ❤️
						</h2>
						<input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4"/>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
								{galleryImages.map((item, index) => (
										<div key={index} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
												<div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-pink-100 to-purple-100">
														<Image
																src={item.src}
																alt={item.title}
																width={300}
																height={300}
																className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
														/>
												</div>
												<h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{item.title}</h3>
												<p className="text-gray-600 text-xs sm:text-sm">📅 {item.date}</p>
										</div>
								))}
						</div>
				</div>
		);

		const renderSnakeSection = () => (
				<div className="w-full max-w-4xl mx-auto px-4 text-center">
						<h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-8 sm:mb-12">
								🐍 Гадина секция 🐍
						</h2>
						<div className="bg-white rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl">
								<div className="text-4xl sm:text-6xl md:text-8xl mb-6 animate-bounce">🐍</div>
								<p className="text-gray-700 text-base sm:text-lg md:text-xl mb-6">
										Тази секция е за специални моменти... 😈
								</p>
								<button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
										Открий гадината 🐍
								</button>
						</div>
				</div>
		);

		return (
				<div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
						{/* Navigation */}
						<nav className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-40 border-b border-pink-200">
								<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
										<div className="flex justify-between items-center h-16 sm:h-20">
												<div className="flex items-center">
														<span className="text-xl sm:text-2xl font-love text-pink-600">💕 МойApp</span>
												</div>

												{/* Desktop Navigation */}
												<div className="hidden md:flex space-x-8">
														{["играй", "галерия", "гадина"].map((section) => (
																<button
																		key={section}
																		onClick={() => setActiveSection(section)}
																		className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 capitalize ${
																				activeSection === section
																						? "bg-pink-500 text-white shadow-lg"
																						: "text-gray-700 hover:bg-pink-100 hover:text-pink-600"
																		}`}
																>
																		{section === "играй" && "🎮"} {section === "галерия" && "📸"} {section === "гадина" && "🐍"} {section}
																</button>
														))}
												</div>

												{/* Mobile menu button */}
												<div className="md:hidden">
														<button
																onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
																className="text-gray-700 hover:text-pink-600 focus:outline-none"
														>
																<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
																</svg>
														</button>
												</div>
										</div>

										{/* Mobile Navigation */}
										{mobileMenuOpen && (
												<div className="md:hidden bg-white border-t border-pink-200 py-4">
														{["играй", "галерия", "гадина"].map((section) => (
																<button
																		key={section}
																		onClick={() => {
																				setActiveSection(section);
																				setMobileMenuOpen(false);
																		}}
																		className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 capitalize mb-2 ${
																				activeSection === section
																						? "bg-pink-500 text-white"
																						: "text-gray-700 hover:bg-pink-100 hover:text-pink-600"
																		}`}
																>
																		{section === "играй" && "🎮"} {section === "галерия" && "📸"} {section === "гадина" && "🐍"} {section}
																</button>
														))}
												</div>
										)}
								</div>
						</nav>

						{/* Main Content */}
						<main className="py-8 sm:py-12 md:py-16 lg:py-20">
								{activeSection === "играй" && renderGameSection()}
								{activeSection === "галерия" && renderGallerySection()}
								{activeSection === "гадина" && renderSnakeSection()}
						</main>

						{/* Modal */}
						{showModal && selectedImage && (
								<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
										<div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center max-w-sm sm:max-w-md w-full mx-4 shadow-2xl">
												<h2 className="text-xl sm:text-2xl mb-4 font-love text-pink-600 animate-bounce">
														🎉 Поздравления! 🎉
												</h2>
												<div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden mb-6 shadow-lg">
														<Image
																src={selectedImage}
																alt="Selected Pose"
																width={300}
																height={300}
																className="w-full h-full object-cover"
														/>
												</div>
												<button
														className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
														onClick={() => setShowModal(false)}
												>
														Затвори ✨
												</button>
										</div>
								</div>
						)}
				</div>
		);
}