import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Sparkles, 
  Database, 
  Key, 
  Search, 
  PlusCircle, 
  Terminal, 
  ShieldCheck, 
  ExternalLink,
  Code,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types
interface Post {
  id: string;
  created_at: string;
  author: string;
  avatar_url?: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  tags?: string[];
}

interface Comment {
  id: string;
  post_id: string;
  created_at: string;
  author: string;
  content: string;
}

// Mock initial posts for instant visual wow factor before user inputs credentials
const INITIAL_MOCK_POSTS: Post[] = [
  {
    id: 'mock-1',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    author: 'CyberPioneer',
    title: '🚀 Supabase MCP & real-time architecture set up guide',
    content: 'Connecting Supabase with Claude / Antigravity MCP server enables seamless schema creation, live queries, and AI-assisted backend workflows. Check out the setup tab to launch your database!',
    category: 'Guide',
    likes: 24,
    tags: ['Supabase', 'MCP', 'React']
  },
  {
    id: 'mock-2',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    author: 'DesignWizard',
    title: '✨ Glassmorphic UI & Dynamic Glowing Gradients in 2026',
    content: 'Combining subtle backdrop-filter blurs, neon radial glows, and responsive cards creates an ultra-futuristic community experience. What do you think about this UI design?',
    category: 'Design',
    likes: 42,
    tags: ['UI/UX', 'Glassmorphism', 'CSS']
  },
  {
    id: 'mock-3',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    author: 'TechEnthusiast',
    title: '💬 Real-time WebSocket subscriptions with Row Level Security',
    content: 'Row Level Security (RLS) ensures that public users can safely read public forum posts while authenticating operations seamlessly. Supabase Postgres backend makes this effortless!',
    category: 'Discussion',
    likes: 19,
    tags: ['Security', 'Postgres', 'RLS']
  }
];

