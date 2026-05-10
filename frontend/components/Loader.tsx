'use client';

export default function Loader() {
  return (

    <div className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center bg-white/30 backdrop-blur-sm transition-all">
      
      {/* Conteneur du spinner */}
      <div className="relative">
        
        {/* Cercle arrière (gris clair immobile MAZZA ) */}
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        
        {/* Cercle avant (noir qui tourne) */}
        {/* 'border-t-transparent' crée l'effet de "trou" dans le cercle */}
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      
      </div>
    </div>
  );
}