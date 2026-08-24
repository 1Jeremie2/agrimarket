'use client';

import { useEffect, useState } from 'react';

const SLIDE_DURATION = 5000; // 5 secondes par image

export function HeroCarousel({ images }: { images: { id: string; imageUrl: string; altText?: string }[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [images.length]);

  // Tant qu'aucune image n'est configurée par l'admin, on garde le fond
  // dégradé actuel plutôt que d'afficher un carrousel vide.
  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {images.map((img, index) => (
        <div
          key={img.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={img.imageUrl} alt={img.altText ?? ''} className="h-full w-full object-cover" />
          {/* Voile sombre pour garder le texte du hero lisible par-dessus */}
          <div className="absolute inset-0 bg-gradient-to-b from-forest/25 via-forest/10 to-white/90" />
        </div>
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setCurrent(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
