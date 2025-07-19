// File handling utilities for better mobile compatibility

// Generate a unique key for a file that can be used for React keys and comparison
export const generateFileKey = (file) => {
	if (!file) return null;
	
	// Use multiple properties to ensure uniqueness
	return `${file.name}-${file.size}-${file.lastModified}-${file.type}`;
};

// Compare two files to see if they're the same
export const filesAreEqual = (file1, file2) => {
	if (!file1 || !file2) return file1 === file2;
	
	return (
		file1.name === file2.name &&
		file1.size === file2.size &&
		file1.lastModified === file2.lastModified &&
		file1.type === file2.type
	);
};

// Clean up file input to ensure it can be used again
export const resetFileInput = (inputElement) => {
	if (!inputElement) return;
	
	try {
		// Clear the value
		inputElement.value = '';
		
		// For some mobile browsers, we need to recreate the input
		const parent = inputElement.parentNode;
		if (parent) {
			const newInput = inputElement.cloneNode(true);
			// Copy all event listeners would be complex, so we'll just clear the value
			// The parent component should handle re-attaching event listeners if needed
		}
	} catch (error) {
		console.warn('Failed to reset file input:', error);
	}
};

// Validate file for mobile compatibility
export const validateFileForMobile = (file) => {
	const errors = [];
	
	if (!file) {
		errors.push('Няма избран файл');
		return errors;
	}
	
	// Size validation
	const maxSize = 10 * 1024 * 1024; // 10MB
	if (file.size > maxSize) {
		errors.push(`Файлът е твърде голям (${Math.round(file.size / 1024 / 1024)}MB). Максимум ${Math.round(maxSize / 1024 / 1024)}MB.`);
	}
	
	if (file.size === 0) {
		errors.push('Файлът е празен');
	}
	
	// Type validation
	const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif', 'ico', 'heic', 'heif'];
	const validMimeTypes = [
		'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
		'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff', 
		'image/tif', 'image/ico', 'image/heic', 'image/heif'
	];
	
	const fileExtension = file.name.toLowerCase().split('.').pop();
	const isValidType = file.type.startsWith('image/') || 
		validMimeTypes.includes(file.type) ||
		validExtensions.includes(fileExtension) ||
		file.type === '';
	
	if (!isValidType) {
		errors.push('Неподдържан тип файл. Използвайте JPG, PNG, GIF, WebP или BMP.');
	}
	
	return errors;
};

// Log file information for debugging
export const logFileInfo = (file, context = '') => {
	if (!file) {
		console.log(`${context} No file provided`);
		return;
	}
	
	console.log(`${context} File info:`, {
		name: file.name,
		size: `${Math.round(file.size / 1024)}KB`,
		type: file.type || 'unknown',
		lastModified: new Date(file.lastModified).toISOString(),
		key: generateFileKey(file)
	});
};

// Check if file is likely a camera photo (for special handling)
export const isLikelyCameraPhoto = (file) => {
	if (!file) return false;
	
	// Camera photos often have generic names and are recent
	const isRecentlyModified = Date.now() - file.lastModified < 60000; // Within last minute
	const hasGenericName = /^(IMG_|DSC_|PHOTO_|image_)/i.test(file.name);
	const isLargeFile = file.size > 1024 * 1024; // > 1MB
	
	return (isRecentlyModified && hasGenericName) || 
		   (isRecentlyModified && isLargeFile) ||
		   hasGenericName;
};