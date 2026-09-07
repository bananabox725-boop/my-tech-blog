export const FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

// 60 second video
export const DURATION_IN_FRAMES = FPS * 60;

// Scene timings, in frames, adding up to DURATION_IN_FRAMES
export const SCENE_TITLE = FPS * 5; // 0-5s
export const SCENE_WHAT_IS = FPS * 10; // 5-15s
export const SCENE_TURN_ON = FPS * 10; // 15-25s
export const SCENE_GESTURES = FPS * 15; // 25-40s
export const SCENE_ROTOR = FPS * 10; // 40-50s
export const SCENE_OUTRO = FPS * 10; // 50-60s

export const COLORS = {
  bgFrom: '#050814',
  bgTo: '#141b3d',
  accentBlue: '#0A84FF',
  accentPurple: '#BF5AF2',
  accentGreen: '#30D158',
  white: '#F5F7FF',
  dim: '#8A94B8',
  screen: '#0d1024',
};

export const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', Helvetica, Arial, sans-serif";
