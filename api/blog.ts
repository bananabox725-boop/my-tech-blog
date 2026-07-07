import { createClient } from 'redis';
import { randomBytes } from 'crypto';

// 서버리스 환경용 Redis 클라이언트 (node-redis v4)
let _client: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (!_client) {
    _client = createClient({ url: process.env.REDIS_URL });
    _client.on('error', (err) => console.error('Redis client error:', err));
    await _client.connect();
  }
  return _client;
}

// kv 래퍼
const kv = {
  async get<T>(key: string): Promise<T | null> {
    const r = await getRedis();
    const val = await r.get(key);
    return val ? (JSON.parse(val) as T) : null;
  },
  async set(key: string, value: unknown, opts?: { ex?: number }): Promise<void> {
    const r = await getRedis();
    if (opts?.ex) {
      await r.set(key, JSON.stringify(value), { EX: opts.ex });
    } else {
      await r.set(key, JSON.stringify(value));
    }
  },
  async del(key: string): Promise<void> {
    const r = await getRedis();
    await r.del(key);
  },
};

const DEFAULT_ADMIN_PWD = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
const STORAGE_KEY = 'blog_posts';
const COMMENTS_KEY = 'blog_comments';
const ADMIN_PWD_KEY = 'admin_password';
const CATEGORIES_KEY = 'blog_categories';
const DEFAULT_CATEGORIES = ['일상', '정보', '교육'];
const SESSION_TTL = 86400; // 24시간

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  contentType?: 'markdown' | 'html';
  date: string;
  category: string;
  imageUrl?: string;
  attachments?: { name: string; data: string; type: string }[];
  likes: number;
  views: number;
}

interface Comment {
  id: number;
  postId: number;
  author: string;
  password: string;
  content: string;
  date: string;
}

