import { useState, useRef } from "react";
import GalleryGrid from "./GalleryGrid";
import ImageUploadModal from "./ImageUploadModal";
import ErrorMessage from "./ErrorMessage";
import { resetFileInput, logFileInfo } from "../utils/fileUtils";
import { isSamsung, isSamsungInternet, hasCameraSupport } from "../utils/mobileUtils";

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
	const fileInputRef = useRef(null);

	const handleImageUpload = async (event) => {
		const file = event.target.files[0];
		
		// Samsung A23: Log file info for debugging
		const samsungDevice = isSamsung();
		const samsungBrowser = isSamsungInternet();
		
		if (samsungDevice || samsungBrowser) {
			console.log('Samsung A23: File input triggered');
			logFileInfo(file, 'Samsung A23 file selection:');
		}
		
		if (file) {
			// Validate file size (max 5MB, but more forgiving for Samsung A23)
			const maxSize = samsungDevice ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for Samsung, 5MB for others
			if (file.size > maxSize) {
				setError(`Файлът е твърде голям. Максималният размер е ${maxSize / (1024 * 1024)}MB.`);
				// Samsung A23: Reset input after error to prevent caching issues
				if (samsungDevice || samsungBrowser) {
					setTimeout(() => resetFileInput(fileInputRef.current), 100);
				}
				return;
			}

			// Validate file type (more permissive for Samsung camera photos)
			const validImageTypes = [
				'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
				'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff', 
				'image/tif', 'image/ico', 'image/heic', 'image/heif'
			];
			
			const isValidType = file.type.startsWith('image/') || 
				validImageTypes.includes(file.type) ||
				/\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif|ico|heic|heif)$/i.test(file.name) ||
				// Samsung A23: Camera photos sometimes have no type
				(samsungDevice && file.name && /camera|photo|img/i.test(file.name));
			
			if (!isValidType) {
				setError('Моля изберете валиден файл с изображение.');
				// Samsung A23: Reset input after error
				if (samsungDevice || samsungBrowser) {
					setTimeout(() => resetFileInput(fileInputRef.current), 100);
				}
				return;
			}

			// Additional mobile-specific validations
			if (file.size === 0) {
				setError('Файлът е празен или повреден.');
				// Samsung A23: Reset input after error
				if (samsungDevice || samsungBrowser) {
					setTimeout(() => resetFileInput(fileInputRef.current), 100);
				}
				return;
			}
			
			// Set default name from file name (without extension)
			const defaultName = file.name.replace(/\.[^/.]+$/, "");
			setNewImageName(defaultName);
			setPendingFile(file);
			setShowRenameModal(true);
		}
		// Samsung A23: Enhanced input reset for repeated uploads
		if (samsungDevice || samsungBrowser) {
			console.log('Samsung A23: Resetting file input for repeated uploads');
			// Delay reset to ensure file processing is complete
			setTimeout(() => {
				resetFileInput(event.target);
			}, 200);
		} else {
			// Standard reset for other devices
			event.target.value = '';
		}
	};

	const handleConfirmUpload = async () => {
		if (!pendingFile || !newImageName.trim()) {
			setError('Моля въведете име за снимката.');
			return;
		}

		const success = await onImageUpload(pendingFile, newImageName.trim());
		if (success) {
			setShowRenameModal(false);
			setPendingFile(null);
			setNewImageName("");
			
			// Samsung A23: Additional cleanup after successful upload
			const samsungDevice = isSamsung();
			const samsungBrowser = isSamsungInternet();
			if (samsungDevice || samsungBrowser) {
				console.log('Samsung A23: Cleaning up after successful upload');
				setTimeout(() => {
					if (fileInputRef.current) {
						resetFileInput(fileInputRef.current);
					}
				}, 300);
			}
		}
	};

	const handleCancelUpload = () => {
		setShowRenameModal(false);
		setPendingFile(null);
		setNewImageName("");
		setError(null);
		
		// Samsung A23: Additional cleanup when canceling upload
		const samsungDevice = isSamsung();
		const samsungBrowser = isSamsungInternet();
		if (samsungDevice || samsungBrowser) {
			console.log('Samsung A23: Cleaning up after cancel');
			setTimeout(() => {
				if (fileInputRef.current) {
					resetFileInput(fileInputRef.current);
				}
			}, 100);
		}
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
			
			{/* Hidden file input with Samsung A23 optimizations */}
			<input
				ref={fileInputRef}
				type="file"
				accept={isSamsung() || isSamsungInternet() ? 
					"image/*,image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp" : 
					"image/*,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.tiff,.tif,.ico,.heic,.heif"
				}
				capture={hasCameraSupport() ? "environment" : undefined}
				onChange={handleImageUpload}
				className="hidden"
				disabled={uploading}
				// Samsung A23: Additional attributes for better compatibility
				style={{ display: 'none' }}
				tabIndex={-1}
				aria-hidden="true"
			/>
			
			{/* Add Photo Button */}
			<div className="flex justify-center mb-8">
				<button
					onClick={handleAddPhotoClick}
					disabled={uploading}
					className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3 text-base sm:text-lg"
				>
					<span className="text-xl">📷</span>
					{uploading ? "Качване..." : "Добави снимка"}
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