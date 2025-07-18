import Image from "next/image";

export default function GameModal({ showModal, selectedImage, onClose }) {
	if (!showModal || !selectedImage) return null;

	return (
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
						sizes="(max-width: 640px) 192px, 224px"
						priority
					/>
				</div>
				<button
					className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
					onClick={onClose}
				>
					Затвори ✨
				</button>
			</div>
		</div>
	);
}