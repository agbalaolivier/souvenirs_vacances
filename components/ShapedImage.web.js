import React from 'react';
import { SHAPE_DEFS } from './Shapepaths';
import useimageSize from './useimageSize';
import { resolveFocus, computeFraming } from './Imageframing';
import PhotoAdjuster from './PhotoAdjuster';

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

export default function ShapedImage({ uri, shape, size = 110, photoObj }) {
  const imageSize = useimageSize(uri);
  const focus = resolveFocus(imageSize, photoObj);
  const frame = imageSize
    ? computeFraming(imageSize.w, imageSize.h, focus.x, focus.y, focus.zoom)
    : { x: 0, y: 0, width: 100, height: 100 };
  const def = SHAPE_DEFS[shape] || SHAPE_DEFS['shape-square'];
  const clipId = `shaped-image-clip-web-${shape}-${Math.round(size)}`;

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
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
        <defs>
          <clipPath id={clipId}>{renderClipContent(def, clipId)}</clipPath>
        </defs>
        <image
          href={uri}
          xlinkHref={uri}
          x={frame.x}
          y={frame.y}
          width={frame.width}
          height={frame.height}
          preserveAspectRatio={imageSize ? 'none' : 'xMidYMid slice'}
          clipPath={`url(#${clipId})`}
        />
      </svg>
    </div>
  );
}