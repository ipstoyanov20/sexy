import { useState, useEffect, useRef, useCallback } from "react";
import ErrorMessage from "./ErrorMessage";
import { generateFileKey, logFileInfo } from "../utils/fileUtils";

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
						<MobileImagePreview 
							file={pendingFile} 
							key={generateFileKey(pendingFile)}
						/>
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

// Enhanced mobile-optimized image preview component with reliable repeated upload handling
function MobileImagePreview({ file }) {
	const [previewState, setPreviewState] = useState({
		url: null,
		loading: true,
		error: false,
		imageLoaded: false
	});
	
	const imgRef = useRef(null);
	const objectUrlRef = useRef(null);
	const fileReaderRef = useRef(null);
	const cleanupRef = useRef(false);
	const retryCountRef = useRef(0);
	
	// Reset state when file changes
	const resetState = useCallback(() => {
		setPreviewState({
			url: null,
			loading: true,
			error: false,
			imageLoaded: false
		});
		retryCountRef.current = 0;
		cleanupRef.current = false;
	}, []);
	
	// Cleanup function
	const cleanup = useCallback(() => {
		cleanupRef.current = true;
		
		// Cleanup object URL
		if (objectUrlRef.current) {
			try {
				URL.revokeObjectURL(objectUrlRef.current);
			} catch (e) {
				console.warn('Failed to revoke object URL:', e);
			}
			objectUrlRef.current = null;
		}
		
		// Cleanup FileReader
		if (fileReaderRef.current) {
			try {
				fileReaderRef.current.abort();
			} catch (e) {
				console.warn('Failed to abort FileReader:', e);
			}
			fileReaderRef.current = null;
		}
	}, []);
	
	// Create preview with improved error handling and retry logic
	const createPreview = useCallback(async () => {
		if (!file || cleanupRef.current) return;
		
		resetState();
		
		logFileInfo(file, 'Creating preview for:');
		
		// Method 1: Try FileReader first (more reliable for mobile)
		const tryFileReader = () => {
			if (cleanupRef.current) return;
			
			console.log('Trying FileReader method...');
			
			const reader = new FileReader();
			fileReaderRef.current = reader;
			
			reader.onload = (e) => {
				if (cleanupRef.current || !e.target?.result) return;
				
				console.log('FileReader loaded successfully');
				setPreviewState(prev => ({
					...prev,
					url: e.target.result,
					loading: false,
					error: false
				}));
			};
			
			reader.onerror = (e) => {
				if (cleanupRef.current) return;
				
				console.error('FileReader failed:', e);
				tryObjectURL(); // Fallback to Object URL
			};
			
			reader.onabort = () => {
				if (cleanupRef.current) return;
				console.log('FileReader aborted');
			};
			
			try {
				reader.readAsDataURL(file);
			} catch (readerError) {
				console.error('FileReader readAsDataURL failed:', readerError);
				if (!cleanupRef.current) {
					tryObjectURL(); // Fallback to Object URL
				}
			}
		};
		
		// Method 2: Object URL fallback
		const tryObjectURL = () => {
			if (cleanupRef.current) return;
			
			console.log('Trying Object URL method...');
			
			try {
				// Clean up any existing object URL first
				if (objectUrlRef.current) {
					URL.revokeObjectURL(objectUrlRef.current);
					objectUrlRef.current = null;
				}
				
				const objectUrl = URL.createObjectURL(file);
				objectUrlRef.current = objectUrl;
				
				// Test the URL with a temporary image
				const testImg = new Image();
				
				testImg.onload = () => {
					if (cleanupRef.current) return;
					
					console.log('Object URL loaded successfully');
					setPreviewState(prev => ({
						...prev,
						url: objectUrl,
						loading: false,
						error: false
					}));
				};
				
				testImg.onerror = () => {
					if (cleanupRef.current) return;
					
					console.error('Object URL test failed');
					handleError();
				};
				
				// Add timeout for object URL test
				setTimeout(() => {
					if (cleanupRef.current) return;
					
					if (previewState.loading && retryCountRef.current < 2) {
						console.log('Object URL timeout, retrying...');
						retryCountRef.current++;
						createPreview();
					} else if (previewState.loading) {
						console.error('Object URL timeout, giving up');
						handleError();
					}
				}, 5000);
				
				testImg.src = objectUrl;
				
			} catch (urlError) {
				console.error('URL.createObjectURL failed:', urlError);
				if (!cleanupRef.current) {
					handleError();
				}
			}
		};
		
		// Handle final error state
		const handleError = () => {
			if (cleanupRef.current) return;
			
			console.error('All preview methods failed');
			setPreviewState(prev => ({
				...prev,
				loading: false,
				error: true,
				url: null
			}));
		};
		
		// Start with FileReader (more reliable for mobile repeated uploads)
		tryFileReader();
		
	}, [file, resetState, previewState.loading]);
	
	// Handle image load success
	const handleImageLoad = useCallback(() => {
		if (cleanupRef.current) return;
		
		console.log('Preview image rendered successfully');
		setPreviewState(prev => ({
			...prev,
			imageLoaded: true
		}));
	}, []);
	
	// Handle image load error
	const handleImageError = useCallback((e) => {
		if (cleanupRef.current) return;
		
		console.error('Preview image failed to render:', e);
		
		// Retry with the other method if we haven't already
		if (retryCountRef.current < 1) {
			retryCountRef.current++;
			console.log('Retrying with alternative method...');
			
			// If FileReader was used, try Object URL
			if (previewState.url && previewState.url.startsWith('data:')) {
				// Clean up current URL and try object URL
				setPreviewState(prev => ({ ...prev, loading: true, error: false, imageLoaded: false }));
				
				try {
					if (objectUrlRef.current) {
						URL.revokeObjectURL(objectUrlRef.current);
					}
					const objectUrl = URL.createObjectURL(file);
					objectUrlRef.current = objectUrl;
					
					setPreviewState(prev => ({
						...prev,
						url: objectUrl,
						loading: false
					}));
				} catch (error) {
					console.error('Retry with Object URL failed:', error);
					setPreviewState(prev => ({
						...prev,
						loading: false,
						error: true
					}));
				}
			} else {
				// If Object URL was used, mark as error
				setPreviewState(prev => ({
					...prev,
					loading: false,
					error: true
				}));
			}
		} else {
			setPreviewState(prev => ({
				...prev,
				loading: false,
				error: true
			}));
		}
	}, [file, previewState.url]);
	
	// Effect to create preview when file changes
	useEffect(() => {
		if (!file) {
			setPreviewState({
				url: null,
				loading: false,
				error: false,
				imageLoaded: false
			});
			return;
		}
		
		createPreview();
		
		// Cleanup on unmount or file change
		return cleanup;
	}, [file, createPreview, cleanup]);
	
	// Loading state
	if (previewState.loading) {
		return (
			<div className="w-full aspect-square max-h-64 bg-gray-100 rounded-xl flex items-center justify-center">
				<div className="flex flex-col items-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-2"></div>
					<p className="text-sm text-gray-600">Зареждане на преглед...</p>
					<p className="text-xs text-gray-500 mt-1">
						{file?.name ? `Обработва: ${file.name}` : 'Обработва файла...'}
					</p>
				</div>
			</div>
		);
	}
	
	// Error state
	if (previewState.error || !previewState.url) {
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
						<br />
						Опити: {retryCountRef.current + 1}
					</p>
					<button
						onClick={() => {
							retryCountRef.current = 0;
							createPreview();
						}}
						className="mt-2 px-3 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 transition-colors"
					>
						Опитай отново
					</button>
				</div>
			</div>
		);
	}
	
	// Success state with image preview
	return (
		<div className="w-full">
			<div className="aspect-square max-h-64 bg-gray-100 rounded-xl overflow-hidden shadow-inner relative">
				{/* Loading overlay while image is loading */}
				{!previewState.imageLoaded && (
					<div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
						<div className="flex flex-col items-center">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mb-2"></div>
							<p className="text-xs text-gray-600">Рендериране...</p>
						</div>
					</div>
				)}
				
				<img
					ref={imgRef}
					src={previewState.url}
					alt="Preview"
					className={`w-full h-full object-cover transition-opacity duration-300 ${
						previewState.imageLoaded ? 'opacity-100' : 'opacity-0'
					}`}
					onLoad={handleImageLoad}
					onError={handleImageError}
					style={{
						imageRendering: 'auto',
						backfaceVisibility: 'hidden',
						transform: 'translateZ(0)', // Force hardware acceleration
					}}
					// Add cache-busting for mobile browsers
					crossOrigin="anonymous"
				/>
			</div>
			
			{/* Image info */}
			<div className="mt-2 text-xs text-gray-500 text-center">
				<p>📁 {file?.name || 'Неизвестен файл'}</p>
				<p>📏 {file?.size ? Math.round(file.size / 1024) + ' KB' : 'Неизвестен размер'}</p>
				{file?.type && <p>🎨 {file.type}</p>}
				{file?.lastModified && (
					<p>🕐 {new Date(file.lastModified).toLocaleString('bg-BG')}</p>
				)}
			</div>
		</div>
	);
}