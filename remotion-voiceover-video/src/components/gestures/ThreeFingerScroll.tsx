import type {FC} from 'react';
import {interpolate} from 'remotion';
import {COLORS} from '../../constants';

export const ThreeFingerScroll: FC<{
  localFrame: number;
  cycleLength: number;
  centerX: number;
  fromY: number;
  toY: number;
}> = ({localFrame, cycleLength, centerX, fromY, toY}) => {
  const t = ((localFrame % cycleLength) + cycleLength) % cycleLength;
  const travel = Math.min(cycleLength, 40);
  const y = interpolate(t, [0, travel], [fromY, toY], {
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(
    t,
    [0, 5, travel - 8, travel],
    [0, 1, 1, 0],
    {extrapolateRight: 'clamp'},
  );

  const offsets = [-70, 0, 70];

  return (
    <>
      {offsets.map((dx, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: centerX + dx - 20,
            top: y - 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.accentPurple,
            opacity,
            boxShadow: `0 0 18px ${COLORS.accentPurple}`,
          }}
        />
      ))}
    </>
  );
};
