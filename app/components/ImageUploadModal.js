import { useState, useEffect, useRef, useCallback } from "react";
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

	// Generate unique key for each file to force component remount
	const fileKey = pendingFile ? 
		`${pendingFile.name}-${pendingFile.size}-${pendingFile.lastModified}-${Date.now()}` : 
		null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">
			<div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col w-full max-w-md sm:max-w-lg mx-4 shadow-2xl max-h-[95vh] overflow-y-auto">
				<h2 className="text-lg sm:text-xl mb-4 font-semibold text-gray-800 text-center">
					📝 Преглед и име на снимката
				</h2>
				
				{/* Enhanced Preview of selected image with Samsung A23 optimizations */}
				{pendingFile && (
					<div className="w-full mb-4">
						<SamsungOptimizedImagePreview 
							file={pendingFile} 
							key={fileKey}
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

// Samsung A23-optimized image preview component with comprehensive error handling
function SamsungOptimizedImagePreview({ file }) {
	const [previewState, setPreviewState] = useState({
		url: null,
		loading: true,
		error: false,
		imageLoaded: false,
		loadMethod: null
	});
	
	const imgRef = useRef(null);
	const objectUrlRef = useRef(null);
	const fileReaderRef = useRef(null);
	const cleanupExecutedRef = useRef(false);
	const retryCountRef = useRef(0);
	const timeoutRef = useRef(null);
	
	// Detect Samsung device/browser
	const isSamsungDevice = useCallback(() => {
		if (typeof window === 'undefined') return false;
		const userAgent = navigator.userAgent || '';
		return /samsung|samsungbrowser|sm-a235|galaxy a23/i.test(userAgent);
	}, []);
	
	// Samsung-specific configuration
	const config = {
		maxRetries: isSamsungDevice() ? 3 : 2,
		timeout: isSamsungDevice() ? 10000 : 7000,
		preferFileReader: isSamsungDevice(), // Samsung works better with FileReader
		aggressiveCleanup: isSamsungDevice(),
		processingDelay: isSamsungDevice() ? 300 : 100
	};
	
	// Comprehensive cleanup function
	const performCleanup = useCallback(() => {
		if (cleanupExecutedRef.current) return;
		cleanupExecutedRef.current = true;
		
		console.log('Samsung A23: Performing comprehensive cleanup');
		
		// Clear timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		
		// Cleanup object URL
		if (objectUrlRef.current) {
			try {
				URL.revokeObjectURL(objectUrlRef.current);
				console.log('Samsung A23: Object URL revoked');
			} catch (e) {
				console.warn('Samsung A23: Failed to revoke object URL:', e);
			}
			objectUrlRef.current = null;
		}
		
		// Cleanup FileReader
		if (fileReaderRef.current) {
			try {
				fileReaderRef.current.abort();
				console.log('Samsung A23: FileReader aborted');
			} catch (e) {
				console.warn('Samsung A23: Failed to abort FileReader:', e);
			}
			fileReaderRef.current = null;
		}
		
		// Samsung-specific: Force garbage collection hint
		if (config.aggressiveCleanup && window.gc) {
			try {
				window.gc();
			} catch (e) {
				// Ignore if gc is not available
			}
		}
	}, [config.aggressiveCleanup]);
	
	// Reset state for new file
	const resetState = useCallback(() => {
		setPreviewState({
			url: null,
			loading: true,
			error: false,
			imageLoaded: false,
			loadMethod: null
		});
		retryCountRef.current = 0;
		cleanupExecutedRef.current = false;
	}, []);
	
	// Enhanced file to URL conversion with multiple strategies
	const createPreviewUrl = useCallback(async () => {
		if (!file || cleanupExecutedRef.current) return;
		
		resetState();
		
		console.log('Samsung A23: Creating preview URL, attempt:', retryCountRef.current + 1);
		console.log('Samsung A23: File info:', {
			name: file.name,
			size: file.size,
			type: file.type,
			lastModified: file.lastModified
		});
		
		// Set processing timeout
		timeoutRef.current = setTimeout(() => {
			if (!cleanupExecutedRef.current) {
				console.log('Samsung A23: Preview creation timeout');
				if (retryCountRef.current < config.maxRetries) {
					retryCountRef.current++;
					setTimeout(() => createPreviewUrl(), 500);
				} else {
					setPreviewState(prev => ({ ...prev, loading: false, error: true }));
				}
			}
		}, config.timeout);
		
		// Strategy 1: FileReader (preferred for Samsung)
		const tryFileReader = () => {
			return new Promise((resolve, reject) => {
				if (cleanupExecutedRef.current) {
					reject(new Error('Cleanup executed'));
					return;
				}
				
				console.log('Samsung A23: Trying FileReader method');
				const reader = new FileReader();
				fileReaderRef.current = reader;
				
				reader.onload = (e) => {
					if (cleanupExecutedRef.current || !e.target?.result) {
						reject(new Error('Reader cleanup or no result'));
						return;
					}
					console.log('Samsung A23: FileReader success');
					resolve({ url: e.target.result, method: 'FileReader' });
				};
				
				reader.onerror = (e) => {
					console.error('Samsung A23: FileReader error:', e);
					reject(new Error('FileReader failed'));
				};
				
				reader.onabort = () => {
					reject(new Error('FileReader aborted'));
				};
				
				try {
					reader.readAsDataURL(file);
				} catch (error) {
					reject(error);
				}
			});
		};
		
		// Strategy 2: Object URL (fallback)
		const tryObjectURL = () => {
			return new Promise((resolve, reject) => {
				if (cleanupExecutedRef.current) {
					reject(new Error('Cleanup executed'));
					return;
				}
				
				console.log('Samsung A23: Trying Object URL method');
				
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
					const testTimeout = setTimeout(() => {
						reject(new Error('Object URL test timeout'));
					}, 3000);
					
					testImg.onload = () => {
						clearTimeout(testTimeout);
						console.log('Samsung A23: Object URL success');
						resolve({ url: objectUrl, method: 'ObjectURL' });
					};
					
					testImg.onerror = () => {
						clearTimeout(testTimeout);
						reject(new Error('Object URL test failed'));
					};
					
					testImg.src = objectUrl;
					
				} catch (error) {
					reject(error);
				}
			});
		};
		
		// Try strategies in order
		try {
			let result;
			
			if (config.preferFileReader) {
				try {
					result = await tryFileReader();
				} catch (e) {
					console.log('Samsung A23: FileReader failed, trying Object URL');
					result = await tryObjectURL();
				}
			} else {
				try {
					result = await tryObjectURL();
				} catch (e) {
					console.log('Samsung A23: Object URL failed, trying FileReader');
					result = await tryFileReader();
				}
			}
			
			if (cleanupExecutedRef.current) return;
			
			clearTimeout(timeoutRef.current);
			setPreviewState(prev => ({
				...prev,
				url: result.url,
				loading: false,
				error: false,
				loadMethod: result.method
			}));
			
		} catch (error) {
			if (cleanupExecutedRef.current) return;
			
			console.error('Samsung A23: All preview methods failed:', error);
			clearTimeout(timeoutRef.current);
			
			if (retryCountRef.current < config.maxRetries) {
				retryCountRef.current++;
				console.log(`Samsung A23: Retrying (${retryCountRef.current}/${config.maxRetries})`);
				setTimeout(() => createPreviewUrl(), 1000);
			} else {
				setPreviewState(prev => ({ ...prev, loading: false, error: true }));
			}
		}
	}, [file, config, resetState]);
	
	// Handle successful image load
	const handleImageLoad = useCallback(() => {
		if (cleanupExecutedRef.current) return;
		
		console.log('Samsung A23: Image rendered successfully');
		setPreviewState(prev => ({ ...prev, imageLoaded: true }));
	}, []);
	
	// Handle image load error with retry logic
	const handleImageError = useCallback((e) => {
		if (cleanupExecutedRef.current) return;
		
		console.error('Samsung A23: Image rendering failed:', e);
		
		if (retryCountRef.current < config.maxRetries) {
			retryCountRef.current++;
			console.log(`Samsung A23: Image error, retrying (${retryCountRef.current}/${config.maxRetries})`);
			
			// Reset and retry
			setPreviewState(prev => ({ 
				...prev, 
				loading: true, 
				error: false, 
				imageLoaded: false,
				url: null 
			}));
			
			setTimeout(() => createPreviewUrl(), 500);
		} else {
			setPreviewState(prev => ({ ...prev, error: true, loading: false }));
		}
	}, [config.maxRetries, createPreviewUrl]);
	
	// Manual retry function
	const handleRetry = useCallback(() => {
		retryCountRef.current = 0;
		performCleanup();
		cleanupExecutedRef.current = false;
		setTimeout(() => createPreviewUrl(), config.processingDelay);
	}, [createPreviewUrl, performCleanup, config.processingDelay]);
	
	// Effect to create preview when file changes
	useEffect(() => {
		if (!file) {
			setPreviewState({
				url: null,
				loading: false,
				error: false,
				imageLoaded: false,
				loadMethod: null
			});
			return;
		}
		
		// Add delay for Samsung processing
		const timer = setTimeout(() => {
			createPreviewUrl();
		}, config.processingDelay);
		
		// Cleanup function
		return () => {
			clearTimeout(timer);
			performCleanup();
		};
	}, [file, createPreviewUrl, performCleanup, config.processingDelay]);
	
	// Loading state
	if (previewState.loading) {
		return (
			<div className="w-full aspect-square max-h-64 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
				<div className="flex flex-col items-center p-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-3"></div>
					<p className="text-sm text-gray-600 text-center">Зареждане на преглед...</p>
					<p className="text-xs text-gray-500 mt-1 text-center">
						{file?.name ? `Обработва: ${file.name.substring(0, 20)}${file.name.length > 20 ? '...' : ''}` : 'Обработва файла...'}
					</p>
					{isSamsungDevice() && (
						<p className="text-xs text-blue-500 mt-1">
							Samsung режим: Опит {retryCountRef.current + 1}
						</p>
					)}
				</div>
			</div>
		);
	}
	
	// Error state
	if (previewState.error || !previewState.url) {
		return (
			<div className="w-full aspect-square max-h-64 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
				<div className="flex flex-col items-center text-center p-4">
					<div className="text-3xl mb-2 text-gray-400">⚠️</div>
					<p className="text-sm text-gray-600 mb-2">
						Прегледът не може да се зареди
					</p>
					<p className="text-xs text-gray-500 mb-3">
						Файл: {file?.name || 'Неизвестен'}
						<br />
						Размер: {file?.size ? Math.round(file.size / 1024) + ' KB' : 'Неизвестен'}
						<br />
						Опити: {retryCountRef.current + 1}/{config.maxRetries + 1}
						{isSamsungDevice() && <><br />Устройство: Samsung</>}
					</p>
					<button
						onClick={handleRetry}
						className="px-3 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 transition-colors"
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
			<div className="aspect-square max-h-64 bg-gray-50 rounded-xl overflow-hidden shadow-inner relative border">
				{/* Loading overlay while image is rendering */}
				{!previewState.imageLoaded && previewState.url && (
					<div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
						<div className="flex flex-col items-center">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mb-2"></div>
							<p className="text-xs text-gray-600">Рендериране...</p>
							{isSamsungDevice() && (
								<p className="text-xs text-blue-500">Samsung оптимизация</p>
							)}
						</div>
					</div>
				)}
				
				<img
					ref={imgRef}
					src={previewState.url}
					alt="Preview"
					className={`w-full h-full object-cover transition-opacity duration-500 ${
						previewState.imageLoaded ? 'opacity-100' : 'opacity-0'
					}`}
					onLoad={handleImageLoad}
					onError={handleImageError}
					style={{
						imageRendering: 'auto',
						backfaceVisibility: 'hidden',
						transform: 'translateZ(0)', // Force hardware acceleration
					}}
				/>
			</div>
			
			{/* Image metadata info */}
			<div className="mt-2 text-xs text-gray-500 text-center space-y-1">
				<p>📁 {file?.name || 'Неизвестен файл'}</p>
				<p>📏 {file?.size ? Math.round(file.size / 1024) + ' KB' : 'Неизвестен размер'}</p>
				{file?.type && <p>🎨 {file.type}</p>}
				{previewState.loadMethod && (
					<p className="text-blue-500">📱 Метод: {previewState.loadMethod}</p>
				)}
				{isSamsungDevice() && (
					<p className="text-blue-500">🔧 Samsung оптимизация</p>
				)}
			</div>
		</div>
	);
}