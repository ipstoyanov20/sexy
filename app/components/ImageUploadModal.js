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
				
				{/* Simple Image Preview */}
				{pendingFile && (
					<div className="w-full mb-4">
						<SimpleImagePreview 
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

// Simple image preview component - no loading states, just show the image
function SimpleImagePreview({ file }) {
	const [previewUrl, setPreviewUrl] = useState(null);
	const objectUrlRef = useRef(null);
	
	// Create preview URL immediately when file changes
	useEffect(() => {
		if (!file) {
			setPreviewUrl(null);
			return;
		}
		
		// Clean up previous URL
		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current);
		}
		
		// Create new URL
		try {
			const url = URL.createObjectURL(file);
			objectUrlRef.current = url;
			setPreviewUrl(url);
		} catch (error) {
			console.error('Failed to create preview URL:', error);
			setPreviewUrl(null);
		}
		
		// Cleanup function
		return () => {
			if (objectUrlRef.current) {
				URL.revokeObjectURL(objectUrlRef.current);
				objectUrlRef.current = null;
			}
		};
	}, [file]);
	
	// Don't show anything if no URL
	if (!previewUrl) {
		return null;
	}
	
	// Show image immediately
	return (
		<div className="w-full">
			<div className="aspect-square max-h-64 bg-gray-50 rounded-xl overflow-hidden shadow-inner border">
				<img
					src={previewUrl}
					alt="Preview"
					className="w-full h-full object-cover"
					style={{
						imageRendering: 'auto',
						backfaceVisibility: 'hidden',
						transform: 'translateZ(0)',
					}}
				/>
			</div>
			
			{/* Simple file info */}
			<div className="mt-2 text-xs text-gray-500 text-center">
				<p>📁 {file?.name || 'Неизвестен файл'}</p>
				<p>📏 {file?.size ? Math.round(file.size / 1024) + ' KB' : 'Неизвестен размер'}</p>
			</div>
		</div>
	);
}