import type {FC} from 'react';
import {COLORS} from '../../constants';

export const FocusRing: FC<{
  x: number;
  y: number;
  size?: number;
  opacity?: number;
}> = ({x, y, size = 132, opacity = 1}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: 24,
        border: `5px solid ${COLORS.accentGreen}`,
        boxShadow: `0 0 22px ${COLORS.accentGreen}`,
        opacity,
      }}
    />
  );
};
