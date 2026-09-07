import type {FC} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY} from '../constants';

export const HeaderBadge: FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 64,
        left: 60,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: COLORS.accentBlue,
          boxShadow: `0 0 16px ${COLORS.accentBlue}`,
        }}
      />
      <span
        style={{
          color: COLORS.dim,
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: 1,
        }}
      >
        iOS 손쉬운 사용 · VoiceOver
      </span>
    </div>
  );
};
