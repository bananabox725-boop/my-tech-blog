import type {FC} from 'react';
import {interpolate} from 'remotion';
import {COLORS} from '../../constants';

export const SwipeHint: FC<{
  localFrame: number;
  cycleLength: number;
  y: number;
  fromX: number;
  toX: number;
  color?: string;
}> = ({localFrame, cycleLength, y, fromX, toX, color = COLORS.accentGreen}) => {
  const t = ((localFrame % cycleLength) + cycleLength) % cycleLength;
  const travel = Math.min(cycleLength, 34);
  const x = interpolate(t, [0, travel], [fromX, toX], {
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(
    t,
    [0, 4, travel - 6, travel],
    [0, 1, 1, 0],
    {extrapolateRight: 'clamp'},
  );
  const direction = toX >= fromX ? 1 : -1;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - 26,
        top: y - 26,
        width: 52,
        height: 52,
        opacity,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: color,
          boxShadow: `0 0 22px ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scaleX(${direction})`,
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderLeft: '14px solid white',
            marginLeft: 4,
          }}
        />
      </div>
    </div>
  );
};
