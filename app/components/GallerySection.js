import { useState, useRef, useCallback, useEffect } from "react";
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
	const previousFileRef = useRef(null);

	// Detect Samsung device/browser
	const isSamsungDevice = useCallback(() => {
		if (typeof window === 'undefined') return false;
		const userAgent = navigator.userAgent || '';
		return /samsung|samsungbrowser|sm-a235|galaxy a23/i.test(userAgent);
	}, []);

	// Enhanced file input reset specifically for Samsung A23
	const resetFileInput = useCallback((inputElement) => {
		if (!inputElement) return;

		try {
			const isAndroid = /android/i.test(navigator.userAgent);
			const isSamsung = isSamsungDevice();
			
			console.log('File input reset - Samsung:', isSamsung, 'Android:', isAndroid);

			if (isSamsung || isAndroid) {
				// Samsung A23/Android specific reset sequence
				console.log('Samsung A23: Enhanced file input reset');
				
				// Method 1: Multiple value resets
				inputElement.value = null;
				inputElement.value = '';
				
				// Method 2: Reset any form the input belongs to
				if (inputElement.form) {
					try {
						inputElement.form.reset();
					} catch (e) {
						console.warn('Samsung A23: Form reset failed:', e);
					}
				}
				
				// Method 3: Clone and replace the input element
				setTimeout(() => {
					try {
						const parent = inputElement.parentNode;
						if (parent && inputElement.files && inputElement.files.length > 0) {
							console.log('Samsung A23: Input still has files, cloning...');
							
							const newInput = inputElement.cloneNode(true);
							newInput.value = '';
							
							// Copy all attributes and event listeners
							Array.from(inputElement.attributes).forEach(attr => {
								newInput.setAttribute(attr.name, attr.value);
							});
							
							// Replace the old input
							parent.replaceChild(newInput, inputElement);
							
							// Update the ref to point to the new input
							if (fileInputRef.current === inputElement) {
								fileInputRef.current = newInput;
							}
						}
					} catch (e) {
						console.warn('Samsung A23: Input cloning failed:', e);
					}
				}, 100);
				
				// Method 4: Force blur/focus cycle (Samsung-specific)
				try {
					inputElement.blur();
					setTimeout(() => {
						if (inputElement.parentNode) {
							inputElement.focus();
							inputElement.blur();
						}
					}, 50);
				} catch (e) {
					console.warn('Samsung A23: Blur/focus cycle failed:', e);
				}
				
			} else {
				// Standard reset for other devices
				inputElement.value = '';
			}
		} catch (error) {
			console.warn('File input reset failed:', error);
			// Fallback
			try {
				inputElement.value = '';
			} catch (e) {
				console.warn('Fallback reset failed:', e);
			}
		}
	}, [isSamsungDevice]);

	const handleImageUpload = useCallback(async (event) => {
		const file = event.target.files[0];
		
		console.log('File selection triggered:', {
			hasFile: !!file,
			fileName: file?.name,
			fileSize: file?.size,
			fileType: file?.type,
			isJPG: file?.type === 'image/jpeg' || /\.jpe?g$/i.test(file?.name || ''),
			isSamsung: isSamsungDevice()
		});

		if (file) {
			// Check if this is the same file as before (Samsung A23 caching issue)
			const isSameFile = previousFileRef.current && 
				previousFileRef.current.name === file.name &&
				previousFileRef.current.size === file.size &&
				previousFileRef.current.lastModified === file.lastModified;
				
			if (isSameFile && isSamsungDevice()) {
				console.log('Samsung A23: Same file detected, forcing new file object');
				// For Samsung, we still allow the same file but ensure fresh processing
			}
			
			// Store reference for next comparison
			previousFileRef.current = file;

			// Validate file size (more generous for Samsung camera photos)
			const maxSize = isSamsungDevice() ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for Samsung, 5MB others
			if (file.size > maxSize) {
				setError(`Файлът е твърде голям. Максималният размер е ${maxSize / (1024 * 1024)}MB.`);
				resetFileInput(event.target);
				return;
			}

			// Enhanced file type validation (Samsung camera photos sometimes have unusual types)
			const validImageTypes = [
				'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
				'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff', 
				'image/tif', 'image/ico', 'image/heic', 'image/heif'
			];
			
			const isValidType = file.type.startsWith('image/') || 
				validImageTypes.includes(file.type) ||
				/\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif|ico|heic|heif)$/i.test(file.name) ||
				// Samsung A23: Camera photos sometimes have no type or unusual names
				(isSamsungDevice() && (file.type === '' || /camera|photo|img/i.test(file.name)));
			
			if (!isValidType) {
				setError('Моля изберете валиден файл с изображение.');
				resetFileInput(event.target);
				return;
			}

			// Additional mobile-specific validations
			if (file.size === 0) {
				setError('Файлът е празен или повреден.');
				resetFileInput(event.target);
				return;
			}
			
			// Set default name from file name (without extension)
			const defaultName = file.name.replace(/\.[^/.]+$/, "");
			setNewImageName(defaultName);
			setPendingFile(file);
			setShowRenameModal(true);
		}
		
		// Enhanced file input reset for repeated uploads
		setTimeout(() => {
			resetFileInput(event.target);
		}, isSamsungDevice() ? 300 : 100); // Longer delay for Samsung
		
	}, [isSamsungDevice, resetFileInput, setError]);

	const handleConfirmUpload = useCallback(async () => {
		if (!pendingFile || !newImageName.trim()) {
			setError('Моля въведете име за снимката.');
			return;
		}

		const success = await onImageUpload(pendingFile, newImageName.trim());
		if (success) {
			setShowRenameModal(false);
			setPendingFile(null);
			setNewImageName("");
			previousFileRef.current = null;
			
			// Additional cleanup for Samsung
			if (isSamsungDevice()) {
				setTimeout(() => {
					if (fileInputRef.current) {
						resetFileInput(fileInputRef.current);
					}
				}, 200);
			}
		}
	}, [pendingFile, newImageName, onImageUpload, setError, isSamsungDevice, resetFileInput]);

	const handleCancelUpload = useCallback(() => {
		setShowRenameModal(false);
		setPendingFile(null);
		setNewImageName("");
		setError(null);
		previousFileRef.current = null;
		
		// Samsung A23: Extra cleanup on cancel
		if (isSamsungDevice()) {
			setTimeout(() => {
				if (fileInputRef.current) {
					resetFileInput(fileInputRef.current);
				}
			}, 100);
		}
	}, [setError, isSamsungDevice, resetFileInput]);

	const handleAddPhotoClick = useCallback(() => {
		if (fileInputRef.current) {
			// Pre-reset for Samsung to ensure clean state
			if (isSamsungDevice()) {
				resetFileInput(fileInputRef.current);
				setTimeout(() => {
					fileInputRef.current?.click();
				}, 100);
			} else {
				fileInputRef.current.click();
			}
		}
	}, [isSamsungDevice, resetFileInput]);

	// Effect to handle Samsung A23 specific initialization
	useEffect(() => {
		if (isSamsungDevice()) {
			console.log('Samsung A23 device detected - optimizations enabled');
		}
	}, [isSamsungDevice]);

	return (
		<div className="w-full">
			<h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-center text-black mb-8 sm:mb-12">
				📸 Споделена галерия ❤️
			</h2>
			
			{/* Error Display */}
			<ErrorMessage error={error} onDismiss={() => setError(null)} />
			
			{/* Enhanced file input with Samsung A23 optimizations */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/jpg,image/png,image/webp,image/*"
				onChange={handleImageUpload}
				className="hidden"
				disabled={uploading}
				style={{ display: 'none' }}
				tabIndex={-1}
				aria-hidden="true"
				key={`file-input-${Date.now()}`} // Force remount for Samsung
			/>
			
			{/* Add Photo Button */}
			<div className="flex justify-center mb-8">
				<button
					onClick={handleAddPhotoClick}
					disabled={uploading}
					className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3 text-base sm:text-lg"
				>
					<span className="text-xl">📷</span>
					Добави снимка
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

			{/* Enhanced Upload Modal with Samsung A23 optimizations */}
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