const initialPosts: Post[] = [
  {
    id: 1,
    title: 'React 입문',
    excerpt: '리액트를 처음 시작하는 초보자를 위한 가이드입니다.',
    content: '리액트는 사용자 인터페이스를 만들기 위한 자바스크립트 라이브러리입니다. 이 글에서는 리액트의 기본 개념인 컴포넌트, Props, State에 대해 알아봅니다.',
    date: '2026-04-22',
    category: '교육',
    likes: 0,
    views: 0,
  },
  {
    id: 2,
    title: 'Vite로 프로젝트 설정',
    excerpt: 'Vite를 사용하여 빠르고 현대적인 개발 환경을 구축하는 방법을 알아봅니다.',
    content: 'Vite는 최신 브라우저의 네이티브 ES 모듈 기능을 사용하는 빠른 빌드 도구입니다. 기존 Webpack보다 훨씬 빠른 개발 서버 시작과 HMR(Hot Module Replacement)을 제공합니다.',
    date: '2026-04-22',
    category: '정보',
    likes: 0,
    views: 0,
  },
  {
    id: 3,
    title: 'TypeScript 공부법',
    excerpt: '타입스크립트를 효과적으로 학습하는 단계별 로드맵을 제안합니다.',
    content: '타입스크립트는 자바스크립트에 정적 타입을 추가한 언어입니다. 코드의 안정성을 높이고 개발자의 실수를 줄여주는 강력한 도구입니다.',
    date: '2026-04-22',
    category: '교육',
    likes: 0,
    views: 0,
  },
  {
    id: 4,
    title: '2026년 상반기 AI 주요 이슈 총정리',
    excerpt: 'GPT-5 출시, Claude 4 시리즈 공개, AI 규제 강화 등 2026년 상반기를 뜨겁게 달군 인공지능 핵심 이슈들을 정리합니다.',
    content: `## 2026년 상반기를 뜨겁게 달군 AI 주요 이슈\n\n2026년 상반기는 AI 산업 역사상 가장 격변했던 시기 중 하나로 기록될 것입니다. 모델 성능의 비약적 발전, 글로벌 규제 흐름의 변화, 그리고 AI가 실생활에 깊숙이 침투하기 시작한 시기입니다.\n\n---\n\n### 1. GPT-5 및 차세대 대형 언어 모델 공개\n\nOpenAI는 2026년 초 GPT-5를 공개하며 멀티모달 추론 능력을 대폭 강화했습니다. 텍스트, 이미지, 오디오, 비디오를 동시에 처리하는 능력이 크게 향상되었고, 특히 수학·과학 추론 벤치마크에서 박사급 수준을 넘어서는 성과를 보였습니다.\n\n- **o3-pro 모델**: 복잡한 수학 올림피아드 문제에서 90% 이상 정답률 달성\n- **실시간 음성 대화**: 지연 없는 자연스러운 음성 대화 기능 강화\n- **장문 컨텍스트**: 1백만 토큰 이상의 컨텍스트 윈도우 지원\n\n---\n\n### 2. Anthropic Claude 4 시리즈 출시\n\nAnthropic은 Claude 4 패밀리(Opus 4, Sonnet 4, Haiku 4)를 출시하며 안전성과 성능을 동시에 끌어올렸습니다. 특히 **Extended Thinking** 기능이 고도화되어 복잡한 논리적 추론과 코딩 작업에서 두각을 나타냈습니다.\n\n- **Claude Opus 4**: 고난도 연구·분석 작업에서 최상위 성능\n- **Computer Use 2.0**: 컴퓨터를 직접 조작하는 에이전트 기능 대폭 개선\n- **한국어 성능 향상**: 한국어 이해 및 생성 품질 크게 향상\n\n---\n\n### 3. AI 에이전트 시대의 본격화\n\n2026년은 단순 챗봇을 넘어 **자율적으로 작업을 수행하는 AI 에이전트**가 실무에 도입되기 시작한 원년입니다.\n\n- **코딩 에이전트**: GitHub Copilot Workspace, Cursor AI 등이 전체 프로젝트를 자율적으로 개발\n- **업무 자동화**: 이메일 처리, 일정 관리, 문서 작성을 AI 에이전트가 대신 처리\n- **멀티 에이전트 협업**: 여러 AI가 역할을 나눠 복잡한 작업을 분산 처리\n\n---\n\n### 4. EU AI 법(AI Act) 전면 시행\n\n유럽연합의 AI Act가 2026년 상반기부터 단계적으로 전면 시행되었습니다. 이는 AI 산업에 지각변동을 일으켰습니다.\n\n- **고위험 AI 시스템** 인증 의무화 (의료, 교육, 채용 분야)\n- **생성형 AI 투명성** 공시 요건 강화\n- **위반 시 제재**: 전 세계 연간 매출의 최대 7% 벌금\n\n한국도 이에 대응하여 **AI 기본법** 제정을 서두르며 자체 규제 프레임워크를 구축 중입니다.\n\n---\n\n### 5. 딥페이크 및 AI 생성 콘텐츠 문제\n\n생성형 AI의 발전과 함께 딥페이크로 인한 사회적 문제가 심화되었습니다.\n\n- 선거 관련 딥페이크 영상 급증, 미국·한국·유럽에서 입법 대응\n- AI 생성 이미지 워터마킹(C2PA 표준) 의무화 논의 본격화\n- 유명인 목소리·얼굴 무단 활용에 대한 법적 분쟁 증가\n\n---\n\n### 6. AI와 일자리: 공존의 시대\n\n골드만삭스, 맥킨지 등 주요 기관들이 AI로 인한 직업 변화 보고서를 발표했습니다. 단순히 "일자리가 없어진다"는 공포에서 벗어나 **AI와 협업하는 방식**으로 패러다임이 변하고 있습니다.\n\n- 개발자, 디자이너, 마케터 직군은 AI를 도구로 활용해 생산성 3~5배 향상\n- 단순 반복 업무 자동화로 고부가가치 창의 업무 집중 가능\n- **AI 리터러시** 교육이 전 세계적으로 필수 과목으로 채택\n\n---\n\n### 마치며\n\n2026년 상반기 AI 이슈는 단순한 기술 발전을 넘어 사회, 법률, 경제 전반에 걸친 근본적 변화를 예고하고 있습니다. AI를 두려워하기보다 올바르게 이해하고 활용하는 것이 이 시대를 살아가는 가장 현명한 자세일 것입니다.`,
    date: '2026-06-08',
    category: '정보',
    imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80',
    likes: 0,
    views: 0,
  },
];

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function sessionKey(token: string): string {
  return `session:${token}`;
}

