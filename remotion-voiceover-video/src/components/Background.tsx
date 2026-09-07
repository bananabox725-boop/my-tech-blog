import type {FC, ReactNode} from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS} from '../constants';

export const Background: FC<{children: ReactNode}> = ({children}) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 15%, ${COLORS.bgTo} 0%, ${COLORS.bgFrom} 65%)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
