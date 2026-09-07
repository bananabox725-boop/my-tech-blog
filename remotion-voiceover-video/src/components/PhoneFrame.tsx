import type {FC, ReactNode} from 'react';
import {COLORS} from '../constants';

const PHONE_WIDTH = 560;
const PHONE_HEIGHT = 1140;

export const PhoneFrame: FC<{children?: ReactNode; top?: number}> = ({
  children,
  top = 300,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top,
        transform: 'translateX(-50%)',
        width: PHONE_WIDTH,
        height: PHONE_HEIGHT,
        borderRadius: 72,
        backgroundColor: '#08090f',
        border: '10px solid #2b2d38',
        boxShadow:
          '0 40px 90px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.04)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 14,
          borderRadius: 54,
          backgroundColor: COLORS.screen,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
      {/* Dynamic island */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 150,
          height: 38,
          borderRadius: 20,
          backgroundColor: '#000',
        }}
      />
    </div>
  );
};

export const PHONE_SCREEN_WIDTH = PHONE_WIDTH - 28;
export const PHONE_SCREEN_HEIGHT = PHONE_HEIGHT - 28;
