// Mobile device detection utilities
export const isMobile = () => {
	if (typeof window === 'undefined') return false;
	
	// Check for mobile user agents
	const userAgent = navigator.userAgent || navigator.vendor || window.opera;
	const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|samsung/i;
	
	// Check for touch capabilities
	const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	
	// Check screen size
	const isSmallScreen = window.innerWidth <= 768;
	
	return mobileRegex.test(userAgent) || (hasTouch && isSmallScreen);
};

// Check if device is Samsung (enhanced for Samsung A23)
export const isSamsung = () => {
	if (typeof window === 'undefined') return false;
	const userAgent = navigator.userAgent || '';
	
	// Samsung device detection patterns
	const samsungPatterns = [
		/samsung/i,
		/sm-a235/i, // Samsung Galaxy A23 specific
		/galaxy a23/i, // Galaxy A23 name pattern
		/samsungbrowser/i,
		/samsung-sm-/i
	];
	
	return samsungPatterns.some(pattern => pattern.test(userAgent));
};

// Specific Samsung A23 detection
export const isSamsungA23 = () => {
	if (typeof window === 'undefined') return false;
	const userAgent = navigator.userAgent || '';
	
	// Samsung Galaxy A23 specific patterns
	const a23Patterns = [
		/sm-a235/i, // Model number
		/galaxy a23/i, // Name
		/samsung.*a23/i
	];
	
	return a23Patterns.some(pattern => pattern.test(userAgent));
};

// Check if browser is Samsung Internet
export const isSamsungInternet = () => {
	if (typeof window === 'undefined') return false;
	const userAgent = navigator.userAgent || '';
	return /samsungbrowser/i.test(userAgent);
};

// Check if device supports camera capture
export const supportsCameraCapture = () => {
	if (typeof window === 'undefined') return false;
	
	// Check for getUserMedia support
	const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
	
	// Check for file input capture support
	const input = document.createElement('input');
	input.type = 'file';
	const hasCaptureSupport = 'capture' in input;
	
	return hasGetUserMedia || hasCaptureSupport;
};

// Alias for backwards compatibility
export const hasCameraSupport = supportsCameraCapture;

// Samsung A23 specific camera support check
export const samsungA23CameraSupport = () => {
	if (typeof window === 'undefined') return false;
	
	const samsungA23 = isSamsungA23();
	const samsung = isSamsung();
	const samsungBrowser = isSamsungInternet();
	
	if (!samsungA23 && !samsung && !samsungBrowser) return false;
	
	// Samsung A23 has good camera support but needs specific handling
	return {
		hasCamera: true,
		preferFileInput: true, // File input works better than getUserMedia on Samsung
		supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
		maxResolution: { width: 4000, height: 3000 }, // Samsung A23 camera specs
		preferredSettings: {
			facing: 'environment', // Rear camera
			quality: 0.8,
			format: 'image/jpeg'
		}
	};
};

// Get optimal image processing settings for mobile (enhanced for Samsung A23)
export const getMobileImageSettings = () => {
	const mobile = isMobile();
	const samsung = isSamsung();
	const samsungA23 = isSamsungA23();
	const samsungBrowser = isSamsungInternet();
	
	// Samsung A23 specific optimizations
	if (samsungA23 || samsungBrowser) {
		return {
			maxDimension: 900, // Lower for Samsung A23 to prevent memory issues
			quality: 0.7, // Lower quality for better performance
			maxSize: 3 * 1024 * 1024, // 3MB for Samsung A23 (camera photos can be large)
			useFileReader: true, // Always use FileReader for Samsung
			timeout: 12000, // Longer timeout for Samsung processing
			preferCanvas: false, // Samsung A23 has issues with canvas sometimes
			aggressiveCleanup: true, // Enable aggressive cleanup
			retryCount: 3, // More retries for Samsung
			processingDelay: 300, // Add delay between operations
		};
	}
	
	// General Samsung settings
	if (samsung) {
		return {
			maxDimension: 1000,
			quality: 0.75,
			maxSize: 2.5 * 1024 * 1024,
			useFileReader: true,
			timeout: 10000,
			aggressiveCleanup: true,
			retryCount: 2,
			processingDelay: 200,
		};
	}
	
	// General mobile settings
	if (mobile) {
		return {
			maxDimension: 1200,
			quality: 0.8,
			maxSize: 2 * 1024 * 1024,
			useFileReader: true,
			timeout: 8000,
			retryCount: 1,
			processingDelay: 100,
		};
	}
	
	// Desktop settings
	return {
		maxDimension: 1500,
		quality: 0.85,
		maxSize: 3 * 1024 * 1024,
		useFileReader: false,
		timeout: 15000,
		retryCount: 1,
		processingDelay: 0,
	};
};

// Force mobile keyboard to close
export const closeMobileKeyboard = () => {
	if (typeof window === 'undefined') return;
	
	// Create a temporary input and blur it to close keyboard
	const input = document.createElement('input');
	input.style.position = 'fixed';
	input.style.top = '-1000px';
	input.style.left = '-1000px';
	document.body.appendChild(input);
	input.focus();
	input.blur();
	document.body.removeChild(input);
};

// Optimize image loading for mobile
export const optimizeImageForMobile = (imgElement) => {
	if (!imgElement || typeof window === 'undefined') return;
	
	// Add mobile-specific optimizations
	imgElement.style.imageRendering = 'auto';
	imgElement.style.backfaceVisibility = 'hidden';
	imgElement.style.transform = 'translateZ(0)'; // Force hardware acceleration
	
	// Prevent image drag on mobile
	imgElement.draggable = false;
	imgElement.addEventListener('dragstart', (e) => e.preventDefault());
	
	// Add touch-friendly styling
	imgElement.style.touchAction = 'manipulation';
};

// Handle mobile viewport issues
export const handleMobileViewport = () => {
	if (typeof window === 'undefined') return;
	
	// Prevent zoom on input focus (iOS)
	const viewport = document.querySelector('meta[name="viewport"]');
	if (viewport) {
		viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
	}
	
	// Handle orientation change
	window.addEventListener('orientationchange', () => {
		setTimeout(() => {
			window.scrollTo(0, 0);
		}, 100);
	});
};

// Get file input accept attribute optimized for mobile
export const getMobileFileAccept = () => {
	const mobile = isMobile();
	const samsung = isSamsung();
	
	if (samsung) {
		// Samsung devices sometimes have issues with generic image/*
		return 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
	} else if (mobile) {
		return 'image/*';
	} else {
		return 'image/*';
	}
};