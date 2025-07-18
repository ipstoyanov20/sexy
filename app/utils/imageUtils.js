import { getMobileImageSettings } from './mobileUtils';

// Process image for mobile compatibility with enhanced error handling
export const processImageForMobile = async (file) => {
	return new Promise((resolve, reject) => {
		try {
			// Validate file first
			if (!file || file.size === 0) {
				reject(new Error('Файлът е празен или невалиден'));
				return;
			}

			// Check file type more thoroughly
			const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
			const fileExtension = file.name.toLowerCase().split('.').pop();
			const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
			
			const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension);
			
			if (!isValidType) {
				reject(new Error('Неподдържан формат на файла. Моля използвайте JPG, PNG, GIF, WebP или BMP.'));
				return;
			}

			// Create canvas and context
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			
			if (!ctx) {
				reject(new Error('Canvas не се поддържа от този браузър'));
				return;
			}

			// Create image element
			const img = new Image();
			
			// Get mobile-optimized settings
			const mobileSettings = getMobileImageSettings();
			
			// Set up timeout for image loading
			const timeout = setTimeout(() => {
				reject(new Error('Времето за зареждане на изображението изтече. Моля опитайте отново.'));
			}, mobileSettings.timeout);

			// Success handler
			img.onload = function() {
				clearTimeout(timeout);
				
				try {
					// Get original dimensions
					let { width, height } = img;
					
					// Validate dimensions
					if (width <= 0 || height <= 0) {
						reject(new Error('Невалидни размери на изображението'));
						return;
					}
					
					// Use mobile-optimized max dimension
					const maxDimension = mobileSettings.maxDimension;
					
					// Calculate new dimensions maintaining aspect ratio
					if (width > maxDimension || height > maxDimension) {
						if (width > height) {
							height = Math.round((height * maxDimension) / width);
							width = maxDimension;
						} else {
							width = Math.round((width * maxDimension) / height);
							height = maxDimension;
						}
					}
					
					// Set canvas dimensions
					canvas.width = width;
					canvas.height = height;
					
					// Configure canvas for better mobile compatibility
					ctx.imageSmoothingEnabled = true;
					ctx.imageSmoothingQuality = 'medium';
					
					// Clear canvas and set white background
					ctx.clearRect(0, 0, width, height);
					ctx.fillStyle = '#FFFFFF';
					ctx.fillRect(0, 0, width, height);
					
					// Draw the image
					ctx.drawImage(img, 0, 0, width, height);
					
					// Progressive quality approach for mobile
					let dataUrl;
					let quality = mobileSettings.quality;
					
					// Try to create data URL with error handling
					try {
						dataUrl = canvas.toDataURL('image/jpeg', quality);
					} catch (canvasError) {
						console.error('Canvas toDataURL error:', canvasError);
						// Try with PNG as fallback
						try {
							dataUrl = canvas.toDataURL('image/png');
						} catch (pngError) {
							reject(new Error('Грешка при конвертиране на изображението'));
							return;
						}
					}
					
					if (!dataUrl || !dataUrl.startsWith('data:image/')) {
						reject(new Error('Неуспешно конвертиране на изображението'));
						return;
					}
					
					// Check size and compress if needed
					const maxSize = mobileSettings.maxSize;
					
					if (dataUrl.length > maxSize) {
						quality = 0.7;
						try {
							dataUrl = canvas.toDataURL('image/jpeg', quality);
						} catch (canvasError) {
							console.error('Canvas compression error:', canvasError);
							reject(new Error('Грешка при компресиране на изображението'));
							return;
						}
					}
					
					// If still too large, reduce dimensions further
					if (dataUrl.length > maxSize) {
						const smallerDimension = 800;
						let newWidth = width;
						let newHeight = height;
						
						if (width > height) {
							newHeight = Math.round((height * smallerDimension) / width);
							newWidth = smallerDimension;
						} else {
							newWidth = Math.round((width * smallerDimension) / height);
							newHeight = smallerDimension;
						}
						
						canvas.width = newWidth;
						canvas.height = newHeight;
						ctx.clearRect(0, 0, newWidth, newHeight);
						ctx.fillStyle = '#FFFFFF';
						ctx.fillRect(0, 0, newWidth, newHeight);
						
						try {
							ctx.drawImage(img, 0, 0, newWidth, newHeight);
							dataUrl = canvas.toDataURL('image/jpeg', 0.6);
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
					
					console.log('Final processed image size:', Math.round(dataUrl.length / 1024), 'KB');
					resolve(dataUrl);
					
				} catch (processingError) {
					console.error('Image processing error:', processingError);
					reject(new Error('Грешка при обработка на изображението: ' + processingError.message));
				}
			};

			// Error handler with more specific error messages
			img.onerror = function(errorEvent) {
				clearTimeout(timeout);
				console.error('Image loading error:', errorEvent);
				
				// Try to provide more specific error message
				if (file.size > 10 * 1024 * 1024) { // 10MB
					reject(new Error('Файлът е твърде голям. Моля изберете файл под 10MB.'));
				} else {
					reject(new Error('Не може да се зареди изображението. Моля опитайте с друг файл.'));
				}
			};

			// Create object URL with enhanced error handling
			let objectUrl;
			try {
				// Use FileReader as fallback for problematic files or mobile devices
				const useFileReader = mobileSettings.useFileReader || file.type === '' || file.size > 5 * 1024 * 1024;
				
				if (useFileReader) {
					// Use FileReader for large files or files without proper MIME type
					const reader = new FileReader();
					reader.onload = function(e) {
						img.src = e.target.result;
					};
					reader.onerror = function() {
						clearTimeout(timeout);
						reject(new Error('Грешка при четене на файла'));
					};
					reader.readAsDataURL(file);
				} else {
					// Use object URL for smaller files
					objectUrl = URL.createObjectURL(file);
					
					// Clean up object URL when done
					const originalOnload = img.onload;
					img.onload = function() {
						if (objectUrl) {
							URL.revokeObjectURL(objectUrl);
						}
						return originalOnload.apply(this, arguments);
					};
					
					const originalOnerror = img.onerror;
					img.onerror = function() {
						if (objectUrl) {
							URL.revokeObjectURL(objectUrl);
						}
						return originalOnerror.apply(this, arguments);
					};
					
					img.src = objectUrl;
				}
				
			} catch (urlError) {
				clearTimeout(timeout);
				console.error('URL creation error:', urlError);
				reject(new Error('Грешка при обработка на файла. Моля опитайте отново.'));
			}
			
		} catch (initError) {
			console.error('Image processing initialization error:', initError);
			reject(new Error('Грешка при инициализация на обработката на изображението'));
		}
	});
};