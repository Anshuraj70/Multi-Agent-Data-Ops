"use client";
interface SearchButtonProps {
  isLoading: boolean;
}

export default function SearchButton({ isLoading}: SearchButtonProps ) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full px-6 py-3 bg-blue-600 hover:bg-blu-700 disabled:bg-zinc-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span className="flex items-center justify-center space-x-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>Processing ....</span>
        </span>
      ) : (
        "Generate Blog Post"
      )}
    </button>
  );
}
