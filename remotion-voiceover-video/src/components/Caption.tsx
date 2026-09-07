import type {FC} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY} from '../constants';

export const Caption: FC<{text: string; delay?: number}> = ({
  text,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const opacity = interpolate(local, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(local, [0, 12], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        bottom: 110,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.35,
          color: COLORS.white,
          textAlign: 'center',
          textShadow: '0 2px 24px rgba(0,0,0,0.45)',
          whiteSpace: 'pre-line',
        }}
      >
        {text}
      </div>
    </div>
  );
};
