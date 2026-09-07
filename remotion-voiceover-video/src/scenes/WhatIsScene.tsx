import type {FC} from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {HeaderBadge} from '../components/HeaderBadge';
import {ProgressBar} from '../components/ProgressBar';
import {Caption} from '../components/Caption';
import {PhoneFrame} from '../components/PhoneFrame';
import {COLORS, FONT_FAMILY} from '../constants';

const BAR_COUNT = 24;

const AnimatedWaves: FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {Array.from({length: BAR_COUNT}).map((_, i) => {
        const phase = (frame * 0.25 + i * 0.6) % (Math.PI * 2);
        const height = 30 + Math.abs(Math.sin(phase)) * 160;
        return (
          <div
            key={i}
            style={{
              width: 10,
              height,
              borderRadius: 5,
              background:
                i % 2 === 0 ? COLORS.accentBlue : COLORS.accentPurple,
              opacity: 0.9,
            }}
          />
        );
      })}
    </div>
  );
};

export const WhatIsScene: FC = () => {
  return (
    <Background>
      <HeaderBadge />
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_FAMILY,
          fontSize: 54,
          fontWeight: 800,
          color: COLORS.white,
        }}
      >
        보이스오버란?
      </div>
      <PhoneFrame top={330}>
        <AnimatedWaves />
      </PhoneFrame>
      <Sequence from={0} durationInFrames={150}>
        <Caption text={'화면에 보이는 글자와\n버튼을 음성으로 읽어주는\niOS 화면 낭독 기능이에요'} />
      </Sequence>
      <Sequence from={150} durationInFrames={150}>
        <Caption text={'시각장애인은 물론\n누구나 손쉬운 사용에서\n무료로 켤 수 있어요'} />
      </Sequence>
      <ProgressBar />
    </Background>
  );
};
