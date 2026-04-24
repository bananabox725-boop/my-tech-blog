export interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  imageUrl?: string;
  attachments?: { name: string; data: string; type: string }[];
}

export interface Comment {
  id: number;
  postId: number;
  author: string;
  password: string;
  content: string;
  date: string;
}

export const posts: Post[] = [
  { 
    id: 1, 
    title: 'React 입문', 
    excerpt: '리액트를 처음 시작하는 초보자를 위한 가이드입니다.',
    content: '리액트는 사용자 인터페이스를 만들기 위한 자바스크립트 라이브러리입니다. 이 글에서는 리액트의 기본 개념인 컴포넌트, Props, State에 대해 알아봅니다.',
    date: '2026-04-22',
    category: 'React'
  },
  { 
    id: 2, 
    title: 'Vite로 프로젝트 설정', 
    excerpt: 'Vite를 사용하여 빠르고 현대적인 개발 환경을 구축하는 방법을 알아봅니다.',
    content: 'Vite는 최신 브라우저의 네이티브 ES 모듈 기능을 사용하는 빠른 빌드 도구입니다. 기존 Webpack보다 훨씬 빠른 개발 서버 시작과 HMR(Hot Module Replacement)을 제공합니다.',
    date: '2026-04-22',
    category: 'Tool'
  },
  { 
    id: 3, 
    title: 'TypeScript 공부법', 
    excerpt: '타입스크립트를 효과적으로 학습하는 단계별 로드맵을 제안합니다.',
    content: '타입스크립트는 자바스크립트에 정적 타입을 추가한 언어입니다. 코드의 안정성을 높이고 개발자의 실수를 줄여주는 강력한 도구입니다.',
    date: '2026-04-22',
    category: 'TypeScript'
  },
];
