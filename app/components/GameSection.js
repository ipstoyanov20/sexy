import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import GameModal from "./GameModal";

export default function GameSection() {
	const [isSpinning, setIsSpinning] = useState(false);
	const [showBlur, setShowBlur] = useState(true);
	const [shuffledImages, setShuffledImages] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [processing, setProcessing] = useState(false);
	const audioRef = useRef(null);

	const images = [
		"/kamasutra.png",
		"/chair.webp",
		"/doggy.png",
		"/lizane.webp",
		"/mis.png",
		"/doggy2.png",
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

	const getRadius = () => {
		if (typeof window === 'undefined') return 140;
		
		if (window.innerWidth < 360) return 85;
		if (window.innerWidth < 480) return 95;
		if (window.innerWidth < 640) return 105;
		if (window.innerWidth < 768) return 115;
		if (window.innerWidth < 1024) return 125;
		return 140;
	};

	return (
		<div className="w-full max-w-4xl mx-auto px-3 sm:px-4">
			<h1 className="font-bold text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-3 sm:mt-5 text-center text-black mb-6 sm:mb-8 md:mb-12 leading-tight">
				За малката ❤️
				<br />
				завърти и се отпусни ❤️
			</h1>
			<div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
				<div className="relative mb-6 sm:mb-8 md:mb-12">
					<div
						className={`relative w-56 h-56 xs:w-64 xs:h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full border-3 xs:border-4 sm:border-6 md:border-8 border-gradient-to-r from-pink-400 via-purple-500 to-pink-600 flex items-center justify-center transition-all duration-500 shadow-2xl ${
							isSpinning ? "animate-spin-beautiful" : ""
						} ${showBlur ? "filter blur-md" : "filter blur-0"} touch-none select-none`}
						style={{
							background: "linear-gradient(45deg, #ff8fab, #ffb3c6, #ff8fab)",
							boxShadow:
								"0 0 30px rgba(255, 139, 171, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2)",
						}}
					>
						<div className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-50 to-pink-100 shadow-inner"></div>
						{shuffledImages.map((src, index) => {
							const startAngle = 90;
							const angle = startAngle + (360 / shuffledImages.length) * index;
							const radius = getRadius();
							const x = radius * Math.cos((angle * Math.PI) / 180);
							const y = radius * Math.sin((angle * Math.PI) / 180);
							return (
								<div
									key={index}
									className="absolute w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full overflow-hidden shadow-lg active:scale-95 sm:hover:scale-110 transition-transform duration-200 touch-manipulation"
									style={{
										transform: `translate(${x}px, ${y}px)`,
										border: "2px solid white",
										boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
									}}
								>
									<Image
										src={src}
										alt={`pose-${index}`}
										width={80}
										height={80}
										className="w-full h-full object-cover pointer-events-none"
										sizes="(max-width: 360px) 40px, (max-width: 480px) 48px, (max-width: 640px) 56px, (max-width: 768px) 64px, (max-width: 1024px) 72px, 80px"
										priority={index < 3}
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
								boxShadow:
									"0 8px 25px rgba(236, 72, 153, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
							}}
						>
							{processing ? "💫 ВЪРТЕНЕ..." : "✨ SPIN ✨"}
						</button>
					</div>
				</div>
			</div>

			{/* Game Result Modal */}
			<GameModal 
				showModal={showModal} 
				selectedImage={selectedImage} 
				onClose={() => setShowModal(false)} 
			/>
		</div>
	);
}