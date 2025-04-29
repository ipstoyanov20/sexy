"use client";
import Image from "next/image";
import { useState } from "react";
// import { Button } from "@/components/ui/button";
export default function Home() {
	const [isSpinning, setIsSpinning] = useState(false);

	const images = [
		"file.svg",
		"file.svg",
		"file.svg",
		"file.svg",
		// Add more image paths
	];

	const toggleSpin = () => {
		setIsSpinning(!isSpinning);
	};

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
					<div
						className={`relative scale-[80%] -translate-x-2.5 w-72 h-72 rounded-full border-4 border-pink-400 flex items-center justify-center transition-transform duration-1000 ${
							isSpinning ? "animate-spin-slow" : ""
						}`}
					>
						{images.map((src, index) => {
							const angle = (360 / images.length) * index;
							const radius = 100;
							const x = radius * Math.cos((angle * Math.PI) / 180);
							const y = radius * Math.sin((angle * Math.PI) / 180);
							return (
								<div
									key={index}
									className="absolute w-12 h-12"
									style={{
										transform: `translate(${x}px, ${y}px)`,
									}}
								>
									<Image
										src={src}
										alt={`pose-${index}`}
										width={48}
										height={48}
										className="rounded-full"
									/>
								</div>
							);
						})}
					</div>

					<button className="mt-6" onClick={toggleSpin}>
						{isSpinning ? "Stop" : "Spin"}
					</button>
			</main>
		</div>
	);
}
