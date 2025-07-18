export default function ErrorMessage({ error, onDismiss }) {
	if (!error) return null;

	return (
		<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
			<p className="font-medium">⚠️ {error}</p>
			{onDismiss && (
				<button 
					onClick={onDismiss}
					className="mt-2 text-sm underline hover:no-underline"
				>
					Затвори
				</button>
			)}
		</div>
	);
}