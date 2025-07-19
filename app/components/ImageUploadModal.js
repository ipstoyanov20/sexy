import { useState, useEffect } from "react";
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

	return (
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
				
				<ErrorMessage error={error} />
				
				<div className="flex gap-3">
					<button
						onClick={onCancel}
						disabled={uploading}
						className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg font-semibold transition-all duration-300"
					>
						Отказ
					</button>
					<button
						onClick={onConfirm}
						disabled={uploading || !newImageName.trim()}
						className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
					>
						{uploading ? "Качване..." : "Качи ✨"}
					</button>
				</div>
			</div>
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