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

// Check if device is Samsung
export const isSamsung = () => {
	if (typeof window === 'undefined') return false;
	const userAgent = navigator.userAgent || '';
	return /samsung/i.test(userAgent);
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

// Get optimal image processing settings for mobile
export const getMobileImageSettings = () => {
	const mobile = isMobile();
	const samsung = isSamsung();
	
	return {
		maxDimension: mobile ? (samsung ? 1000 : 1200) : 1500,
		quality: mobile ? (samsung ? 0.75 : 0.8) : 0.85,
		maxSize: mobile ? 2 * 1024 * 1024 : 3 * 1024 * 1024, // 2MB for mobile, 3MB for desktop
		useFileReader: mobile || samsung, // Use FileReader for mobile devices
		timeout: mobile ? 10000 : 15000, // Shorter timeout for mobile
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