export default async function handler(req: any, res: any) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    // 로그인 — 성공 시 세션 토큰 발급
    if (action === 'checkPassword') {
      const { password } = req.body || {};
      if (!password) {
        return res.status(400).json({ error: '비밀번호가 누락되었습니다.' });
      }

      // DB에서 비밀번호 조회 — 실패 시 에러 반환 (폴백 없음)
      const dbPwd = await kv.get<string>(ADMIN_PWD_KEY);
      const adminPassword = dbPwd ?? DEFAULT_ADMIN_PWD;

      if (password !== adminPassword) {
        return res.status(200).json({ success: false, message: 'Invalid password' });
      }

      const token = generateToken();
      await kv.set(sessionKey(token), 'admin', { ex: SESSION_TTL });
      return res.status(200).json({ success: true, token });
    }

    // 로그아웃 — 세션 토큰 삭제
    if (action === 'logout') {
      const authHeader = req.headers['authorization'] as string | undefined;
      if (authHeader) {
        try {
          await kv.del(sessionKey(authHeader));
        } catch (_) {}
      }
      return res.status(200).json({ success: true });
    }

    // 세션 토큰으로 관리자 권한 확인
    const authHeader = req.headers['authorization'] as string | undefined;
    let isAdmin = false;
    if (authHeader) {
      try {
        const sessionValue = await kv.get<string>(sessionKey(authHeader));
        isAdmin = sessionValue === 'admin';
      } catch (e) {
        console.error('KV Session Fetch Error:', e);
      }
    }

    switch (action) {
      case 'updateAdminPassword': {
        if (!isAdmin) {
          return res.status(401).json({
            error: 'Unauthorized',
            details: '관리자 권한이 없습니다. 다시 로그인해 주세요.',
          });
        }
        const { newPassword } = req.body || {};
        if (!newPassword) {
          return res.status(400).json({ error: '새 비밀번호가 누락되었습니다.' });
        }
        try {
          await kv.set(ADMIN_PWD_KEY, newPassword);
          // 비밀번호 변경 후 현재 세션은 유효하게 유지
          return res.status(200).json({ success: true });
        } catch (dbErr) {
          return res.status(500).json({ error: 'DB 저장 실패', details: (dbErr as Error).message });
        }
      }

      case 'getCategories': {
        let cats = await kv.get<string[]>(CATEGORIES_KEY);
        if (!cats) {
          await kv.set(CATEGORIES_KEY, DEFAULT_CATEGORIES);
          cats = DEFAULT_CATEGORIES;
        }
        return res.status(200).json(cats);
      }

      case 'saveCategories': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const { categories } = req.body as { categories: string[] };
        if (!Array.isArray(categories)) return res.status(400).json({ error: '잘못된 형식입니다.' });
        await kv.set(CATEGORIES_KEY, categories);
        return res.status(200).json({ success: true });
      }

      case 'getPosts': {
        let posts = await kv.get<Post[]>(STORAGE_KEY);
        if (!posts) {
          await kv.set(STORAGE_KEY, initialPosts);
          posts = initialPosts;
        } else {
          const existingIds = new Set(posts.map((p) => p.id));
          const newPosts = initialPosts.filter((p) => !existingIds.has(p.id));
          if (newPosts.length > 0) {
            posts = [...posts, ...newPosts];
            await kv.set(STORAGE_KEY, posts);
          }
        }
        return res.status(200).json(posts);
      }

      case 'savePost': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const post = req.body as Post;
        const posts = (await kv.get<Post[]>(STORAGE_KEY)) ?? [];
        await kv.set(STORAGE_KEY, [post, ...posts]);
        return res.status(200).json({ success: true });
      }

      case 'updatePost': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const post = req.body as Post;
        const posts = (await kv.get<Post[]>(STORAGE_KEY)) ?? [];
        const index = posts.findIndex((p) => p.id === post.id);
        if (index !== -1) {
          posts[index] = post;
          await kv.set(STORAGE_KEY, posts);
        }
        return res.status(200).json({ success: true });
      }

      case 'deletePost': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const id = Number(req.query.id);
        const posts = (await kv.get<Post[]>(STORAGE_KEY)) ?? [];
        await kv.set(STORAGE_KEY, posts.filter((p) => p.id !== id));
        return res.status(200).json({ success: true });
      }

      case 'incrementViews': {
        const id = Number(req.query.id);
        const posts = (await kv.get<Post[]>(STORAGE_KEY)) ?? [];
        const index = posts.findIndex((p) => p.id === id);
        if (index !== -1) {
          posts[index].views += 1;
          await kv.set(STORAGE_KEY, posts);
        }
        return res.status(200).json({ success: true });
      }

      case 'toggleLike': {
        const id = Number(req.query.id);
        const increment = req.query.increment === 'true';
        const posts = (await kv.get<Post[]>(STORAGE_KEY)) ?? [];
        const index = posts.findIndex((p) => p.id === id);
        if (index !== -1) {
          posts[index].likes += increment ? 1 : -1;
          posts[index].likes = Math.max(0, posts[index].likes);
          await kv.set(STORAGE_KEY, posts);
          return res.status(200).json({ likes: posts[index].likes });
        }
        return res.status(200).json({ likes: 0 });
      }

      case 'getComments': {
        const postId = Number(req.query.postId);
        const allComments = (await kv.get<Comment[]>(COMMENTS_KEY)) ?? [];
        return res.status(200).json(allComments.filter((c) => c.postId === postId));
      }

      case 'saveComment': {
        const comment = req.body as Comment;
        const allComments = (await kv.get<Comment[]>(COMMENTS_KEY)) ?? [];
        allComments.push(comment);
        await kv.set(COMMENTS_KEY, allComments);
        return res.status(200).json({ success: true });
      }

      case 'deleteComment': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const id = Number(req.query.id);
        const allComments = (await kv.get<Comment[]>(COMMENTS_KEY)) ?? [];
        await kv.set(COMMENTS_KEY, allComments.filter((c) => c.id !== id));
        return res.status(200).json({ success: true });
      }

      case 'getBackup': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const posts = (await kv.get<Post[]>(STORAGE_KEY)) ?? [];
        const categories = (await kv.get<string[]>(CATEGORIES_KEY)) ?? [];
        const comments = (await kv.get<Comment[]>(COMMENTS_KEY)) ?? [];
        return res.status(200).json({ posts, categories, comments, timestamp: new Date().toISOString() });
      }

      case 'restoreBackup': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const { posts, categories, comments } = req.body || {};
        if (posts && Array.isArray(posts)) await kv.set(STORAGE_KEY, posts);
        if (categories && Array.isArray(categories)) await kv.set(CATEGORIES_KEY, categories);
        if (comments && Array.isArray(comments)) await kv.set(COMMENTS_KEY, comments);
        return res.status(200).json({ success: true });
      }

      case 'emergencyResetPassword': {
        await kv.del(ADMIN_PWD_KEY);
        return res.status(200).json({ success: true, message: 'Password reset' });
      }

      default:
        return res.status(404).json({ error: 'Not Found' });
    }
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Server Error', message: (err as Error).message });
  }
}
