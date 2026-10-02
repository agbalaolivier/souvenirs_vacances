// Définitions géométriques partagées des formes de découpe, sur un repère 0-100
// (proportionnel à la taille réelle affichée). Utilisé à la fois par ShapedImage.js
// (mobile, via react-native-svg) et ShapedImage.web.js (web, via <svg> natif),
// pour garantir un rendu identique et correctement centré quelle que soit la taille.
//
// Chaque forme est volontairement "insérée" avec une marge par rapport aux bords du
// carré (au lieu de toucher 0/100) : ça évite que les pointes (étoile, losange...)
// n'aillent chercher les coins de la photo, et centre mieux le sujet visible.
// Les contours ont aussi été arrondis pour un rendu plus moderne (type "sticker").

export const SHAPE_DEFS = {
  'shape-circle': { type: 'circle', cx: 50, cy: 50, r: 42 },

  'shape-portrait': { type: 'rect', x: 18, y: 4, width: 64, height: 92, rx: 8 },

  'shape-landscape': { type: 'rect', x: 4, y: 18, width: 92, height: 64, rx: 8 },

  'shape-oval': {
    type: 'path',
    d: 'M50,14 C73.20,14 92,30.12 92,50 C92,69.88 73.20,86 50,86 C26.80,86 8,69.88 8,50 C8,30.12 26.80,14 50,14 Z',
  },

  'shape-arch': {
    type: 'path',
    d: 'M12,94 L12,46 C12,24.91 28.91,8 50,8 C71.09,8 88,24.91 88,46 L88,94 Z',
  },

  'shape-torn': {
    type: 'path',
    d: 'M13,8 L86,8 L91,19 L87,29 L93,40 L88,51 L93,62 L87,73 L92,83 L86,93 L14,93 L8,83 L13,72 L7,61 L12,50 L7,39 L13,28 L8,18 Z',
  },

  'shape-film': {
    type: 'path',
    d: 'M18,6 L82,6 Q94,6 94,18 L88,23 L94,28 L88,33 L94,38 L88,43 L94,48 L88,53 L94,58 L88,63 L94,68 L88,73 L94,78 L88,83 L94,88 Q94,94 82,94 L18,94 Q6,94 6,82 L12,77 L6,72 L12,67 L6,62 L12,57 L6,52 L12,47 L6,42 L12,37 L6,32 L12,27 L6,22 L12,17 Q6,6 18,6 Z',
  },

  'shape-diamond': {
    type: 'path',
    d: 'M43.64,10.36 Q50.00,4.00 56.36,10.36 L89.64,43.64 Q96.00,50.00 89.64,56.36 L56.36,89.64 Q50.00,96.00 43.64,89.64 L10.36,56.36 Q4.00,50.00 10.36,43.64 Z',
  },

  'shape-hexagon': {
    type: 'path',
    d: 'M65.00,11.89 Q72.00,11.89 75.50,17.96 L90.50,43.94 Q94.00,50.00 90.50,56.06 L75.50,82.04 Q72.00,88.11 65.00,88.11 L35.00,88.11 Q28.00,88.11 24.50,82.04 L9.50,56.06 Q6.00,50.00 9.50,43.94 L24.50,17.96 Q28.00,11.89 35.00,11.89 Z',
  },

  'shape-star': {
    type: 'path',
    d: 'M48.92,9.01 Q50.00,6.00 51.08,9.01 L59.50,32.43 Q60.58,35.44 63.78,35.54 L88.65,36.30 Q91.85,36.40 89.32,38.36 L69.65,53.60 Q67.12,55.56 68.01,58.63 L74.97,82.52 Q75.86,85.60 73.22,83.80 L52.65,69.80 Q50.00,68.00 47.35,69.80 L26.78,83.80 Q24.14,85.60 25.03,82.52 L31.99,58.63 Q32.88,55.56 30.35,53.60 L10.68,38.36 Q8.15,36.40 11.35,36.30 L36.22,35.54 Q39.42,35.44 40.50,32.43 Z',
  },

  'shape-bubble': {
    type: 'path',
    d: 'M10.00,14.00 Q10.00,8.00 16.00,8.00 L84.00,8.00 Q90.00,8.00 90.00,14.00 L90.00,64.00 Q90.00,70.00 84.00,70.00 L40.00,70.00 Q34.00,70.00 31.52,75.46 L26.48,86.54 Q24.00,92.00 24.00,86.00 L24.00,76.00 Q24.00,70.00 18.00,70.00 L16.00,70.00 Q10.00,70.00 10.00,64.00 Z',
  },

  'shape-heart': {
    type: 'path',
    d: 'M50.00,21.34 C50.00,21.34 41.40,7.00 28.50,7.00 C16.31,7.00 7.00,16.31 7.00,28.50 C7.00,45.70 50.00,85.84 50.00,85.84 C50.00,85.84 93.00,45.70 93.00,28.50 C93.00,16.31 83.69,7.00 71.50,7.00 C58.60,7.00 50.00,21.34 50.00,21.34 Z',
  },

  'shape-cloud': {
    type: 'path',
    d: 'M20.00,64.50 C11.00,64.50 5.00,58.50 5.00,49.50 C5.00,42.00 9.50,36.00 16.25,33.75 C14.75,30.75 14.00,27.75 14.00,24.75 C14.00,15.75 22.25,8.25 31.25,8.25 C37.25,8.25 42.50,11.25 45.50,16.50 C48.50,12.00 54.50,8.25 61.25,8.25 C71.00,8.25 78.50,16.50 78.50,26.25 C78.50,27.75 78.50,29.25 77.75,30.75 C86.00,32.25 91.25,39.00 91.25,46.50 C91.25,56.25 83.00,64.50 73.25,64.50 Z',
  },

  // Trèfle : 4 cercles se chevauchant (union) — donne une silhouette de fleur/trèfle
  'shape-clover': {
    type: 'group',
    circles: [
      { cx: 32, cy: 32, r: 24 },
      { cx: 68, cy: 32, r: 24 },
      { cx: 32, cy: 68, r: 24 },
      { cx: 68, cy: 68, r: 24 },
    ],
  },

  'shape-stamp': {
    type: 'path',
    d: 'M12.00,10.00 Q17.80,13.20 23.60,10.00 Q32.40,13.20 41.20,10.00 Q50.00,13.20 58.80,10.00 Q67.60,13.20 76.40,10.00 Q82.20,13.20 88.00,10.00 Q94.00,10.00 94.00,16.00 L94.00,84.00 Q94.00,90.00 88.00,90.00 Q82.20,86.80 76.40,90.00 Q67.60,86.80 58.80,90.00 Q50.00,86.80 41.20,90.00 Q32.40,86.80 23.60,90.00 Q17.80,86.80 12.00,90.00 Q6.00,90.00 6.00,84.00 L6.00,16.00 Q6.00,10.00 12.00,10.00 Z',
  },

  // Carré : géré à part (simple rectangle arrondi, pas de découpe complexe nécessaire)
  'shape-square': { type: 'rect', x: 0, y: 0, width: 100, height: 100, rx: 10 },
  'shape-original': { type: 'rect', x: 0, y: 0, width: 100, height: 100, rx: 0 },
};

export default SHAPE_DEFS;