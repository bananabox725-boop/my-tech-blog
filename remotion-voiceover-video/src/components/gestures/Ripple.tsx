import type {FC} from 'react';
import {interpolate} from 'remotion';
import {COLORS} from '../../constants';

// A single expanding tap ripple, driven by a 0..cycleLength local frame value.
export const Ripple: FC<{
  localFrame: number;
  cycleLength: number;
  x: number;
  y: number;
  color?: string;
}> = ({localFrame, cycleLength, x, y, color = COLORS.accentBlue}) => {
  const t = ((localFrame % cycleLength) + cycleLength) % cycleLength;
  const activeWindow = Math.min(cycleLength, 26);
  const scale = interpolate(t, [0, activeWindow], [0.4, 2.4], {
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(t, [0, activeWindow * 0.15, activeWindow], [0, 0.9, 0], {
    extrapolateRight: 'clamp',
  });
  const dotScale = interpolate(t, [0, 6, 14], [0.7, 1.15, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x - 34,
          top: y - 34,
          width: 68,
          height: 68,
          borderRadius: 34,
          border: `4px solid ${color}`,
          opacity,
          transform: `scale(${scale})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - 22,
          top: y - 22,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: color,
          opacity: Math.max(opacity, t < activeWindow ? 0.95 : 0),
          transform: `scale(${dotScale})`,
          boxShadow: `0 0 24px ${color}`,
        }}
      />
    </>
  );
};
