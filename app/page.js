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
		// start spinning and blur
		setIsSpinning(true);
		setShowBlur(true);

		// after spin duration
		setTimeout(() => {
			// stop spinning
			setIsSpinning(false);

			// after additional delay before unblur
			setTimeout(() => {
				// unblur
				setShowBlur(false);

				// after blur transition, open modal
				setTimeout(() => {
					setShowModal(true);
					setProcessing(false);
				}, 500);
			}, 2000);
		}, 3000);
	}

	return (
		<>
			<h1 className="font-bold text-4xl mt-5 text-center pl-4 text-black">
				МИЛО МОЕ, завърти ❤️
				<br />и до мен се отпусни ❤️
			</h1>
			<div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-10 sm:p-20 font-[family-name:var(--font-geist-sans)]">
				<main className="flex flex-col gap-[3px] -translate-y-36 row-start-2 items-center z-20">
					<div
						className={`relative scale-[80%] -translate-x-2.5 w-72 h-72 rounded-full border-4 border-[#ff8fab] flex items-center justify-center transition-filter duration-500 ${
							isSpinning ? "animate-spin-slow" : ""
						} ${showBlur ? "filter blur-md" : "filter blur-0"}`}
					>
						{shuffledImages.map((src, index) => {
							const startAngle = 90;
							const angle = startAngle + (360 / shuffledImages.length) * index;
							const radius = 100;
							const x = radius * Math.cos((angle * Math.PI) / 180);
							const y = radius * Math.sin((angle * Math.PI) / 180);
							return (
								<div
									key={index}
									className="absolute w-12 h-12"
									style={{ transform: `translate(${x}px, ${y}px)` }}
								>
									<Image
										src={src}
										alt={`pose-${index}`}
										width={100}
										height={100}
										className="rounded-xl"
									/>
								</div>
							);
						})}
					</div>

					<button
						className="mt-6 text-black font-love rounded-2xl px-10 py-3 bg-[#ffb3c6] border-2 border-[#ff8fab] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={toggleSpin}
						disabled={processing}
					>
						SPIN
					</button>
				</main>

				{/* Modal */}
				{showModal && selectedImage && (
					<div className="fixed inset-0 z-30 flex items-center justify-center bg-[#ffe5ec] bg-opacity-50">
						<div className="bg-white scale-75 rounded-2xl p-8 flex flex-col items-center">
							<h2 className="text-2xl mb-4 font-love text-black">
								🎉 Congratulations! 🎉
							</h2>
							<Image
								src={selectedImage}
								alt="Selected Pose"
								width={200}
								height={200}
								className="rounded-xl"
							/>
							<button
								className="mt-6 px-6 py-2 bg-[#ff8fab] text-white rounded-2xl"
								onClick={() => setShowModal(false)}
							>
								Close
							</button>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
