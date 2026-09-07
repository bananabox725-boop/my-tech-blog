import type {FC} from 'react';
import {Sequence, interpolate, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {HeaderBadge} from '../components/HeaderBadge';
import {ProgressBar} from '../components/ProgressBar';
import {Caption} from '../components/Caption';
import {PhoneFrame} from '../components/PhoneFrame';
import {Ripple} from '../components/gestures/Ripple';
import {COLORS, FONT_FAMILY} from '../constants';

const SettingsRow: FC<{
  label: string;
  highlighted: boolean;
  showToggle?: boolean;
  toggleOn?: boolean;
}> = ({label, highlighted, showToggle, toggleOn}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '26px 30px',
        backgroundColor: highlighted
          ? 'rgba(10,132,255,0.22)'
          : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 30,
          fontWeight: 600,
          color: COLORS.white,
        }}
      >
        {label}
      </span>
      {showToggle ? (
        <div
          style={{
            width: 62,
            height: 34,
            borderRadius: 17,
            backgroundColor: toggleOn ? COLORS.accentGreen : '#3a3d4d',
            position: 'relative',
            transition: 'background-color 0.2s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 3,
              left: toggleOn ? 31 : 3,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: 'white',
            }}
          />
        </div>
      ) : (
        <span style={{color: COLORS.dim, fontSize: 30}}>{'›'}</span>
      )}
    </div>
  );
};

const SettingsScreen: FC = () => {
  const frame = useCurrentFrame();
  const toggleOn = frame > 210;

  return (
    <div style={{position: 'absolute', inset: 0, paddingTop: 76}}>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 22,
          color: COLORS.dim,
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        설정 &gt; 손쉬운 사용 &gt; VoiceOver
      </div>
      <SettingsRow label="VoiceOver" highlighted showToggle toggleOn={toggleOn} />
      <SettingsRow label="VoiceOver 인식" highlighted={false} />
      <SettingsRow label="음성" highlighted={false} />
      <SettingsRow label="말하기 속도" highlighted={false} />
      <SettingsRow label="로터 동작" highlighted={false} />

      {frame > 180 && frame <= 210 && (
        <Ripple localFrame={frame - 180} cycleLength={60} x={480} y={162} />
      )}
    </div>
  );
};

export const TurnOnScene: FC = () => {
  const frame = useCurrentFrame();
  const toggleGlow = interpolate(frame, [210, 230], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
        보이스오버 켜는 방법
      </div>
      <PhoneFrame top={330}>
        <SettingsScreen />
      </PhoneFrame>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 330,
          transform: 'translateX(-50%)',
          width: 560,
          height: 1140,
          borderRadius: 72,
          boxShadow: `0 0 ${60 * toggleGlow}px ${COLORS.accentGreen}`,
          pointerEvents: 'none',
        }}
      />
      <Sequence from={0} durationInFrames={180}>
        <Caption text={'설정 → 손쉬운 사용 →\nVoiceOver로 들어가세요'} />
      </Sequence>
      <Sequence from={180} durationInFrames={120}>
        <Caption text={'스위치를 탭하면\n보이스오버가 켜져요'} />
      </Sequence>
      <ProgressBar />
    </Background>
  );
};
