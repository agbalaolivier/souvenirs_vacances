import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, ClipPath, Rect, Circle, Path, Image as SvgImage } from 'react-native-svg';
import { SHAPE_DEFS } from './Shapepaths';

// Ce fichier n'est chargé que sur iOS/Android (Metro utilise ShapedImage.web.js pour le web).
//
// FIX important : toutes les formes utilisent maintenant un <clipPath> SVG avec un
// viewBox "0 0 100 100" qui s'adapte automatiquement à la taille demandée (prop "size"),
// contrairement à l'ancienne version où certaines formes (cœur, trèfle, nuage) étaient
// mal cadrées dès que la taille changeait (ex. une seule photo affichée en plus grand).

function renderClipContent(def) {
  if (!def) return null;
  if (def.type === 'circle') {
    return <Circle cx={def.cx} cy={def.cy} r={def.r} />;
  }
  if (def.type === 'rect') {
    return <Rect x={def.x} y={def.y} width={def.width} height={def.height} rx={def.rx} ry={def.rx} />;
  }
  if (def.type === 'group') {
    return (
      <React.Fragment>
        {def.circles.map((c, i) => (
          <Circle key={i} cx={c.cx} cy={c.cy} r={c.r} />
        ))}
      </React.Fragment>
    );
  }
  return <Path d={def.d} />;
}

// size : taille d'affichage en pixels (par défaut 120).
// instanceId : identifiant optionnel (ex. l'index dans une liste) pour garantir des
// clipPath id uniques quand plusieurs ShapedImage de la même forme sont rendus ensemble.
export default function ShapedImage({ uri, shape, size = 120, instanceId = '', photoObj }) {
  const imageSize = useImageSize(uri);
  const focus = resolveFocus(imageSize, photoObj);
  const frame = imageSize
    ? computeFraming(imageSize.w, imageSize.h, focus.x, focus.y, focus.zoom)
    : { x: 0, y: 0, width: 100, height: 100 };
  const def = SHAPE_DEFS[shape] || SHAPE_DEFS['shape-square'];
  const clipId = `shaped-image-clip-${shape}-${instanceId}`;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <ClipPath id={clipId}>{renderClipContent(def)}</ClipPath>
        </Defs>
        {/* href pour react-native-svg récent, xlinkHref pour compat versions plus anciennes */}
        <SvgImage
          href={uri}
          xlinkHref={uri}
            x={frame.x}
            y={frame.y}
            width={frame.width}
            height={frame.height}
            preserveAspectRatio={imageSize ? 'none' : 'xMidYMid slice'}
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