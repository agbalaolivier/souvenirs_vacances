// Calcul du recadrage d'une photo dans une forme (boîte 100x100).
//
// Principe : la photo est agrandie pour COUVRIR la boîte (comme "cover"), puis on choisit
// quelle partie de la photo est visible grâce à un point focal (focusX / focusY, entre
// 0 et 1) et à un zoom (>= 1). focus = 0.5 → centré ; 0 → bord haut/gauche ; 1 → bas/droite.

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Point focal par défaut : les visages sont presque toujours dans le tiers haut d'une photo
// portrait, donc pour les images en hauteur on cadre plus haut au lieu du centre exact
// (sinon les têtes sont coupées). Les photos paysage/carrées restent centrées.
export function defaultFocus(natW, natH) {
  const ratio = natH / natW;
  return { x: 0.5, y: ratio > 1.15 ? 0.3 : 0.5 };
}

// Fusionne le focus choisi par l'utilisateur (éventuellement partiel) avec les valeurs par défaut.
export function resolveFocus(nat, focus) {
  const base = nat ? defaultFocus(nat.w, nat.h) : { x: 0.5, y: 0.5 };
  return {
    x: typeof focus?.x === 'number' ? clamp(focus.x, 0, 1) : base.x,
    y: typeof focus?.y === 'number' ? clamp(focus.y, 0, 1) : base.y,
    zoom: typeof focus?.zoom === 'number' ? clamp(focus.zoom, MIN_ZOOM, MAX_ZOOM) : 1,
  };
}

// Retourne le rectangle (en unités de la boîte 100x100) où dessiner l'image entière.
// Le reste dépasse de la boîte et est masqué par la forme.
export function computeFraming(natW, natH, focusX, focusY, zoom) {
  const scale = Math.max(100 / natW, 100 / natH) * zoom;
  const width = natW * scale;
  const height = natH * scale;
  return {
    x: -(width - 100) * focusX,
    y: -(height - 100) * focusY,
    width,
    height,
    overflowX: width - 100,
    overflowY: height - 100,
  };
}