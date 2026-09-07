import type {FC} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {COLORS, FONT_FAMILY} from '../constants';

export const TitleScene: FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const badgeScale = spring({frame, fps, config: {damping: 12, mass: 0.6}});
  const titleOpacity = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [10, 28], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subOpacity = interpolate(frame, [30, 46], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Background>
      <div
        style={{
          position: 'absolute',
          inset: 0,
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
            width: 160,
            height: 160,
            borderRadius: 80,
            background: `linear-gradient(135deg, ${COLORS.accentBlue}, ${COLORS.accentPurple})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${badgeScale})`,
            boxShadow: `0 20px 60px rgba(10,132,255,0.45)`,
            marginBottom: 56,
          }}
        >
          <SoundWaveIcon />
        </div>

        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontSize: 76,
            fontWeight: 800,
            color: COLORS.white,
            textAlign: 'center',
            lineHeight: 1.25,
          }}
        >
          아이폰 보이스오버
          <br />1분 완성 가이드
        </div>

        <div
          style={{
            opacity: subOpacity,
            marginTop: 28,
            fontSize: 38,
            fontWeight: 500,
            color: COLORS.dim,
            textAlign: 'center',
          }}
        >
          화면을 보지 않고도 아이폰을 쓰는 방법
        </div>
      </div>
    </Background>
  );
};

const SoundWaveIcon: FC = () => {
  const bars = [26, 52, 74, 52, 26];
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 12,
            height: h,
            borderRadius: 6,
            backgroundColor: 'white',
          }}
        />
      ))}
    </div>
  );
};
