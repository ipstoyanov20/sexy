// Optimized JPG processing for faster uploads
export const processJPGForUpload = async (file) => {
	return new Promise((resolve, reject) => {
		try {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			
			if (!ctx) {
				reject(new Error('Canvas не се поддържа'));
				return;
			}
			
			const img = new Image();
			
			img.onload = () => {
				try {
					let { width, height } = img;
					
					// JPG-optimized dimensions (faster processing)
					const maxDimension = 1200; // Slightly higher for JPG quality
					
					// Calculate optimal dimensions for JPG
					if (width > maxDimension || height > maxDimension) {
						const ratio = Math.min(maxDimension / width, maxDimension / height);
						width = Math.floor(width * ratio);
						height = Math.floor(height * ratio);
					}
					
					// Set canvas size
					canvas.width = width;
					canvas.height = height;
					
					// Optimized settings for JPG
					ctx.imageSmoothingEnabled = true;
					ctx.imageSmoothingQuality = 'high';
					
					// Draw image
					ctx.drawImage(img, 0, 0, width, height);
					
					// JPG-optimized compression (faster than progressive)
					const quality = 0.85; // High quality for JPG
					const dataUrl = canvas.toDataURL('image/jpeg', quality);
					
					// Convert to blob for faster upload
					canvas.toBlob((blob) => {
						if (blob) {
							resolve(blob);
						} else {
							reject(new Error('Грешка при създаване на JPG файл'));
						}
					}, 'image/jpeg', quality);
					
				} catch (error) {
					console.error('JPG processing error:', error);
					reject(new Error('Грешка при обработка на JPG'));
				}
			};
			
			img.onerror = () => {
				reject(new Error('Грешка при зареждане на изображението'));
			};
			
			// Load image
			img.src = URL.createObjectURL(file);
			
		} catch (error) {
			reject(new Error('Грешка при обработка на файла'));
		}
	});
};

// Fast JPG validation and optimization
export const optimizeJPGFile = async (file) => {
	// Check if it's already a JPG and size is reasonable
	if (file.type === 'image/jpeg' && file.size < 1024 * 1024) { // < 1MB
		return file; // Return original if already optimized
	}
	
	// Process for optimization
	try {
		const optimizedBlob = await processJPGForUpload(file);
		
		// Create new file with original name but .jpg extension
		const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
		const optimizedFile = new File([optimizedBlob], fileName, {
			type: 'image/jpeg',
			lastModified: Date.now()
		});
		
		console.log('JPG optimization:', {
			original: Math.round(file.size / 1024) + 'KB',
			optimized: Math.round(optimizedFile.size / 1024) + 'KB',
			savings: Math.round((1 - optimizedFile.size / file.size) * 100) + '%'
		});
		
		return optimizedFile;
	} catch (error) {
		console.error('JPG optimization failed:', error);
		return file; // Return original if optimization fails
	}
};

// Quick file format detection for JPG
export const isJPGFormat = (file) => {
	return file.type === 'image/jpeg' || 
		   file.type === 'image/jpg' || 
		   /\.(jpg|jpeg)$/i.test(file.name);
};

