export default function LoadingSpinner({ message = "Зареждане..." }) {
	return (
		<div className="flex justify-center items-center py-16">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
			<span className="ml-3 text-gray-600">{message}</span>
		</div>
	);
}