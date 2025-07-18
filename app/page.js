"use client";
import { useState } from "react";
import Navigation from "./components/Navigation";
import GameSection from "./components/GameSection";
import GallerySection from "./components/GallerySection";
import SnakeSection from "./components/SnakeSection";
import { useGallery } from "./hooks/useGallery";

export default function Home() {
	const [activeSection, setActiveSection] = useState("играй");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	
	const {
		galleryImages,
		loading,
		uploading,
		error,
		setError,
		handleImageUpload,
		handleDeleteImage
	} = useGallery();

	const renderCurrentSection = () => {
		switch (activeSection) {
			case "играй":
				return <GameSection />;
			case "галерия":
				return (
					<GallerySection
						galleryImages={galleryImages}
						loading={loading}
						error={error}
						setError={setError}
						onImageUpload={handleImageUpload}
						onDeleteImage={handleDeleteImage}
						uploading={uploading}
					/>
				);
			case "гадина":
				return <SnakeSection />;
			default:
				return <GameSection />;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
			{/* Navigation */}
			<Navigation
				activeSection={activeSection}
				setActiveSection={setActiveSection}
				mobileMenuOpen={mobileMenuOpen}
				setMobileMenuOpen={setMobileMenuOpen}
			/>

			{/* Main Content */}
			<main className="py-8 sm:py-12 md:py-16 lg:py-20">
				{renderCurrentSection()}
			</main>
		</div>
	);
}