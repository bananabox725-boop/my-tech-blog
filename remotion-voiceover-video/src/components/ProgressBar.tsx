import type {FC} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../constants';

export const ProgressBar: FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = frame / (durationInFrames - 1);

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        bottom: 56,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${COLORS.accentBlue}, ${COLORS.accentPurple})`,
        }}
      />
    </div>
  );
};
