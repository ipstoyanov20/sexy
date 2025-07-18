import { useState, useEffect, useRef } from "react";
import ErrorMessage from "./ErrorMessage";

export default function ImageUploadModal({
	showModal,
	pendingFile,
	newImageName,
	setNewImageName,
	onConfirm,
	onCancel,
	uploading,
	error
}) {
	if (!showModal) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
				<h2 className="text-lg sm:text-xl mb-4 font-semibold text-gray-800 text-center">
					📝 Преглед и име на снимката
				</h2>
				
				{/* Enhanced Preview of selected image */}
				{pendingFile && (
					<div className="w-full mb-4">
						<MobileImagePreview file={pendingFile} />
					</div>
				)}
				
				<div className="mb-6">
					<label htmlFor="imageName" className="block text-sm font-medium text-gray-700 mb-2">
						Въведете име за снимката:
					</label>
					<input
						id="imageName"
						type="text"
						value={newImageName}
						onChange={(e) => setNewImageName(e.target.value)}
						placeholder="Например: Красива снимка"
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors text-base"
						maxLength={100}
						autoFocus
					/>
					<p className="text-xs text-gray-500 mt-1">
						{newImageName.length}/100 символа
					</p>
				</div>
				
				<ErrorMessage error={error} />
				
				<div className="flex gap-3">
					<button
						onClick={onCancel}
						disabled={uploading}
						className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg font-semibold transition-all duration-300 text-base"
					>
						Отказ
					</button>
					<button
						onClick={onConfirm}
						disabled={uploading || !newImageName.trim()}
						className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-base"
					>
						{uploading ? "Качване..." : "Качи ✨"}
					</button>
				</div>
			</div>
		</div>
	);
}

// Enhanced mobile-optimized image preview component
function MobileImagePreview({ file }) {
	const [previewUrl, setPreviewUrl] = useState(null);
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(true);
	const [fallbackData, setFallbackData] = useState(null);
	const imgRef = useRef(null);
	
	useEffect(() => {
		if (!file) return;
		
		let objectUrl = null;
		let isCleanedUp = false;
		
		const createPreview = async () => {
			try {
				setLoading(true);
				setError(false);
				
				// Method 1: Try URL.createObjectURL first (fastest)
				try {
					objectUrl = URL.createObjectURL(file);
					
					// Test if the URL works by creating a temporary image
					const testImg = new Image();
					testImg.onload = () => {
						if (!isCleanedUp) {
							setPreviewUrl(objectUrl);
							setLoading(false);
						}
					};
					testImg.onerror = () => {
						// If object URL fails, try FileReader fallback
						console.log('Object URL failed, trying FileReader fallback');
						tryFileReaderFallback();
					};
					testImg.src = objectUrl;
					
					// Set timeout for object URL method
					setTimeout(() => {
						if (loading && !isCleanedUp) {
							console.log('Object URL timeout, trying FileReader fallback');
							tryFileReaderFallback();
						}
					}, 3000);
					
				} catch (urlError) {
					console.error('URL.createObjectURL failed:', urlError);
					tryFileReaderFallback();
				}
				
				// Method 2: FileReader fallback (more reliable for camera photos)
				function tryFileReaderFallback() {
					if (isCleanedUp) return;
					
					const reader = new FileReader();
					reader.onload = (e) => {
						if (!isCleanedUp) {
							setFallbackData(e.target.result);
							setPreviewUrl(e.target.result);
							setLoading(false);
						}
					};
					reader.onerror = (e) => {
						console.error('FileReader failed:', e);
						if (!isCleanedUp) {
							setError(true);
							setLoading(false);
						}
					};
					
					try {
						reader.readAsDataURL(file);
					} catch (readerError) {
						console.error('FileReader readAsDataURL failed:', readerError);
						if (!isCleanedUp) {
							setError(true);
							setLoading(false);
						}
					}
				}
				
			} catch (error) {
				console.error('Preview creation failed:', error);
				if (!isCleanedUp) {
					setError(true);
					setLoading(false);
				}
			}
		};
		
		createPreview();
		
		// Cleanup function
		return () => {
			isCleanedUp = true;
			if (objectUrl) {
				try {
					URL.revokeObjectURL(objectUrl);
				} catch (e) {
					console.warn('Failed to revoke object URL:', e);
				}
			}
		};
	}, [file]);
	
	// Loading state
	if (loading) {
		return (
			<div className="w-full aspect-square max-h-64 bg-gray-100 rounded-xl flex items-center justify-center">
				<div className="flex flex-col items-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-2"></div>
					<p className="text-sm text-gray-600">Зареждане на преглед...</p>
				</div>
			</div>
		);
	}
	
	// Error state
	if (error || !previewUrl) {
		return (
			<div className="w-full aspect-square max-h-64 bg-gray-100 rounded-xl flex items-center justify-center">
				<div className="flex flex-col items-center text-center p-4">
					<div className="text-4xl mb-2">📷</div>
					<p className="text-sm text-gray-600 mb-2">
						Прегледът не може да се зареди
					</p>
					<p className="text-xs text-gray-500">
						Файл: {file?.name || 'Неизвестен'}
						<br />
						Размер: {file?.size ? Math.round(file.size / 1024) + ' KB' : 'Неизвестен'}
					</p>
				</div>
			</div>
		);
	}
	
	// Success state with image preview
	return (
		<div className="w-full">
			<div className="aspect-square max-h-64 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
				<img
					ref={imgRef}
					src={previewUrl}
					alt="Preview"
					className="w-full h-full object-cover"
					onLoad={() => {
						console.log('Preview image loaded successfully');
					}}
					onError={(e) => {
						console.error('Preview image failed to load:', e);
						setError(true);
					}}
					style={{
						imageRendering: 'auto',
						backfaceVisibility: 'hidden',
						transform: 'translateZ(0)', // Force hardware acceleration
					}}
				/>
			</div>
			
			{/* Image info */}
			<div className="mt-2 text-xs text-gray-500 text-center">
				<p>📁 {file?.name || 'Неизвестен файл'}</p>
				<p>📏 {file?.size ? Math.round(file.size / 1024) + ' KB' : 'Неизвестен размер'}</p>
				{file?.type && <p>🎨 {file.type}</p>}
			</div>
		</div>
	);
}