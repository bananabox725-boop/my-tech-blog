import type {FC} from 'react';
import {interpolate} from 'remotion';
import {COLORS} from '../../constants';

export const RotorDial: FC<{
  localFrame: number;
  cycleLength: number;
  centerX: number;
  centerY: number;
  radius?: number;
}> = ({localFrame, cycleLength, centerX, centerY, radius = 70}) => {
  const t = ((localFrame % cycleLength) + cycleLength) % cycleLength;
  const angle = interpolate(t, [0, cycleLength], [0, 300]);
  const rad = (angle * Math.PI) / 180;

  const finger1X = centerX + radius * Math.cos(rad);
  const finger1Y = centerY + radius * Math.sin(rad);
  const finger2X = centerX + radius * Math.cos(rad + Math.PI);
  const finger2Y = centerY + radius * Math.sin(rad + Math.PI);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: centerX - radius,
          top: centerY - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          border: `3px dashed ${COLORS.accentBlue}`,
          opacity: 0.5,
        }}
      />
      {[
        [finger1X, finger1Y],
        [finger2X, finger2Y],
      ].map(([fx, fy], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: fx - 24,
            top: fy - 24,
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: COLORS.accentBlue,
            boxShadow: `0 0 20px ${COLORS.accentBlue}`,
          }}
        />
      ))}
    </>
  );
};
