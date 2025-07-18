import { useState, useEffect } from "react";
import { useSupabase } from "./useSupabase";
import { processImageForMobile } from "../utils/imageUtils";

export function useGallery() {
	const [galleryImages, setGalleryImages] = useState([]);
	const [uploading, setUploading] = useState(false);
	const { 
		supabase, 
		loading, 
		error, 
		setError, 
		saveImageToDatabase, 
		deleteImageFromDatabase, 
		loadGalleryFromDatabase 
	} = useSupabase();

	// Load gallery when Supabase is ready
	useEffect(() => {
		if (supabase) {
			loadGallery();
		}
	}, [supabase]);

	const loadGallery = async () => {
		const images = await loadGalleryFromDatabase();
		setGalleryImages(images);
	};

	const handleImageUpload = async (file, imageName) => {
		try {
			setUploading(true);
			setError(null);

			// Additional validation
			if (!file) {
				throw new Error('Няма избран файл');
			}

			if (!imageName || imageName.trim().length === 0) {
				throw new Error('Моля въведете име за снимката');
			}

			// Get current date and time
			const now = new Date();
			const date = now.toISOString().split("T")[0]; // YYYY-MM-DD format
			const time = now.toLocaleTimeString('bg-BG', { 
				hour: '2-digit', 
				minute: '2-digit' 
			}); // HH:MM format

			// Process and compress image for mobile compatibility
			const imageDataUrl = await processImageForMobile(file);

			// Prepare image data
			const imageData = {
				title: imageName.trim(),
				image_data: imageDataUrl,
				date_taken: date,
				time_taken: time
			};

			// Validate the data before saving
			if (!imageData.title || !imageData.image_data || !imageData.date_taken) {
				throw new Error('Липсват задължителни данни за снимката');
			}

			const success = await saveImageToDatabase(imageData);
			if (success) {
				// Reload gallery to show the new image
				await loadGallery();
				return true;
			}
			return false;
		} catch (error) {
			console.error('Error processing file:', error);
			
			// Provide more user-friendly error messages
			let errorMessage = error.message;
			if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
				errorMessage = 'Грешка в мрежата. Моля проверете интернет връзката и опитайте отново.';
			} else if (error.message.includes('timeout')) {
				errorMessage = 'Времето за обработка изтече. Моля опитайте с по-малък файл.';
			}
			
			setError(errorMessage);
			return false;
		} finally {
			setUploading(false);
		}
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

	return {
		galleryImages,
		loading,
		uploading,
		error,
		setError,
		handleImageUpload,
		handleDeleteImage,
		loadGallery
	};
}