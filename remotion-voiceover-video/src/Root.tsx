import type {FC} from 'react';
import {Composition} from 'remotion';
import {VoiceOverGuide} from './VoiceOverGuide';
import {FPS, DURATION_IN_FRAMES, VIDEO_WIDTH, VIDEO_HEIGHT} from './constants';

export const Root: FC = () => {
  return (
    <>
      <Composition
        id="VoiceOverGuide"
        component={VoiceOverGuide}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
