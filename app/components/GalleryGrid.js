import Image from "next/image";
import LoadingSpinner from "./LoadingSpinner";

export default function GalleryGrid({ images, loading, onDeleteImage, onAddPhotoClick, uploading }) {
	if (loading) {
		return <LoadingSpinner message="Зареждане на галерията..." />;
	}

	if (images.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 sm:py-24">
				<div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md w-full mx-4 text-center">
					<div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center">
						<div className="text-6xl sm:text-7xl animate-pulse">📷</div>
					</div>
					<h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
						Празна галерия
					</h3>
					<p className="text-gray-600 text-base sm:text-lg mb-6 leading-relaxed">
						Все още няма снимки в споделената галерия. Добави първата снимка, която всички ще могат да видят! ✨
					</p>
					<button
						onClick={onAddPhotoClick}
						disabled={uploading}
						className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
					>
						{uploading ? "Качване..." : "Добави първата снимка 🎉"}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
			{images.map((item) => (
				<div
					key={item.id}
					className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative group"
				>
					{/* Delete button */}
					<button
						onClick={() => onDeleteImage(item.id)}
						className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-sm font-bold"
						title="Изтрий снимката"
					>
						×
					</button>
					
					<div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-pink-100 to-purple-100 relative">
						<Image
							src={item.src}
							alt={item.title}
							fill
							className="object-cover hover:scale-110 transition-transform duration-300"
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
							onError={(e) => {
								console.error('Gallery image failed to load:', item.id, item.src);
								e.target.style.display = 'none';
								e.target.nextSibling?.style.setProperty('display', 'flex');
							}}
						/>
						<div className="absolute inset-0 hidden items-center justify-center text-gray-400 text-4xl bg-gray-100">
							📷
						</div>
					</div>
					
					<h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base line-clamp-2">
						{item.title}
					</h3>
					
					<div className="space-y-1">
						<p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1">
							<span>📅</span> {item.date}
						</p>
						{item.time && (
							<p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1">
								<span>🕐</span> {item.time}
							</p>
						)}
						{item.uploadedAt && (
							<p className="text-gray-500 text-xs flex items-center gap-1">
								<span>⬆️</span> {item.uploadedAt}
							</p>
						)}
					</div>
				</div>
			))}
		</div>
	);
}