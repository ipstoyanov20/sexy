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
				title: imageName,
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
				await loadGallery();
				return true;
			}
			return false;
		} catch (error) {
			console.error('Error processing file:', error);
			setError('Грешка при обработка на файла: ' + error.message);
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