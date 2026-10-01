import { useState, useEffect } from 'react';
import { Image, Platform } from 'react-native';

// Petit cache pour éviter de relire la taille d'une même image à chaque rendu.
const sizeCache = {};

// Retourne { w, h } (dimensions réelles de l'image) ou null tant qu'elle n'est pas chargée.
export default function useImageSize(uri) {
  const [size, setSize] = useState(uri && sizeCache[uri] ? sizeCache[uri] : null);

  useEffect(() => {
    if (!uri) return undefined;
    if (sizeCache[uri]) {
      setSize(sizeCache[uri]);
      return undefined;
    }

    let cancelled = false;
    const done = (w, h) => {
      if (cancelled || !w || !h) return;
      sizeCache[uri] = { w, h };
      setSize(sizeCache[uri]);
    };

    if (Platform.OS === 'web') {
      const img = new window.Image();
      img.onload = () => done(img.naturalWidth, img.naturalHeight);
      img.src = uri;
    } else {
      Image.getSize(uri, (w, h) => done(w, h), () => {});
    }

    return () => {
      cancelled = true;
    };
  }, [uri]);

  return size;
}