export function App() {
  // Supabase state
  const [supabaseUrl, setSupabaseUrl] = useState<string>(
    localStorage.getItem('sb_url') || 'https://fobbeftjgvizhbddgqsi.supabase.co'
  );
  const [supabaseKey, setSupabaseKey] = useState<string>(
    localStorage.getItem('sb_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYmJlZnRqZ3ZpemhiZGRncXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMjc5NjksImV4cCI6MjEwMzkwMzk2OX0.2P5ajNUGQSjLIi_d51Mko7p0C8rTaY3hFgUON3JGqPc'
  );
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // App state
  const [posts, setPosts] = useState<Post[]>(INITIAL_MOCK_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'feed' | 'create' | 'mcp_guide' | 'settings'>('feed');

  // New post form state
  const [newAuthor, setNewAuthor] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('General');
  const [newTagInput, setNewTagInput] = useState<string>('');

  // Selected post for view & comment
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c-1',
      post_id: 'mock-1',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      author: 'AIFanatic',
      content: 'This Supabase setup is insanely clean! Thanks for sharing.'
    }
  ]);
  const [commentAuthor, setCommentAuthor] = useState<string>('');
  const [commentContent, setCommentContent] = useState<string>('');

  // Copy state helper
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load initial posts and comments from localStorage fallback if Supabase table not yet pushed
  useEffect(() => {
    const savedPosts = localStorage.getItem('nexus_posts');
    if (savedPosts) {
      try {
        const parsed = JSON.parse(savedPosts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
        }
      } catch (e) {}
    }

    const savedComments = localStorage.getItem('nexus_comments');
    if (savedComments) {
      try {
        const parsed = JSON.parse(savedComments);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setComments(parsed);
        }
      } catch (e) {}
    }
  }, []);

  // Save to localStorage when posts/comments state updates
  const savePostsState = (newPosts: Post[]) => {
    setPosts(newPosts);
    localStorage.setItem('nexus_posts', JSON.stringify(newPosts));
  };

  const saveCommentsState = (newComments: Comment[]) => {
    setComments(newComments);
    localStorage.setItem('nexus_comments', JSON.stringify(newComments));
  };

  // Initialize Supabase Client if credentials exist
  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      try {
        const client = createClient(supabaseUrl, supabaseKey);
        setSupabaseClient(client);
        setIsConnected(true);
        fetchSupabasePosts(client);
        fetchSupabaseComments(client);
      } catch (err) {
        console.error('Supabase init error:', err);
        setIsConnected(false);
      }
    }
  }, [supabaseUrl, supabaseKey]);

  const saveCredentials = (url: string, key: string) => {
    localStorage.setItem('sb_url', url);
    localStorage.setItem('sb_key', key);
    setSupabaseUrl(url);
    setSupabaseKey(key);

    if (url && key) {
      try {
        const client = createClient(url, key);
        setSupabaseClient(client);
        setIsConnected(true);
        fetchSupabasePosts(client);
        fetchSupabaseComments(client);
        alert('Supabase 연동이 완료되었습니다! 데이터베이스와 연결되었습니다.');
      } catch (err) {
        alert('Supabase 연결 오류: URL과 Key를 확인해 주세요.');
        setIsConnected(false);
      }
    } else {
      setSupabaseClient(null);
      setIsConnected(false);
    }
  };

  const fetchSupabasePosts = async (client: SupabaseClient) => {
    try {
      const { data, error } = await client
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Posts table not ready yet or empty, using mock data:', error.message);
      } else if (data && data.length > 0) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchSupabaseComments = async (client: SupabaseClient) => {
    try {
      const { data, error } = await client
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setComments(data);
      }
    } catch (err) {
      console.error('Fetch comments error:', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newAuthor.trim()) {
      alert('작성자, 제목, 내용을 모두 입력해 주세요.');
      return;
    }

    const tagsArray = newTagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newPostObj: Post = {
      id: 'post-' + Date.now(),
      created_at: new Date().toISOString(),
      author: newAuthor,
      title: newTitle,
      content: newContent,
      category: newCategory,
      likes: 0,
      tags: tagsArray.length > 0 ? tagsArray : ['Community']
    };

    if (supabaseClient && isConnected && supabaseUrl.includes('.supabase.co')) {
      try {
        const { data, error } = await supabaseClient.from('posts').insert([
          {
            author: newAuthor,
            title: newTitle,
            content: newContent,
            category: newCategory,
            likes: 0,
            tags: tagsArray
          }
        ]).select();

        if (error) {
          savePostsState([newPostObj, ...posts]);
        } else if (data && data[0]) {
          savePostsState([data[0], ...posts]);
        }
      } catch (err: any) {
        savePostsState([newPostObj, ...posts]);
      }
    } else {
      savePostsState([newPostObj, ...posts]);
    }

    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewTagInput('');
    setActiveTab('feed');
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = posts.map(p => (p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    savePostsState(updated);

    if (activePost && activePost.id === postId) {
      setActivePost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }

    if (supabaseClient && isConnected && !postId.startsWith('mock-')) {
      try {
        const currentPost = posts.find(p => p.id === postId);
        if (currentPost) {
          await supabaseClient
            .from('posts')
            .update({ likes: currentPost.likes + 1 })
            .eq('id', postId);
        }
      } catch (err) {
        console.error('Like sync error:', err);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost || !commentAuthor.trim() || !commentContent.trim()) return;

    const newC: Comment = {
      id: 'c-' + Date.now(),
      post_id: activePost.id,
      created_at: new Date().toISOString(),
      author: commentAuthor,
      content: commentContent
    };

    if (supabaseClient && isConnected && !activePost.id.startsWith('mock-')) {
      try {
        const { data, error } = await supabaseClient.from('comments').insert([
          {
            post_id: activePost.id,
            author: commentAuthor,
            content: commentContent
          }
        ]).select();

        if (!error && data && data[0]) {
          saveCommentsState([...comments, data[0]]);
        } else {
          saveCommentsState([...comments, newC]);
        }
      } catch (err) {
        saveCommentsState([...comments, newC]);
      }
    } else {
      saveCommentsState([...comments, newC]);
    }

    setCommentContent('');
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'General', 'Guide', 'Design', 'Discussion', 'Showcase'];

  const sqlSchemaCode = `-- 1. 게시판 (posts) 테이블 생성
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General' NOT NULL,
  likes INT DEFAULT 0 NOT NULL,
  tags TEXT[] DEFAULT '{}'::TEXT[]
);

-- 2. 댓글 (comments) 테이블 생성
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL
);

-- 3. RLS (Row Level Security) 설정 및 공개 권한 허용
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Posts Select" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Public Posts Insert" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Posts Update" ON public.posts FOR UPDATE USING (true);

CREATE POLICY "Public Comments Select" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public Comments Insert" ON public.comments FOR INSERT WITH CHECK (true);

-- 4. Realtime 실시간 동기화 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;`;

  return (
    <div className="app-container">
      {/* Dynamic Background Glows */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      {/* Header / Navbar */}
      <header className="navbar">
        <div className="nav-brand" onClick={() => setActiveTab('feed')}>
          <div className="logo-icon">
            <Zap size={22} className="logo-spark" />
          </div>
          <span className="brand-name">SUPA<span className="text-accent">NEXUS</span></span>
          <span className="badge-v2">2026 PRO</span>
        </div>

        <div className="nav-center">
          <button 
            className={`nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => { setActiveTab('feed'); setActivePost(null); }}
          >
            <MessageSquare size={16} /> 게시판 라운지
          </button>
          <button 
            className={`nav-tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <PlusCircle size={16} /> 글쓰기
          </button>
          <button 
            className={`nav-tab ${activeTab === 'mcp_guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('mcp_guide')}
          >
            <Code size={16} /> Supabase MCP / CLI 가이드
          </button>
        </div>

        <div className="nav-right">
          <button 
            className={`status-pill ${isConnected ? 'connected' : 'disconnected'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Database size={14} />
            <span>{isConnected ? 'Supabase 연동됨' : '데모 모드 (연동 설정)'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'feed' && !activePost && (
          <div className="feed-view fade-in">
            {/* Hero Banner */}
            <div className="hero-banner glass-card">
              <div className="hero-badge">
                <Sparkles size={14} /> 차세대 Supabase 백엔드 실시간 소통 커뮤니티
              </div>
              <h1 className="hero-title">
                개발자와 크리에이터를 위한 <br />
                <span className="gradient-text">SUPANEXUS Board</span>
              </h1>
              <p className="hero-sub">
                Supabase의 초고속 Postgres 백엔드와 차세대 MCP(Model Context Protocol) 기술로 구현된 차세대 포럼입니다. 자유롭게 의견을 나누고 아이디어를 공유하세요!
              </p>
              
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => setActiveTab('create')}>
                  <PlusCircle size={18} /> 새 이야기 작성하기
                </button>
                <button className="btn-secondary" onClick={() => setActiveTab('mcp_guide')}>
                  <Terminal size={18} /> Supabase MCP 가이드 보기
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar glass-card">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="제목, 내용 또는 작성자로 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="category-tabs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            <div className="posts-grid">
              {filteredPosts.length === 0 ? (
                <div className="empty-state glass-card">
                  <MessageSquare size={48} className="empty-icon" />
                  <h3>등록된 게시글이 없거나 검색 결과가 없습니다.</h3>
                  <p>첫 번째 게시글을 작성하여 소통을 시작해보세요!</p>
                  <button className="btn-primary" onClick={() => setActiveTab('create')}>
                    글 작성하기
                  </button>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div 
                    key={post.id} 
                    className="post-card glass-card hover-glow"
                    onClick={() => setActivePost(post)}
                  >
                    <div className="post-header">
                      <div className="post-author-info">
                        <div className="author-avatar">
                          {post.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="author-name">{post.author}</span>
                          <span className="post-date">
                            {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <span className="category-badge">{post.category}</span>
                    </div>

                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-snippet">{post.content}</p>

                    <div className="post-footer">
                      <div className="tags-list">
                        {post.tags?.map((t, idx) => (
                          <span key={idx} className="tag-pill">#{t}</span>
                        ))}
                      </div>

                      <div className="post-metrics">
                        <button 
                          className="like-btn"
                          onClick={(e) => handleLike(post.id, e)}
                        >
                          <Heart size={16} className={post.likes > 0 ? 'liked' : ''} />
                          <span>{post.likes}</span>
                        </button>
                        <div className="comments-count">
                          <MessageSquare size={16} />
                          <span>
                            {comments.filter(c => c.post_id === post.id).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Post Detail View */}
        {activeTab === 'feed' && activePost && (
          <div className="post-detail-view fade-in">
            <button className="btn-back" onClick={() => setActivePost(null)}>
              ← 게시판 목록으로 돌아가기
            </button>

            <article className="post-detail-card glass-card">
              <div className="post-header">
                <div className="post-author-info">
                  <div className="author-avatar large">
                    {activePost.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="author-name">{activePost.author}</h3>
                    <span className="post-date">
                      {new Date(activePost.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="category-badge">{activePost.category}</span>
              </div>

              <h1 className="detail-title">{activePost.title}</h1>
              <div className="detail-content">{activePost.content}</div>

              <div className="detail-footer">
                <div className="tags-list">
                  {activePost.tags?.map((t, idx) => (
                    <span key={idx} className="tag-pill">#{t}</span>
                  ))}
                </div>

                <button 
                  className="btn-like-large"
                  onClick={(e) => handleLike(activePost.id, e)}
                >
                  <Heart size={20} className={activePost.likes > 0 ? 'liked' : ''} />
                  <span>응원하기 ({activePost.likes})</span>
                </button>
              </div>
            </article>

            {/* Comments Section */}
            <section className="comments-section glass-card">
              <h3><MessageSquare size={20} /> 댓글 ({comments.filter(c => c.post_id === activePost.id).length})</h3>

              <form className="comment-form" onSubmit={handleAddComment}>
                <input 
                  type="text" 
                  placeholder="작성자 닉네임"
                  value={commentAuthor}
                  onChange={e => setCommentAuthor(e.target.value)}
                  className="input-author"
                  required
                />
                <div className="comment-input-group">
                  <textarea 
                    placeholder="따뜻한 한 마디와 소통의 댓글을 달아주세요..."
                    value={commentContent}
                    onChange={e => setCommentContent(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary">
                    <Send size={16} /> 작성
                  </button>
                </div>
              </form>

              <div className="comments-list">
                {comments
                  .filter(c => c.post_id === activePost.id)
                  .map(c => (
                    <div key={c.id} className="comment-item">
                      <div className="comment-avatar">
                        {c.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="comment-body">
                        <div className="comment-meta">
                          <span className="comment-author">{c.author}</span>
                          <span className="comment-time">
                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="comment-text">{c.content}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        )}

        {/* Create Post View */}
        {activeTab === 'create' && (
          <div className="create-view fade-in">
            <div className="glass-card form-container">
              <h2><PlusCircle className="text-accent" size={24} /> 새 커뮤니티 게시글 작성</h2>
              <p className="form-sub">Supabase 데이터베이스에 등록되어 전 세계 사용자들과 실시간으로 공유됩니다.</p>

              <form onSubmit={handleCreatePost} className="post-form">
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>작성자 닉네임</label>
                    <input 
                      type="text" 
                      placeholder="예: SupaDeveloper"
                      value={newAuthor}
                      onChange={e => setNewAuthor(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label>카테고리</label>
                    <select 
                      value={newCategory} 
                      onChange={e => setNewCategory(e.target.value)}
                    >
                      <option value="General">General (일반)</option>
                      <option value="Guide">Guide (가이드 & 팁)</option>
                      <option value="Design">Design (디자인)</option>
                      <option value="Discussion">Discussion (토론)</option>
                      <option value="Showcase">Showcase (자랑하기)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>게시글 제목</label>
                  <input 
                    type="text" 
                    placeholder="흥미로운 제목을 입력해 주세요"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>태그 (쉼표로 구분)</label>
                  <input 
                    type="text" 
                    placeholder="예: Supabase, React, MCP, Web3"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>내용</label>
                  <textarea 
                    rows={8}
                    placeholder="자유롭게 멋진 아이디어나 질문을 작성해 보세요..."
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setActiveTab('feed')}>
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
                    <Send size={18} /> 게시글 발행하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Supabase MCP & CLI Guide Tab */}
        {activeTab === 'mcp_guide' && (
          <div className="guide-view fade-in">
            <div className="glass-card guide-card">
              <div className="guide-header">
                <Terminal size={32} className="text-accent" />
                <div>
                  <h2>Supabase MCP Server & CLI 완벽 사용 가이드</h2>
                  <p>AI 에이전트(Claude, Cursor, Antigravity)와 Supabase를 연동하여 자연어로 DB를 조작하는 방법입니다.</p>
                </div>
              </div>

              <div className="guide-sections">
                {/* Section 1 */}
                <div className="guide-box">
                  <h3>1. 원격 Supabase MCP 서버 연동 (가장 추천)</h3>
                  <p>Supabase 호스팅 MCP를 사용하면 OAuth 인증으로 즉시 AI 에이전트와 연결됩니다.</p>
                  
                  <div className="code-block">
                    <div className="code-header">
                      <span>Claude Code / CLI 명령어</span>
                      <button onClick={() => handleCopy('claude mcp add supabase --transport http https://mcp.supabase.com/mcp', 'mcp-1')}>
                        {copiedCode === 'mcp-1' ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCode === 'mcp-1' ? '복사됨' : '복사'}
                      </button>
                    </div>
                    <pre><code>claude mcp add supabase --transport http https://mcp.supabase.com/mcp</code></pre>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="guide-box">
                  <h3>2. 로컬 / IDE MCP 설정 (mcp.json)</h3>
                  <p>Cursor, VS Code 또는 mcp.json 환경 파일에 직접 등록하는 방법입니다.</p>

                  <div className="code-block">
                    <div className="code-header">
                      <span>.cursor/mcp.json 또는 mcp_config.json</span>
                      <button onClick={() => handleCopy(`{\n  "mcpServers": {\n    "supabase": {\n      "command": "npx",\n      "args": [\n        "-y",\n        "@supabase/mcp-server-supabase@latest",\n        "--access-token",\n        "<YOUR_PERSONAL_ACCESS_TOKEN>"\n      ]\n    }\n  }\n}`, 'mcp-2')}>
                        {copiedCode === 'mcp-2' ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCode === 'mcp-2' ? '복사됨' : '복사'}
                      </button>
                    </div>
                    <pre><code>{`{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "<YOUR_PERSONAL_ACCESS_TOKEN>"
      ]
    }
  }
}`}</code></pre>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="guide-box">
                  <h3>3. Supabase CLI 설치 및 로컬 DB 개발</h3>
                  <div className="code-block">
                    <div className="code-header">
                      <span>Supabase CLI 명령어</span>
                      <button onClick={() => handleCopy('# Windows Scoop으로 설치\nscoop bucket add supabase https://github.com/supabase/scoop-bucket.git\nscoop install supabase\n\n# 또는 npm으로 실행\nnpx supabase init\nnpx supabase start', 'mcp-3')}>
                        {copiedCode === 'mcp-3' ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCode === 'mcp-3' ? '복사됨' : '복사'}
                      </button>
                    </div>
                    <pre><code>{`# Supabase 프로젝트 초기화
npx supabase init

# 로컬 개발 서버 시작 (Docker 필요)
npx supabase start

# Supabase 데이터베이스 로그인 & 마이그레이션
npx supabase login
npx supabase db push`}</code></pre>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="guide-box">
                  <h3>4. 게시판을 위한 SQL 테이블 자동 생성 스크립트</h3>
                  <p>Supabase Dashboard &gt; SQL Editor에 아래 쿼리를 실행하여 게시판 테이블을 구성하세요.</p>

                  <div className="code-block">
                    <div className="code-header">
                      <span>Postgres SQL Script</span>
                      <button onClick={() => handleCopy(sqlSchemaCode, 'mcp-sql')}>
                        {copiedCode === 'mcp-sql' ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCode === 'mcp-sql' ? '복사됨' : '복사'}
                      </button>
                    </div>
                    <pre><code>{sqlSchemaCode}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings / Supabase Key Input View */}
        {activeTab === 'settings' && (
          <div className="settings-view fade-in">
            <div className="glass-card form-container">
              <h2><Database className="text-accent" size={24} /> 내 Supabase 프로젝트 연동 설정</h2>
              <p className="form-sub">Supabase Dashboard Project Settings &gt; API에서 URL과 anon public key를 복사해 입력하세요.</p>

              <div className="settings-form">
                <div className="form-group">
                  <label><ExternalLink size={14} /> Supabase Project URL</label>
                  <input 
                    type="text" 
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrl}
                    onChange={e => setSupabaseUrl(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label><Key size={14} /> Supabase Anon / Public Key</label>
                  <input 
                    type="password" 
                    placeholder="eyJhYmdj..."
                    value={supabaseKey}
                    onChange={e => setSupabaseKey(e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => saveCredentials('', '')}
                  >
                    초기화 (데모 모드)
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={() => saveCredentials(supabaseUrl, supabaseKey)}
                  >
                    <ShieldCheck size={18} /> Supabase 연동 저장하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Built with Supabase, React & Model Context Protocol (MCP) • Crafted for Extreme UI/UX Experience</p>
      </footer>
    </div>
  );
}

export default App;
