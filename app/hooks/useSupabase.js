import { useState, useEffect } from "react";

export function useSupabase() {
	const [supabase, setSupabase] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

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

	const saveImageToDatabase = async (imageData) => {
		if (!supabase) {
			setError('База данни не е инициализирана');
			return false;
		}
		
		try {
			setLoading(true);
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
			setLoading(false);
		}
	};

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

	const loadGalleryFromDatabase = async () => {
		if (!supabase) {
			console.log('Supabase not initialized yet');
			return [];
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
				return [];
			}

			const formattedImages = data.map(item => ({
				id: item.id,
				src: item.image_data,
				title: item.title,
				date: item.date_taken,
				time: item.time_taken,
				uploadedAt: new Date(item.uploaded_at).toLocaleString('bg-BG')
			}));

			return formattedImages;
		} catch (error) {
			console.error('Error loading gallery:', error);
			setError('Грешка при зареждане на галерията: ' + error.message);
			return [];
		} finally {
			setLoading(false);
		}
	};

	return {
		supabase,
		loading,
		error,
		setError,
		saveImageToDatabase,
		deleteImageFromDatabase,
		loadGalleryFromDatabase
	};
}