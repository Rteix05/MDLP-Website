'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error for debugging
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error('GlobalError:', error);
  }
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans text-gray-900 px-6">
      <h1 className="text-[120px] md:text-[200px] font-black leading-none tracking-tighter text-gray-900">
        500
      </h1>
      <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-gray-400 mb-12">
        Une erreur est survenue
      </p>
      <button
        onClick={() => reset()}
        className="bg-black text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition"
      >
        Réessayer
      </button>
    </div>
  );
}
