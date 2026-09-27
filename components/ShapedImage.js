import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Defs, ClipPath, Circle, Path, Image as SvgImage } from 'react-native-svg';

// Ce fichier n'est chargé que sur iOS/Android : Metro utilise automatiquement
// "ShapedImage.web.js" à la place de celui-ci pour la cible web (voir ce fichier
// pour l'explication complète). Aucune vérification Platform.OS n'est donc nécessaire ici.

// Découpes converties depuis les clip-path CSS de la version web, remises à l'échelle
// sur un repère 0-100 (proportionnel, indépendant de la taille réelle affichée).
const SHAPE_DEFS = {
  'shape-heart': (
    <Path d="M50,16.67 C50,16.67 40,0 25,0 C10.83,0 0,10.83 0,25 C0,45 50,91.67 50,91.67 C50,91.67 100,45 100,25 C100,10.83 89.17,0 75,0 C60,0 50,16.67 50,16.67 Z" />
  ),
  'shape-circle': <Circle cx="50" cy="50" r="50" />,
  'shape-star': (
    <Path d="M50,0 L61,35 L98,35 L68,57 L79,91 L50,70 L21,91 L32,57 L2,35 L39,35 Z" />
  ),
  'shape-diamond': <Path d="M50,0 L100,50 L50,100 L0,50 Z" />,
  'shape-hexagon': <Path d="M25,0 L75,0 L100,50 L75,100 L25,100 L0,50 Z" />,
  'shape-bubble': <Path d="M0,0 L100,0 L100,75 L35,75 L15,100 L15,75 L0,75 Z" />,
  'shape-clover': (
    <Path d="M50,8.33 C56.67,0 70,0 76.67,8.33 C83.33,16.67 83.33,29.17 76.67,35.83 C83.33,42.5 83.33,57.5 76.67,64.17 C70,70.83 56.67,70.83 50,64.17 C43.33,70.83 30,70.83 23.33,64.17 C16.67,57.5 16.67,42.5 23.33,35.83 C16.67,29.17 16.67,16.67 23.33,8.33 C30,0 43.33,0 50,8.33 Z" />
  ),
  'shape-cloud': (
    <Path d="M16.67,66.67 C6.67,66.67 0,60 0,50 C0,41.67 5,35 12.5,32.5 C10.83,29.17 10,25.83 10,22.5 C10,12.5 19.17,4.17 29.17,4.17 C35.83,4.17 41.67,7.5 45,13.33 C48.33,8.33 55,4.17 62.5,4.17 C73.33,4.17 81.67,13.33 81.67,24.17 C81.67,25.83 81.67,27.5 80.83,29.17 C90,30.83 95.83,38.33 95.83,46.67 C95.83,57.5 86.67,66.67 75.83,66.67 Z" />
  ),
  'shape-stamp': (
    <Path d="M0,0 L10,5 L20,0 L30,5 L40,0 L50,5 L60,0 L70,5 L80,0 L90,5 L100,0 L100,100 L90,95 L80,100 L70,95 L60,100 L50,95 L40,100 L30,95 L20,100 L10,95 L0,100 Z" />
  ),
};

// size : taille d'affichage en pixels (par défaut 120).
// instanceId : identifiant optionnel (ex. l'index dans une liste) pour garantir des
// clipPath id uniques quand plusieurs ShapedImage de la même forme sont rendus ensemble.
export default function ShapedImage({ uri, shape, size = 120, instanceId = '' }) {
  if (shape === 'shape-square' || !SHAPE_DEFS[shape]) {
    return (
      <View style={styles.container}>
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: 8 }} resizeMode="cover" />
      </View>
    );
  }

  const clipId = `shaped-image-clip-${shape}-${instanceId}`;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <ClipPath id={clipId}>{SHAPE_DEFS[shape]}</ClipPath>
        </Defs>
        {/* href pour react-native-svg récent, xlinkHref pour compat versions plus anciennes */}
        <SvgImage
          href={uri}
          xlinkHref={uri}
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});