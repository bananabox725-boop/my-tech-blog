import type {FC, ReactNode} from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {TitleScene} from './scenes/TitleScene';
import {WhatIsScene} from './scenes/WhatIsScene';
import {TurnOnScene} from './scenes/TurnOnScene';
import {GesturesScene} from './scenes/GesturesScene';
import {RotorScene} from './scenes/RotorScene';
import {OutroScene} from './scenes/OutroScene';
import {
  SCENE_TITLE,
  SCENE_WHAT_IS,
  SCENE_TURN_ON,
  SCENE_GESTURES,
  SCENE_ROTOR,
  SCENE_OUTRO,
} from './constants';

const FADE = 15;

// Wraps a scene with a fade-in / fade-out so cuts between scenes feel smooth.
const FadeWrap: FC<{children: ReactNode; durationInFrames: number}> = ({
  children,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FADE, durationInFrames - FADE, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const VoiceOverGuide: FC = () => {
  let cursor = 0;
  const scenes: {duration: number; node: ReactNode}[] = [
    {duration: SCENE_TITLE, node: <TitleScene />},
    {duration: SCENE_WHAT_IS, node: <WhatIsScene />},
    {duration: SCENE_TURN_ON, node: <TurnOnScene />},
    {duration: SCENE_GESTURES, node: <GesturesScene />},
    {duration: SCENE_ROTOR, node: <RotorScene />},
    {duration: SCENE_OUTRO, node: <OutroScene />},
  ];

  return (
    <AbsoluteFill style={{backgroundColor: '#050814'}}>
      {scenes.map((scene, i) => {
        const from = cursor;
        cursor += scene.duration;
        return (
          <Sequence key={i} from={from} durationInFrames={scene.duration}>
            <FadeWrap durationInFrames={scene.duration}>
              {scene.node}
            </FadeWrap>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
