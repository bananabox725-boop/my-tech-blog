import type {FC} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {COLORS, FONT_FAMILY} from '../constants';

export const OutroScene: FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const checkScale = spring({frame, fps, config: {damping: 11, mass: 0.6}});
  const textOpacity = interpolate(frame, [16, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames - 1],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <Background>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: fadeOut,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 90px',
          fontFamily: FONT_FAMILY,
        }}
      >
        <div
          style={{
            width: 176,
            height: 176,
            borderRadius: 88,
            backgroundColor: COLORS.accentGreen,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${checkScale})`,
            boxShadow: `0 20px 60px rgba(48,209,88,0.45)`,
            marginBottom: 56,
          }}
        >
          <CheckIcon />
        </div>

        <div
          style={{
            opacity: textOpacity,
            fontSize: 62,
            fontWeight: 800,
            color: COLORS.white,
            textAlign: 'center',
            lineHeight: 1.35,
          }}
        >
          지금 설정 &gt; 손쉬운 사용에서
          <br />
          보이스오버를 켜보세요
        </div>

        <div
          style={{
            opacity: textOpacity,
            marginTop: 32,
            fontSize: 34,
            fontWeight: 500,
            color: COLORS.dim,
            textAlign: 'center',
          }}
        >
          한 번 탭 · 두 번 탭 · 스와이프 · 로터
        </div>
      </div>
    </Background>
  );
};

const CheckIcon: FC = () => (
  <svg width="88" height="88" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 12.5L9.5 18L20 6"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
