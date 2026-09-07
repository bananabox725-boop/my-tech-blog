import type {FC} from 'react';
import {PHONE_SCREEN_WIDTH} from './PhoneFrame';

export const ICON_COLORS = [
  '#0A84FF',
  '#30D158',
  '#FF9F0A',
  '#BF5AF2',
  '#FF375F',
  '#64D2FF',
];

export const ICON_SIZE = 116;
export const ICON_GAP = 44;
const COLS = 3;
const START_Y = 230;

export const iconPosition = (index: number) => {
  const row = Math.floor(index / COLS);
  const col = index % COLS;
  const totalRowWidth = COLS * ICON_SIZE + (COLS - 1) * ICON_GAP;
  const startX = (PHONE_SCREEN_WIDTH - totalRowWidth) / 2;
  const x = startX + col * (ICON_SIZE + ICON_GAP) + ICON_SIZE / 2;
  const y = START_Y + row * (ICON_SIZE + ICON_GAP) + ICON_SIZE / 2;
  return {x, y};
};

export const AppIconGrid: FC = () => {
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {ICON_COLORS.map((color, i) => {
        const {x, y} = iconPosition(i);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - ICON_SIZE / 2,
              top: y - ICON_SIZE / 2,
              width: ICON_SIZE,
              height: ICON_SIZE,
              borderRadius: 28,
              backgroundColor: color,
              boxShadow: 'inset 0 -8px 20px rgba(0,0,0,0.2)',
            }}
          />
        );
      })}
    </div>
  );
};
