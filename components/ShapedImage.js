import React from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';

export default function ShapedImage({ uri, shape }) {
  const size = 120;

  if (Platform.OS === 'web') {
    // Application d'un clip-path selon la forme choisie
    const getWebClipPath = () => {
      switch (shape) {
        case 'shape-heart':
          return 'path("M 60,20 C 60,20 48,0 30,0 C 13,0 0,13 0,30 C 0,54 60,110 60,110 C 60,110 120,54 120,30 C 120,13 107,0 90,0 C 72,0 60,20 60,20 Z")';
        case 'shape-circle':
          return 'circle(50% at 50% 50%)';
        case 'shape-star':
          return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        case 'shape-diamond':
          return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
        case 'shape-hexagon':
          return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
        case 'shape-bubble':
          return 'polygon(0% 0%, 100% 0%, 100% 75%, 35% 75%, 15% 100%, 15% 75%, 0% 75%)';
        case 'shape-clover':
          return 'path("M 60,10 C 68,0 84,0 92,10 C 100,20 100,35 92,43 C 100,51 100,69 92,77 C 84,85 68,85 60,77 C 52,85 36,85 28,77 C 20,69 20,51 28,43 C 20,35 20,20 28,10 C 36,0 52,0 60,10 Z")';
        case 'shape-cloud':
          return 'path("M 20,80 C 8,80 0,72 0,60 C 0,50 6,42 15,39 C 13,35 12,31 12,27 C 12,15 23,5 35,5 C 43,5 50,9 54,16 C 58,10 66,5 75,5 C 88,5 98,16 98,29 C 98,31 98,33 97,35 C 108,37 115,46 115,56 C 115,69 104,80 91,80 Z")';
        case 'shape-stamp':
          return 'polygon(0% 0%, 10% 5%, 20% 0%, 30% 5%, 40% 0%, 50% 5%, 60% 0%, 70% 5%, 80% 0%, 90% 5%, 100% 0%, 100% 100%, 90% 95%, 80% 100%, 70% 95%, 60% 100%, 50% 95%, 40% 100%, 30% 95%, 20% 100%, 10% 95%, 0% 100%)';
        default:
          return shape === 'shape-square' ? '8px' : 'none';
      }
    };

    const isSquare = shape === 'shape-square';

    return (
      <View style={styles.webContainer}>
        <img
          src={uri}
          alt="Souvenir"
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
            borderRadius: isSquare ? '8px' : '0px',
            WebkitClipPath: isSquare ? 'none' : getWebClipPath(),
            clipPath: isSquare ? 'none' : getWebClipPath(),
            display: 'block',
          }}
        />
      </View>
    );
  }

  // Rendu Mobile Natif
  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={{ width: size, height: size, borderRadius: 8 }} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  webContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
});