import type {FC} from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {HeaderBadge} from '../components/HeaderBadge';
import {ProgressBar} from '../components/ProgressBar';
import {Caption} from '../components/Caption';
import {PhoneFrame, PHONE_SCREEN_WIDTH, PHONE_SCREEN_HEIGHT} from '../components/PhoneFrame';
import {RotorDial} from '../components/gestures/RotorDial';
import {COLORS, FONT_FAMILY} from '../constants';

const ROTOR_OPTIONS = ['글자', '단어', '줄', '제목', '링크', '속도'];

const RotorScreen: FC = () => {
  const frame = useCurrentFrame();
  const activeIndex = Math.floor(frame / 30) % ROTOR_OPTIONS.length;

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 22,
          color: COLORS.dim,
          textAlign: 'center',
          paddingTop: 76,
        }}
      >
        로터 (두 손가락으로 돌리기)
      </div>
      <div
        style={{
          position: 'absolute',
          top: 166,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
          padding: '0 30px',
        }}
      >
        {ROTOR_OPTIONS.map((opt, i) => (
          <div
            key={opt}
            style={{
              padding: '12px 22px',
              borderRadius: 22,
              fontFamily: FONT_FAMILY,
              fontSize: 26,
              fontWeight: 700,
              backgroundColor:
                i === activeIndex ? COLORS.accentBlue : 'rgba(255,255,255,0.08)',
              color: i === activeIndex ? 'white' : COLORS.dim,
            }}
          >
            {opt}
          </div>
        ))}
      </div>
      <RotorDial
        localFrame={frame}
        cycleLength={180}
        centerX={PHONE_SCREEN_WIDTH / 2}
        centerY={PHONE_SCREEN_HEIGHT / 2 + 60}
      />
    </div>
  );
};

export const RotorScene: FC = () => {
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
        로터로 세부 설정하기
      </div>
      <PhoneFrame top={330}>
        <RotorScreen />
      </PhoneFrame>
      <Sequence from={0} durationInFrames={150}>
        <Caption text={'두 손가락으로 화면을\n돌리면 로터가 열려요'} />
      </Sequence>
      <Sequence from={150} durationInFrames={150}>
        <Caption text={'글자/단어/속도 등\n읽는 방식을 바꿀 수 있어요'} />
      </Sequence>
      <ProgressBar />
    </Background>
  );
};