// Process image for mobile compatibility
export const processImageForMobile = async (file) => {
	// Fast path for JPG files
	if (isJPGFormat(file)) {
		return optimizeJPGFile(file);
	}
	
	// Original processing for other formats
	return new Promise((resolve, reject) => {
		try {
			// More robust element creation for mobile
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			
			if (!ctx) {
				reject(new Error('Canvas не се поддържа от този браузър'));
				return;
			}
			
			// Use standard Image constructor - more reliable on mobile
			const img = new window.Image();
			
			// Don't set crossOrigin for local files - causes issues on mobile
			// img.crossOrigin = 'anonymous';
			
			img.onload = () => {
				try {
					// Get original dimensions
					let { width, height } = img;
					
					// More conservative max dimension for mobile reliability
					const maxDimension = 1000;
					
					// Calculate new dimensions maintaining aspect ratio
					if (width > maxDimension || height > maxDimension) {
						if (width > height) {
							height = (height * maxDimension) / width;
							width = maxDimension;
						} else {
							width = (width * maxDimension) / height;
							height = maxDimension;
						}
					}
					
					// Set canvas dimensions
					canvas.width = width;
					canvas.height = height;
					
					// Configure canvas for better mobile compatibility
					ctx.imageSmoothingEnabled = true;
					ctx.imageSmoothingQuality = 'medium'; // 'high' can cause issues on some mobile devices
					
					// Clear canvas and set white background
					ctx.clearRect(0, 0, width, height);
					ctx.fillStyle = '#FFFFFF';
					ctx.fillRect(0, 0, width, height);
					
					// Draw the image
					ctx.drawImage(img, 0, 0, width, height);
					
					// Progressive quality approach for mobile
					let dataUrl;
					let quality = 0.8; // Start with good quality
					
					// Try to create data URL with error handling
					try {
						dataUrl = canvas.toDataURL('image/jpeg', quality);
					} catch (canvasError) {
						console.error('Canvas toDataURL error:', canvasError);
						reject(new Error('Грешка при конвертиране на изображението'));
						return;
					}
					
					if (!dataUrl || !dataUrl.startsWith('data:image/')) {
						reject(new Error('Неуспешно конвертиране на изображението'));
						return;
					}
					
					// Check size and compress if needed
					const maxSize = 2 * 1024 * 1024; // 2MB limit for better mobile compatibility
					
					if (dataUrl.length > maxSize) {
						quality = 0.6;
						try {
							dataUrl = canvas.toDataURL('image/jpeg', quality);
						} catch (canvasError) {
							console.error('Canvas compression error:', canvasError);
							reject(new Error('Грешка при компресиране на изображението'));
							return;
						}
					}
					
					// If still too large, reduce dimensions
					if (dataUrl.length > maxSize) {
						const smallerDimension = 800;
						if (width > height) {
							height = (height * smallerDimension) / width;
							width = smallerDimension;
						} else {
							width = (width * smallerDimension) / height;
							height = smallerDimension;
						}
						
						canvas.width = width;
						canvas.height = height;
						ctx.clearRect(0, 0, width, height);
						ctx.fillStyle = '#FFFFFF';
						ctx.fillRect(0, 0, width, height);
						
						try {
							ctx.drawImage(img, 0, 0, width, height);
							dataUrl = canvas.toDataURL('image/jpeg', 0.7);
						} catch (canvasError) {
							console.error('Canvas final processing error:', canvasError);
							reject(new Error('Грешка при финална обработка на изображението'));
							return;
						}
						
						if (dataUrl.length > maxSize) {
							reject(new Error('Файлът е твърде голям дори след компресия. Моля изберете по-малка снимка.'));
							return;
						}
					}
					
					console.log('Final processed image size:', dataUrl.length, 'bytes');
					resolve(dataUrl);
					
				} catch (processingError) {
					console.error('Image processing error:', processingError);
					reject(new Error('Грешка при обработка на изображението: ' + processingError.message));
				}
			};
			
			img.onerror = (errorEvent) => {
				console.error('Image loading error:', errorEvent);
				reject(new Error('Грешка при зареждане на изображението. Моля проверете дали файлът е валидно изображение.'));
			};
			
			// Create object URL with better error handling
			let objectUrl;
			try {
				// Check if file is valid before creating URL
				if (!file || file.size === 0) {
					reject(new Error('Файлът е празен или невалиден'));
					return;
				}
				
				objectUrl = URL.createObjectURL(file);
				
				// Set a timeout to prevent hanging
				const timeout = setTimeout(() => {
					if (objectUrl) {
						URL.revokeObjectURL(objectUrl);
					}
					reject(new Error('Времето за обработка на изображението изтече. Моля опитайте с по-малък файл.'));
				}, 30000); // 30 second timeout
				
				// Override onload to clear timeout and cleanup
				const originalOnload = img.onload;
				img.onload = function() {
					clearTimeout(timeout);
					if (objectUrl) {
						URL.revokeObjectURL(objectUrl);
					}
					return originalOnload.apply(this, arguments);
				};
				
				// Override onerror to clear timeout and cleanup
				const originalOnerror = img.onerror;
				img.onerror = function() {
					clearTimeout(timeout);
					if (objectUrl) {
						URL.revokeObjectURL(objectUrl);
					}
					return originalOnerror.apply(this, arguments);
				};
				
				// Start loading the image
				img.src = objectUrl;
				
			} catch (urlError) {
				console.error('URL creation error:', urlError);
				reject(new Error('Грешка при създаване на URL за файла. Моля опитайте с друг файл.'));
			}
			
		} catch (initError) {
			console.error('Image processing initialization error:', initError);
			reject(new Error('Грешка при инициализация на обработката на изображението'));
		}
	});
};