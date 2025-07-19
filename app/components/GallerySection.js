import { useState, useRef, useEffect } from "react";
import GalleryGrid from "./GalleryGrid";
import ImageUploadModal from "./ImageUploadModal";
import ErrorMessage from "./ErrorMessage";
import { getMobileFileAccept, supportsCameraCapture, isMobile } from "../utils/mobileUtils";

export default function GallerySection({ 
	galleryImages, 
	loading, 
	error, 
	setError, 
	onImageUpload, 
	onDeleteImage, 
	uploading 
}) {
	const [showRenameModal, setShowRenameModal] = useState(false);
	const [pendingFile, setPendingFile] = useState(null);
	const [newImageName, setNewImageName] = useState("");
	const [cameraSupported, setCameraSupported] = useState(false);
	const [mobileDevice, setMobileDevice] = useState(false);
	const fileInputRef = useRef(null);
	
	// Check for mobile and camera support
	useEffect(() => {
		setMobileDevice(isMobile());
		setCameraSupported(supportsCameraCapture());
	}, []);

	const handleImageUpload = async (event) => {
		// Always reset the input first to ensure clean state
		const input = event.target;
		const file = input.files?.[0];
		
		// Clear any previous state
		setError(null);
		setPendingFile(null);
		setNewImageName("");
		
		if (!file) {
			// Reset the input value
			input.value = '';
			return;
		}
		
		try {
			// Validate file size (max 10MB - more lenient)
			if (file.size > 10 * 1024 * 1024) {
				setError('Файлът е твърде голям. Максималният размер е 10MB.');
				input.value = ''; // Reset input
				return;
			}

			// Additional mobile-specific validations
			if (file.size === 0) {
				setError('Файлът е празен или повреден.');
				input.value = ''; // Reset input
				return;
			}

			// More lenient file type validation
			const validImageTypes = [
				'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
				'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff', 
				'image/tif', 'image/ico', 'image/heic', 'image/heif'
			];
			
			const fileExtension = file.name.toLowerCase().split('.').pop();
			const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif', 'ico', 'heic', 'heif'];
			
			// Be more lenient - accept if MIME type starts with image/ OR has valid extension
			const isValidType = file.type.startsWith('image/') || 
				validImageTypes.includes(file.type) ||
				validExtensions.includes(fileExtension) ||
				file.type === ''; // Accept files without MIME type if they have valid extension
			
			if (!isValidType) {
				setError('Моля изберете валиден файл с изображение (JPG, PNG, GIF, WebP, BMP).');
				input.value = ''; // Reset input
				return;
			}
			
			// Log file details for debugging
			console.log('File selected:', {
				name: file.name,
				size: file.size,
				type: file.type,
				lastModified: file.lastModified,
				timestamp: Date.now()
			});
			
			// Set default name from file name (without extension)
			const defaultName = file.name.replace(/\.[^/.]+$/, "");
			setNewImageName(defaultName);
			setPendingFile(file);
			setShowRenameModal(true);
			
		} catch (error) {
			console.error('Error handling file upload:', error);
			setError('Грешка при обработка на файла. Моля опитайте отново.');
		} finally {
			// Always reset the input value to allow selecting the same file again
			// Use setTimeout to ensure it happens after the file is processed
			setTimeout(() => {
				if (input) {
					input.value = '';
				}
			}, 100);
		}
	};

	const handleConfirmUpload = async () => {
		if (!pendingFile || !newImageName.trim()) {
			setError('Моля въведете име за снимката.');
			return;
		}

		const success = await onImageUpload(pendingFile, newImageName.trim());
		if (success) {
			// Clean up modal state completely on success
			setShowRenameModal(false);
			setPendingFile(null);
			setNewImageName("");
			setError(null);
			
			// Additional cleanup for mobile
			setTimeout(() => {
				console.log('Upload successful, modal cleaned up');
			}, 100);
		}
	};

	const handleCancelUpload = () => {
		// Clean up modal state completely
		setShowRenameModal(false);
		setPendingFile(null);
		setNewImageName("");
		setError(null);
		
		// Force cleanup of any remaining object URLs
		setTimeout(() => {
			// Additional cleanup if needed
			console.log('Modal cancelled and cleaned up');
		}, 100);
	};

	const handleAddPhotoClick = () => {
		if (uploading) return;
		setError(null);
		fileInputRef.current?.click();
	};

	return (
		<div className="w-full max-w-6xl mx-auto px-4">
			<h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-center text-black mb-8 sm:mb-12">
				📸 Споделена галерия ❤️
			</h2>
			
			{/* Error Display */}
			<ErrorMessage error={error} onDismiss={() => setError(null)} />
			
			{/* Hidden file input - enhanced for mobile camera support */}
			<input
				ref={fileInputRef}
				type="file"
				accept={getMobileFileAccept()}
				capture="environment"
				onChange={handleImageUpload}
				className="hidden"
				disabled={uploading}
			/>
			
			{/* Add Photo Buttons */}
			<div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
				{/* Camera Button - only show if camera is supported */}
				{cameraSupported && (
					<button
						onClick={() => {
							if (uploading) return;
							setError(null);
							// Set capture attribute for camera
							if (fileInputRef.current) {
								fileInputRef.current.setAttribute('capture', 'environment');
								fileInputRef.current.click();
							}
						}}
						disabled={uploading}
						className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3 text-base sm:text-lg"
					>
						<span className="text-xl">📸</span>
						{uploading ? "Качване..." : "Снимай"}
						<span className="text-xl">✨</span>
					</button>
				)}
				
				{/* Gallery Button */}
				<button
					onClick={() => {
						if (uploading) return;
						setError(null);
						// Remove capture attribute for gallery
						if (fileInputRef.current) {
							fileInputRef.current.removeAttribute('capture');
							fileInputRef.current.click();
						}
					}}
					disabled={uploading}
					className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3 text-base sm:text-lg"
				>
					<span className="text-xl">🖼️</span>
					{uploading ? "Качване..." : cameraSupported ? "Галерия" : "Избери снимка"}
					<span className="text-xl">✨</span>
				</button>
			</div>

			{/* Gallery Content */}
			<GalleryGrid 
				images={galleryImages} 
				loading={loading} 
				onDeleteImage={onDeleteImage}
				onAddPhotoClick={handleAddPhotoClick}
				uploading={uploading}
			/>

			{/* Upload Modal */}
			<ImageUploadModal
				showModal={showRenameModal}
				pendingFile={pendingFile}
				newImageName={newImageName}
				setNewImageName={setNewImageName}
				onConfirm={handleConfirmUpload}
				onCancel={handleCancelUpload}
				uploading={uploading}
				error={error}
			/>
		</div>
	);
}