'use client';

export default function Loader() {
  return (
    // MODIFICATIONS ICI :
    // 1. 'fixed top-0 left-0' : Colle le loader en haut à gauche de la fenêtre
    // 2. 'w-screen h-screen' : Force la taille de l'écran entier
    // 3. 'z-[9999]' : S'assure qu'il est au-dessus de tout (même de la navbar)
    <div className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center bg-white/30 backdrop-blur-sm transition-all">
      
      {/* Conteneur du spinner */}
      <div className="relative">
        
        {/* Cercle arrière (gris clair immobile) */}
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        
        {/* Cercle avant (noir qui tourne) */}
        {/* 'border-t-transparent' crée l'effet de "trou" dans le cercle */}
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      
      </div>
    </div>
  );
}