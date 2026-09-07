import type {FC} from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {HeaderBadge} from '../components/HeaderBadge';
import {ProgressBar} from '../components/ProgressBar';
import {Caption} from '../components/Caption';
import {PhoneFrame} from '../components/PhoneFrame';
import {AppIconGrid, iconPosition} from '../components/AppIconGrid';
import {Ripple} from '../components/gestures/Ripple';
import {SwipeHint} from '../components/gestures/SwipeHint';
import {ThreeFingerScroll} from '../components/gestures/ThreeFingerScroll';
import {FocusRing} from '../components/gestures/FocusRing';
import {COLORS, FONT_FAMILY} from '../constants';

const icon0 = iconPosition(0);
const icon1 = iconPosition(1);

const BeatLabel: FC<{text: string}> = ({text}) => (
  <div
    style={{
      position: 'absolute',
      top: 78,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontFamily: FONT_FAMILY,
      fontSize: 30,
      fontWeight: 700,
      color: COLORS.accentGreen,
    }}
  >
    {text}
  </div>
);

const TapBeat: FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <FocusRing x={icon0.x} y={icon0.y} opacity={frame > 8 ? 1 : 0} />
      <Ripple localFrame={frame} cycleLength={60} x={icon0.x} y={icon0.y} />
    </>
  );
};

const DoubleTapBeat: FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <FocusRing x={icon1.x} y={icon1.y} />
      <Ripple localFrame={frame} cycleLength={40} x={icon1.x} y={icon1.y} />
      <Ripple
        localFrame={frame - 14}
        cycleLength={40}
        x={icon1.x}
        y={icon1.y}
        color={COLORS.accentPurple}
      />
    </>
  );
};

const SwipeBeat: FC = () => {
  const frame = useCurrentFrame();
  const progressed = frame > 34;
  return (
    <>
      <FocusRing x={progressed ? icon1.x : icon0.x} y={icon0.y} />
      <SwipeHint
        localFrame={frame}
        cycleLength={70}
        y={icon0.y}
        fromX={icon0.x}
        toX={icon1.x}
      />
    </>
  );
};

const ScrollBeat: FC = () => {
  const frame = useCurrentFrame();
  return (
    <ThreeFingerScroll
      localFrame={frame}
      cycleLength={70}
      centerX={icon1.x}
      fromY={icon1.y + 260}
      toY={icon1.y - 60}
    />
  );
};

export const GesturesScene: FC = () => {
  return (
    <Background>
      <HeaderBadge />
      <div
        style={{
          position: 'absolute',
          top: 190,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_FAMILY,
          fontSize: 54,
          fontWeight: 800,
          color: COLORS.white,
        }}
      >
        기본 제스처 4가지
      </div>
      <PhoneFrame top={320}>
        <AppIconGrid />
        <Sequence from={60} durationInFrames={100}>
          <BeatLabel text="① 한 번 탭 — 선택 + 읽기" />
        </Sequence>
        <Sequence from={60} durationInFrames={100}>
          <TapBeat />
        </Sequence>

        <Sequence from={160} durationInFrames={100}>
          <BeatLabel text="② 두 번 탭 — 실행" />
        </Sequence>
        <Sequence from={160} durationInFrames={100}>
          <DoubleTapBeat />
        </Sequence>

        <Sequence from={260} durationInFrames={100}>
          <BeatLabel text="③ 오른쪽 스와이프 — 다음 항목" />
        </Sequence>
        <Sequence from={260} durationInFrames={100}>
          <SwipeBeat />
        </Sequence>

        <Sequence from={360} durationInFrames={90}>
          <BeatLabel text="④ 세 손가락 스와이프 — 스크롤" />
        </Sequence>
        <Sequence from={360} durationInFrames={90}>
          <ScrollBeat />
        </Sequence>
      </PhoneFrame>

      <Sequence from={0} durationInFrames={60}>
        <Caption text={'보이스오버는\n4가지 제스처만 알면 충분해요'} />
      </Sequence>
      <Sequence from={60} durationInFrames={100}>
        <Caption text={'한 번 탭하면\n항목을 선택하고 읽어줘요'} />
      </Sequence>
      <Sequence from={160} durationInFrames={100}>
        <Caption text={'두 번 탭하면\n선택한 항목을 실행해요'} />
      </Sequence>
      <Sequence from={260} durationInFrames={100}>
        <Caption text={'오른쪽/왼쪽으로 스와이프하면\n다음/이전 항목으로 이동해요'} />
      </Sequence>
      <Sequence from={360} durationInFrames={90}>
        <Caption text={'세 손가락으로 스와이프하면\n화면을 스크롤해요'} />
      </Sequence>
      <ProgressBar />
    </Background>
  );
};
