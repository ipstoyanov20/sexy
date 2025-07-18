"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function Home() {
	const [isSpinning, setIsSpinning] = useState(false);
	const [showBlur, setShowBlur] = useState(true);
	const [shuffledImages, setShuffledImages] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [processing, setProcessing] = useState(false);
	const [activeSection, setActiveSection] = useState("играй");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [galleryImages, setGalleryImages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState(null);
	const [showRenameModal, setShowRenameModal] = useState(false);
	const [pendingFile, setPendingFile] = useState(null);
	const [newImageName, setNewImageName] = useState("");
	const audioRef = useRef(null);
	const fileInputRef = useRef(null);
	const [supabase, setSupabase] = useState(null);

	// Initialize Supabase client on component mount
	useEffect(() => {
		const initSupabase = async () => {
			try {
				const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
				const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
				
				if (supabaseUrl && supabaseAnonKey) {
					// Dynamic import to avoid SSR issues
					const { createClient } = await import('@supabase/supabase-js');
					const client = createClient(supabaseUrl, supabaseAnonKey);
					setSupabase(client);
				}
			} catch (error) {
				console.error('Failed to initialize Supabase:', error);
				setError('Грешка при инициализация на базата данни');
			}
		};
		
		initSupabase();
	}, []);

	const images = [
		"/kamasutra.png",
		"/chair.webp",
		"/doggy.png",
		"/lizane.webp",
		"/mis.png",
		"/doggy2.png",
	];

	// Fisher-Yates Shuffle
	function shuffleArray(arr) {
		const shuffled = [...arr];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	// Load gallery images from Supabase
	const loadGalleryFromDatabase = async () => {
		if (!supabase) {
			console.log('Supabase not initialized yet');
			return;
		}
		
		try {
			setLoading(true);
			setError(null);

			const { data, error } = await supabase
				.from('gallery_images')
				.select('*')
				.order('uploaded_at', { ascending: false });

			if (error) {
				console.error('Error loading gallery:', error);
				setError('Грешка при зареждане на галерията: ' + error.message);
				return;
			}

			const formattedImages = data.map(item => ({
				id: item.id,
				src: item.image_data,
				title: item.title,
				date: item.date_taken,
				time: item.time_taken,
				uploadedAt: new Date(item.uploaded_at).toLocaleString('bg-BG')
			}));

			setGalleryImages(formattedImages);
		} catch (error) {
			console.error('Error loading gallery:', error);
			setError('Грешка при зареждане на галерията: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	// Save image to Supabase
	const saveImageToDatabase = async (imageData) => {
		if (!supabase) {
			setError('База данни не е инициализирана');
			return false;
		}
		
		try {
			setUploading(true);
			setError(null);

			// Validate that all required fields are present
			if (!imageData.title || !imageData.image_data || !imageData.date_taken) {
				throw new Error('Missing required image data');
			}

			// Ensure image_data is a valid data URL
			if (!imageData.image_data.startsWith('data:image/')) {
				throw new Error('Invalid image data format');
			}

			// Add retry logic for mobile network issues
			let retries = 3;
			let lastError;
			
			while (retries > 0) {
				try {
					const { data, error } = await supabase
						.from('gallery_images')
						.insert([imageData])
						.select();

					if (error) {
						throw error;
					}

					return true;
				} catch (dbError) {
					console.error(`Database error (attempt ${4 - retries}):`, dbError);
					lastError = dbError;
					retries--;
					
					if (retries > 0) {
						// Wait before retrying (exponential backoff)
						await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
					}
				}
			}
			
			// If all retries failed
			console.error('All database retries failed:', lastError);
			setError('Грешка при качване на снимката: ' + (lastError?.message || 'Неизвестна грешка'));
			return false;
			
		} catch (error) {
			console.error('Error saving image:', error);
			setError('Грешка при качване на снимката: ' + error.message);
			return false;
		} finally {
			setUploading(false);
		}
	};

	// Delete image from Supabase
	const deleteImageFromDatabase = async (imageId) => {
		if (!supabase) {
			setError('База данни не е инициализирана');
			return false;
		}
		
		try {
			const { error } = await supabase
				.from('gallery_images')
				.delete()
				.eq('id', imageId);

			if (error) {
				console.error('Error deleting image:', error);
				setError('Грешка при изтриване на снимката: ' + error.message);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error deleting image:', error);
			setError('Грешка при изтриване на снимката: ' + error.message);
			return false;
		}
	};

	// Initial shuffle + blur on refresh + load gallery
	useEffect(() => {
		setShuffledImages(shuffleArray(images));
		const timer = setTimeout(() => setShowBlur(false), 500);
		return () => clearTimeout(timer);
	}, []);

	// Load gallery when Supabase is ready
	useEffect(() => {
		if (supabase) {
			loadGalleryFromDatabase();
		}
	}, [supabase]);

	// Setup modal sound
	useEffect(() => {
		audioRef.current = new Audio("/win.wav");
		audioRef.current.preload = "auto";
	}, []);

	// Play sound when modal opens
	useEffect(() => {
		if (showModal && audioRef.current) {
			audioRef.current.play();
		}
	}, [showModal]);

	function toggleSpin() {
		if (processing) return;
		setProcessing(true);

		const randomIndex = Math.floor(Math.random() * shuffledImages.length);
		const chosen = shuffledImages[randomIndex];
		const newOrder = [...shuffledImages];
		[newOrder[0], newOrder[randomIndex]] = [
			shuffledImages[randomIndex],
			shuffledImages[0],
		];

		setSelectedImage(chosen);
		setShuffledImages(newOrder);
		setIsSpinning(true);
		setShowBlur(true);

		setTimeout(() => {
			setIsSpinning(false);
			setTimeout(() => {
				setShowBlur(false);
				setTimeout(() => {
					setShowModal(true);
					setProcessing(false);
				}, 500);
			}, 2000);
		}, 3000);
	}

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

		try {
			setUploading(true);
			setError(null);

			// Get current date and time
			const now = new Date();
			const date = now.toISOString().split("T")[0]; // YYYY-MM-DD format
			const time = now.toLocaleTimeString('bg-BG', { 
				hour: '2-digit', 
				minute: '2-digit' 
			}); // HH:MM format

			// Process and compress image for mobile compatibility
			const imageDataUrl = await processImageForMobile(pendingFile);

			// Prepare image data
			const imageData = {
				title: newImageName.trim(),
				image_data: imageDataUrl,
				date_taken: date,
				time_taken: time
			};

			// Validate the data before saving
			if (!imageData.title || !imageData.image_data || !imageData.date_taken) {
				throw new Error('Missing required image data');
			}

			const success = await saveImageToDatabase(imageData);
			if (success) {
				// Reload gallery to show the new image
				await loadGalleryFromDatabase();
				// Close modal and reset state
				setShowRenameModal(false);
				setPendingFile(null);
				setNewImageName("");
			}
		} catch (error) {
			console.error('Error processing file:', error);
			setError('Грешка при обработка на файла: ' + error.message);
		} finally {
			setUploading(false);
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
		setError(null); // Clear any previous errors
		fileInputRef.current?.click();
	};

	const handleDeleteImage = async (imageId) => {
		if (window.confirm('Сигурни ли сте, че искате да изтриете тази снимка?')) {
			const success = await deleteImageFromDatabase(imageId);
			if (success) {
				// Remove from local state
				setGalleryImages((prevImages) => 
					prevImages.filter(img => img.id !== imageId)
				);
			}
		}
	};

	// Process image for mobile compatibility
	const processImageForMobile = async (file) => {
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

	const renderGameSection = () => (
		<div className="w-full max-w-4xl mx-auto px-3 sm:px-4">
			<h1 className="font-bold text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-3 sm:mt-5 text-center text-black mb-6 sm:mb-8 md:mb-12 leading-tight">
				За малката ❤️
				<br />
				завърти и се отпусни ❤️
			</h1>
			<div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
				<div className="relative mb-6 sm:mb-8 md:mb-12">
					<div
						className={`relative w-56 h-56 xs:w-64 xs:h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full border-3 xs:border-4 sm:border-6 md:border-8 border-gradient-to-r from-pink-400 via-purple-500 to-pink-600 flex items-center justify-center transition-all duration-500 shadow-2xl ${
							isSpinning ? "animate-spin-beautiful" : ""
						} ${showBlur ? "filter blur-md" : "filter blur-0"} touch-none select-none`}
						style={{
							background: "linear-gradient(45deg, #ff8fab, #ffb3c6, #ff8fab)",
							boxShadow:
								"0 0 30px rgba(255, 139, 171, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2)",
						}}
					>
						<div className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-50 to-pink-100 shadow-inner"></div>
						{shuffledImages.map((src, index) => {
							const startAngle = 90;
							const angle = startAngle + (360 / shuffledImages.length) * index;
							const radius =
								window.innerWidth < 360
									? 85
									: window.innerWidth < 480
										? 95
										: window.innerWidth < 640
											? 105
											: window.innerWidth < 768
												? 115
												: window.innerWidth < 1024
													? 125
													: 140;
							const x = radius * Math.cos((angle * Math.PI) / 180);
							const y = radius * Math.sin((angle * Math.PI) / 180);
							return (
								<div
									key={index}
									className="absolute w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full overflow-hidden shadow-lg active:scale-95 sm:hover:scale-110 transition-transform duration-200 touch-manipulation"
									style={{
										transform: `translate(${x}px, ${y}px)`,
										border: "2px solid white",
										boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
									}}
								>
									<img
										src={src}
										alt={`pose-${index}`}
										className="w-full h-full object-cover pointer-events-none"
									/>
								</div>
							);
						})}
						<div className="absolute inset-0 rounded-full animate-pulse-slow bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
					</div>

					<div className="flex justify-center mt-6 sm:mt-8">
						<button
							className="text-white font-love rounded-full px-6 py-3 xs:px-8 xs:py-4 sm:px-12 sm:py-5 md:px-16 md:py-6 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 active:from-rose-600 active:via-pink-600 active:to-fuchsia-600 sm:hover:from-rose-600 sm:hover:via-pink-600 sm:hover:to-fuchsia-600 border-2 sm:border-3 border-white shadow-2xl active:shadow-pink-500/50 sm:hover:shadow-pink-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-105 sm:hover:scale-110 active:translate-y-1 sm:hover:-translate-y-2 text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-wider animate-pulse touch-manipulation min-h-[48px] min-w-[120px] flex items-center justify-center"
							onClick={toggleSpin}
							disabled={processing}
							style={{
								boxShadow:
									"0 8px 25px rgba(236, 72, 153, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
							}}
						>
							{processing ? "💫 ВЪРТЕНЕ..." : "✨ SPIN ✨"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	const renderGallerySection = () => (
		<div className="w-full max-w-6xl mx-auto px-4">
			<h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-center text-black mb-8 sm:mb-12">
				📸 Споделена галерия ❤️
			</h2>
			
			{/* Error Display */}
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
					<p className="font-medium">⚠️ {error}</p>
					<button 
						onClick={() => setError(null)}
						className="mt-2 text-sm underline hover:no-underline"
					>
						Затвори
					</button>
				</div>
			)}
			
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

			{/* Loading State */}
			{loading && (
				<div className="flex justify-center items-center py-16">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
					<span className="ml-3 text-gray-600">Зареждане на галерията...</span>
				</div>
			)}

			{/* Gallery Content */}
			{!loading && galleryImages.length === 0 ? (
				// Placeholder when no images
				<div className="flex flex-col items-center justify-center py-16 sm:py-24">
					<div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md w-full mx-4 text-center">
						<div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center">
							<div className="text-6xl sm:text-7xl animate-pulse">📷</div>
						</div>
						<h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
							Празна галерия
						</h3>
						<p className="text-gray-600 text-base sm:text-lg mb-6 leading-relaxed">
							Все още няма снимки в споделената галерия. Добави първата снимка, която всички ще могат да видят! ✨
						</p>
						<button
							onClick={handleAddPhotoClick}
							disabled={uploading}
							className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
						>
							{uploading ? "Качване..." : "Добави първата снимка 🎉"}
						</button>
					</div>
				</div>
			) : !loading && (
				// Gallery Grid
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
					{galleryImages.map((item) => (
						<div
							key={item.id}
							className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative group"
						>
							{/* Delete button */}
							<button
								onClick={() => handleDeleteImage(item.id)}
								className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-sm font-bold"
								title="Изтрий снимката"
							>
								×
							</button>
							
							<div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-pink-100 to-purple-100">
								<img
									src={item.src}
									alt={item.title}
									className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
									onError={(e) => {
										console.error('Gallery image failed to load:', item.id, item.src);
										e.target.style.display = 'none';
										e.target.nextSibling.style.display = 'flex';
										// Show a user-friendly error message
										const parent = e.target.parentNode;
										if (parent) {
											let errorMsg = parent.querySelector('.img-error-msg');
											if (!errorMsg) {
												errorMsg = document.createElement('div');
												errorMsg.className = 'img-error-msg text-red-500 text-xs mt-2';
												errorMsg.innerText = 'Снимката не може да се зареди. Моля, опитайте с по-малък файл.';
												parent.appendChild(errorMsg);
											}
										}
									}}
								/>
								<div className="w-full h-full hidden items-center justify-center text-gray-400 text-4xl">
									📷
								</div>
							</div>
							
							<h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base line-clamp-2">
								{item.title}
							</h3>
							
							<div className="space-y-1">
								<p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1">
									<span>📅</span> {item.date}
								</p>
								{item.time && (
									<p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1">
										<span>🕐</span> {item.time}
									</p>
								)}
								{item.uploadedAt && (
									<p className="text-gray-500 text-xs flex items-center gap-1">
										<span>⬆️</span> {item.uploadedAt}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);

	const renderSnakeSection = () => (
		<div className="w-full max-w-4xl mx-auto px-4 text-center">
			<h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-8 sm:mb-12">
				🐍 Гадина секция 🐍
			</h2>
			<div className="bg-white rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl">
				<div className="text-4xl sm:text-6xl md:text-8xl mb-6 animate-bounce">
					🐍
				</div>
				<p className="text-gray-700 text-base sm:text-lg md:text-xl mb-6">
					Тази секция е за специални моменти... 😈
				</p>
				<button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
					Открий гадината 🐍
				</button>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
			{/* Navigation */}
			<nav className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-40 border-b border-pink-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16 sm:h-20">
						<div className="flex items-center">
							<span className="text-xl sm:text-2xl font-love text-pink-600">
								💕 МойApp
							</span>
						</div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex space-x-8">
							{["играй", "галерия", "гадина"].map((section) => (
								<button
									key={section}
									onClick={() => setActiveSection(section)}
									className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 capitalize ${
										activeSection === section
											? "bg-pink-500 text-white shadow-lg"
											: "text-gray-700 hover:bg-pink-100 hover:text-pink-600"
									}`}
								>
									{section === "играй" && "🎮"} {section === "галерия" && "📸"}{" "}
									{section === "гадина" && "🐍"} {section}
								</button>
							))}
						</div>

						{/* Mobile menu button */}
						<div className="md:hidden">
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="text-gray-700 hover:text-pink-600 focus:outline-none"
							>
								<svg
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							</button>
						</div>
					</div>

					{/* Mobile Navigation */}
					{mobileMenuOpen && (
						<div className="md:hidden bg-white border-t border-pink-200 py-4">
							{["играй", "галерия", "гадина"].map((section) => (
								<button
									key={section}
									onClick={() => {
										setActiveSection(section);
										setMobileMenuOpen(false);
									}}
									className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 capitalize mb-2 ${
										activeSection === section
											? "bg-pink-500 text-white"
											: "text-gray-700 hover:bg-pink-100 hover:text-pink-600"
									}`}
								>
									{section === "играй" && "🎮"} {section === "галерия" && "📸"}{" "}
									{section === "гадина" && "🐍"} {section}
								</button>
							))}
						</div>
					)}
				</div>
			</nav>

			{/* Main Content */}
			<main className="py-8 sm:py-12 md:py-16 lg:py-20">
				{activeSection === "играй" && renderGameSection()}
				{activeSection === "галерия" && renderGallerySection()}
				{activeSection === "гадина" && renderSnakeSection()}
			</main>

			{/* Rename Modal */}
			{showRenameModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
					<div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col max-w-md w-full mx-4 shadow-2xl">
						<h2 className="text-xl sm:text-2xl mb-4 font-semibold text-gray-800 text-center">
							📝 Име на снимката
						</h2>
						
						{/* Preview of selected image */}
						{pendingFile && (
							<div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden bg-gray-100">
								<ImagePreview file={pendingFile} />
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
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
								maxLength={100}
								autoFocus
							/>
							<p className="text-xs text-gray-500 mt-1">
								{newImageName.length}/100 символа
							</p>
						</div>
						
						{error && (
							<div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
								⚠️ {error}
							</div>
						)}
						
						<div className="flex gap-3">
							<button
								onClick={handleCancelUpload}
								disabled={uploading}
								className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg font-semibold transition-all duration-300"
							>
								Отказ
							</button>
							<button
								onClick={handleConfirmUpload}
								disabled={uploading || !newImageName.trim()}
								className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
							>
								{uploading ? "Качване..." : "Качи ✨"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Game Result Modal */}
			{showModal && selectedImage && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
					<div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center max-w-sm sm:max-w-md w-full mx-4 shadow-2xl">
						<h2 className="text-xl sm:text-2xl mb-4 font-love text-pink-600 animate-bounce">
							🎉 Поздравления! 🎉
						</h2>
						<div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden mb-6 shadow-lg">
							<Image
								src={selectedImage}
								alt="Selected Pose"
								width={300}
								height={300}
								className="w-full h-full object-cover"
							/>
						</div>
						<button
							className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
							onClick={() => setShowModal(false)}
						>
							Затвори ✨
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

// Separate component for image preview to handle mobile issues
function ImagePreview({ file }) {
	const [previewUrl, setPreviewUrl] = useState(null);
	const [error, setError] = useState(false);
	
	useEffect(() => {
		if (!file) return;
		
		try {
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
			
			// Cleanup function
			return () => {
				URL.revokeObjectURL(url);
			};
		} catch (error) {
			console.error('Failed to create preview URL:', error);
			setError(true);
		}
	}, [file]);
	
	if (error || !previewUrl) {
		return (
			<div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">
				📷
			</div>
		);
	}
	
	return (
		<img
			src={previewUrl}
			alt="Preview"
			className="w-full h-full object-cover"
			onError={() => setError(true)}
		/>
	);
}