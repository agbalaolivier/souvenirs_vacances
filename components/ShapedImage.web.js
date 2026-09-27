import React from 'react';
import { SHAPE_DEFS } from './Shapepaths';

// FIX : ce fichier porte le suffixe ".web.js" — Metro (le bundler d'Expo) le charge
// automatiquement à la place de "ShapedImage.js" uniquement pour la cible web.
// Il utilise du SVG natif (balises <svg>/<clipPath> du navigateur), donc aucun import
// de "react-native-svg" ici — ce module reste indépendant de cette librairie mobile,
// pour ne jamais faire planter le bundle web si elle n'est pas installée.
//
// FIX important : avant, certaines formes (cœur, trèfle, nuage) utilisaient
// clip-path: path() en unités absolues, qui ne s'adapte PAS à la taille de l'image.
// Résultat : avec une seule photo affichée en plus grand, ces formes étaient mal
// cadrées/décentrées. Toutes les formes utilisent maintenant un <clipPath> SVG avec
// viewBox "0 0 100 100", qui s'adapte automatiquement à la prop "size".

function renderClipContent(def, keyPrefix) {
  if (!def) return null;
  if (def.type === 'circle') {
    return <circle cx={def.cx} cy={def.cy} r={def.r} />;
  }
  if (def.type === 'rect') {
    return <rect x={def.x} y={def.y} width={def.width} height={def.height} rx={def.rx} ry={def.rx} />;
  }
  if (def.type === 'group') {
    return (
      <>
        {def.circles.map((c, i) => (
          <circle key={`${keyPrefix}-${i}`} cx={c.cx} cy={c.cy} r={c.r} />
        ))}
      </>
    );
  }
  return <path d={def.d} />;
}

export default function ShapedImage({ uri, shape, size = 120 }) {
  const def = SHAPE_DEFS[shape] || SHAPE_DEFS['shape-square'];
  const clipId = `shaped-image-clip-web-${shape || 'square'}-${Math.round(size)}`;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <clipPath id={clipId}>{renderClipContent(def, clipId)}</clipPath>
        </defs>
        <image
          href={uri}
          xlinkHref={uri}
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      </svg>
    </div>
  );
}