import { useState, useRef } from "react";
import GalleryGrid from "./GalleryGrid";
import ImageUploadModal from "./ImageUploadModal";
import ErrorMessage from "./ErrorMessage";

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
		if (file) {
			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				setError('Файлът е твърде голям. Максималният размер е 5MB.');
				return;
			}

			// Validate file type
			const validImageTypes = [
				'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
				'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff', 
				'image/tif', 'image/ico', 'image/heic', 'image/heif'
			];
			
			const isValidType = file.type.startsWith('image/') || 
				validImageTypes.includes(file.type) ||
				/\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif|ico|heic|heif)$/i.test(file.name);
			
			if (!isValidType) {
				setError('Моля изберете валиден файл с изображение.');
				return;
			}

			// Additional mobile-specific validations
			if (file.size === 0) {
				setError('Файлът е празен или повреден.');
				return;
			}
			
			// Set default name from file name (without extension)
			const defaultName = file.name.replace(/\.[^/.]+$/, "");
			setNewImageName(defaultName);
			setPendingFile(file);
			setShowRenameModal(true);
		}
		// Reset the input so the same file can be selected again
		event.target.value = '';
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
		}
	};

	const handleCancelUpload = () => {
		setShowRenameModal(false);
		setPendingFile(null);
		setNewImageName("");
		setError(null);
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
			
			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.tiff,.tif,.ico,.heic,.heif"
				onChange={handleImageUpload}
				className="hidden"
				disabled={uploading}
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