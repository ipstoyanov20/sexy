import { useState, useEffect, useRef, useCallback } from "react";
import ErrorMessage from "./ErrorMessage";
import { generateFileKey, logFileInfo } from "../utils/fileUtils";
import { isSamsung, isSamsungInternet, isMobile } from "../utils/mobileUtils";

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
						<SamsungOptimizedImagePreview 
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

// Samsung A23-optimized image preview component with device-specific handling
function SamsungOptimizedImagePreview({ file }) {
	const [previewState, setPreviewState] = useState({
		url: null,
		loading: true,
		error: false,
		imageLoaded: false,
		method: null // Track which method was used
	});
	
	const imgRef = useRef(null);
	const objectUrlRef = useRef(null);
	const fileReaderRef = useRef(null);
	const cleanupRef = useRef(false);
	const retryCountRef = useRef(0);
	const timeoutRef = useRef(null);
	
	// Samsung A23 specific settings
	const samsungDevice = isSamsung();
	const samsungBrowser = isSamsungInternet();
	const mobileDevice = isMobile();
	
	// Device-specific configuration
	const config = {
		preferFileReader: samsungDevice || samsungBrowser, // Samsung A23 works better with FileReader
		maxRetries: samsungDevice ? 3 : 2, // More retries for Samsung
		timeout: samsungDevice ? 8000 : 5000, // Longer timeout for Samsung
		forceCleanup: samsungDevice, // Aggressive cleanup for Samsung
		useCanvas: samsungDevice && retryCountRef.current > 1 // Canvas fallback for Samsung
	};
	
	// Reset state when file changes
	const resetState = useCallback(() => {
		setPreviewState({
			url: null,
			loading: true,
			error: false,
			imageLoaded: false,
			method: null
		});
		retryCountRef.current = 0;
		cleanupRef.current = false;
	}, []);
	
	// Aggressive cleanup function for Samsung devices
	const cleanup = useCallback(() => {
		cleanupRef.current = true;
		
		// Clear timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		
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
		
		// Samsung-specific: Force garbage collection hint
		if (config.forceCleanup && window.gc) {
			try {
				window.gc();
			} catch (e) {
				// Ignore if gc is not available
			}
		}
	}, [config.forceCleanup]);
	
	// Create preview with Samsung A23-specific optimizations
	const createPreview = useCallback(async () => {
		if (!file || cleanupRef.current) return;
		
		resetState();
		logFileInfo(file, `Samsung A23 preview (attempt ${retryCountRef.current + 1}):`);
		
		// Set timeout
		timeoutRef.current = setTimeout(() => {
			if (!cleanupRef.current && previewState.loading) {
				console.log('Samsung A23: Preview timeout, retrying...');
				if (retryCountRef.current < config.maxRetries) {
					retryCountRef.current++;
					createPreview();
				} else {
					handleError('Timeout exceeded');
				}
			}
		}, config.timeout);
		
		// Method 1: FileReader (preferred for Samsung A23)
		const tryFileReader = () => {
			if (cleanupRef.current) return;
			
			console.log('Samsung A23: Trying FileReader method...');
			
			const reader = new FileReader();
			fileReaderRef.current = reader;
			
			reader.onload = (e) => {
				if (cleanupRef.current || !e.target?.result) return;
				
				console.log('Samsung A23: FileReader loaded successfully');
				clearTimeout(timeoutRef.current);
				setPreviewState(prev => ({
					...prev,
					url: e.target.result,
					loading: false,
					error: false,
					method: 'FileReader'
				}));
			};
			
			reader.onerror = (e) => {
				if (cleanupRef.current) return;
				console.error('Samsung A23: FileReader failed:', e);
				tryObjectURL();
			};
			
			reader.onabort = () => {
				if (cleanupRef.current) return;
				console.log('Samsung A23: FileReader aborted');
			};
			
			try {
				reader.readAsDataURL(file);
			} catch (readerError) {
				console.error('Samsung A23: FileReader readAsDataURL failed:', readerError);
				if (!cleanupRef.current) {
					tryObjectURL();
				}
			}
		};
		
		// Method 2: Object URL (fallback for Samsung A23)
		const tryObjectURL = () => {
			if (cleanupRef.current) return;
			
			console.log('Samsung A23: Trying Object URL method...');
			
			try {
				// Samsung A23: Clean up any existing object URL first
				if (objectUrlRef.current) {
					URL.revokeObjectURL(objectUrlRef.current);
					objectUrlRef.current = null;
				}
				
				const objectUrl = URL.createObjectURL(file);
				objectUrlRef.current = objectUrl;
				
				// Test the URL with a temporary image (Samsung A23 specific)
				const testImg = new Image();
				
				// Samsung A23: Add more aggressive error handling
				const testTimeout = setTimeout(() => {
					if (!cleanupRef.current) {
						console.log('Samsung A23: Object URL test timeout');
						tryCanvasFallback();
					}
				}, 3000);
				
				testImg.onload = () => {
					if (cleanupRef.current) return;
					clearTimeout(testTimeout);
					clearTimeout(timeoutRef.current);
					
					console.log('Samsung A23: Object URL loaded successfully');
					setPreviewState(prev => ({
						...prev,
						url: objectUrl,
						loading: false,
						error: false,
						method: 'ObjectURL'
					}));
				};
				
				testImg.onerror = () => {
					if (cleanupRef.current) return;
					clearTimeout(testTimeout);
					console.error('Samsung A23: Object URL test failed');
					tryCanvasFallback();
				};
				
				testImg.src = objectUrl;
				
			} catch (urlError) {
				console.error('Samsung A23: URL.createObjectURL failed:', urlError);
				if (!cleanupRef.current) {
					tryCanvasFallback();
				}
			}
		};
		
		// Method 3: Canvas fallback (Samsung A23 last resort)
		const tryCanvasFallback = () => {
			if (cleanupRef.current || !config.useCanvas) {
				handleError('All methods failed');
				return;
			}
			
			console.log('Samsung A23: Trying Canvas fallback...');
			
			const reader = new FileReader();
			reader.onload = (e) => {
				if (cleanupRef.current) return;
				
				try {
					const img = new Image();
					img.onload = () => {
						if (cleanupRef.current) return;
						
						const canvas = document.createElement('canvas');
						const ctx = canvas.getContext('2d');
						
						canvas.width = img.width;
						canvas.height = img.height;
						ctx.drawImage(img, 0, 0);
						
						const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
						
						clearTimeout(timeoutRef.current);
						setPreviewState(prev => ({
							...prev,
							url: dataUrl,
							loading: false,
							error: false,
							method: 'Canvas'
						}));
						
						console.log('Samsung A23: Canvas fallback successful');
					};
					
					img.onerror = () => {
						if (!cleanupRef.current) {
							handleError('Canvas fallback failed');
						}
					};
					
					img.src = e.target.result;
				} catch (canvasError) {
					console.error('Samsung A23: Canvas fallback error:', canvasError);
					if (!cleanupRef.current) {
						handleError('Canvas fallback failed');
					}
				}
			};
			
			reader.onerror = () => {
				if (!cleanupRef.current) {
					handleError('Canvas FileReader failed');
				}
			};
			
			try {
				reader.readAsDataURL(file);
			} catch (error) {
				handleError('Canvas FileReader failed');
			}
		};
		
		// Handle final error state
		const handleError = (reason) => {
			if (cleanupRef.current) return;
			
			console.error('Samsung A23: All preview methods failed:', reason);
			clearTimeout(timeoutRef.current);
			setPreviewState(prev => ({
				...prev,
				loading: false,
				error: true,
				url: null,
				method: 'Failed'
			}));
		};
		
		// Start with preferred method for Samsung A23
		if (config.preferFileReader) {
			tryFileReader();
		} else {
			tryObjectURL();
		}
		
	}, [file, resetState, previewState.loading, config]);
	
	// Handle image load success
	const handleImageLoad = useCallback(() => {
		if (cleanupRef.current) return;
		
		console.log(`Samsung A23: Preview image rendered successfully using ${previewState.method}`);
		setPreviewState(prev => ({
			...prev,
			imageLoaded: true
		}));
	}, [previewState.method]);
	
	// Handle image load error with Samsung A23-specific retry logic
	const handleImageError = useCallback((e) => {
		if (cleanupRef.current) return;
		
		console.error('Samsung A23: Preview image failed to render:', e);
		
		// Samsung A23: More aggressive retry logic
		if (retryCountRef.current < config.maxRetries) {
			retryCountRef.current++;
			console.log(`Samsung A23: Retrying (attempt ${retryCountRef.current + 1}/${config.maxRetries + 1})`);
			
			// Clear current state and retry with different method
			setPreviewState(prev => ({ 
				...prev, 
				loading: true, 
				error: false, 
				imageLoaded: false,
				url: null
			}));
			
			// Wait a bit before retrying (Samsung A23 needs time to clean up)
			setTimeout(() => {
				createPreview();
			}, 500);
		} else {
			setPreviewState(prev => ({
				...prev,
				loading: false,
				error: true
			}));
		}
	}, [config.maxRetries, createPreview]);
	
	// Effect to create preview when file changes
	useEffect(() => {
		if (!file) {
			setPreviewState({
				url: null,
				loading: false,
				error: false,
				imageLoaded: false,
				method: null
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
					{samsungDevice && (
						<p className="text-xs text-blue-500 mt-1">
							Samsung A23 режим: Опит {retryCountRef.current + 1}
						</p>
					)}
				</div>
			</div>
		);
	}
	
	// Error state with Samsung A23-specific information
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
						Опити: {retryCountRef.current + 1}/{config.maxRetries + 1}
						{samsungDevice && <><br />Устройство: Samsung A23</>}
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
							{samsungDevice && (
								<p className="text-xs text-blue-500">Samsung A23</p>
							)}
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
					// Samsung A23: Remove crossOrigin as it can cause issues
					// crossOrigin="anonymous"
				/>
			</div>
			
			{/* Image info with method used */}
			<div className="mt-2 text-xs text-gray-500 text-center">
				<p>📁 {file?.name || 'Неизвестен файл'}</p>
				<p>📏 {file?.size ? Math.round(file.size / 1024) + ' KB' : 'Неизвестен размер'}</p>
				{file?.type && <p>🎨 {file.type}</p>}
				{file?.lastModified && (
					<p>🕐 {new Date(file.lastModified).toLocaleString('bg-BG')}</p>
				)}
				{previewState.method && (
					<p className="text-blue-500">📱 Метод: {previewState.method}</p>
				)}
				{samsungDevice && (
					<p className="text-blue-500">🔧 Samsung A23 оптимизация</p>
				)}
			</div>
		</div>
	);
}