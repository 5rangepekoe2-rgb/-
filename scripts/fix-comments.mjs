import fs from 'node:fs';

const path = 'src/App.tsx';
const source = fs.readFileSync(path, 'utf8');

const oldHandler = `  const handleAddComment = async (e: React.FormEvent) => {
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
  };`;

const newHandler = `  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    const author = commentAuthor.trim();
    const content = commentContent.trim();
    if (!activePost || !author || !content) {
      alert('작성자와 댓글 내용을 입력해 주세요.');
      return;
    }

    if (!supabaseClient || !isConnected) {
      alert('Supabase 연결이 필요합니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    try {
      let targetPost = activePost;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetPost.id);

      // Mock/local post IDs cannot be used by comments.post_id(UUID).
      // Persist the post first and replace it with the real Supabase UUID.
      if (!isUuid) {
        const { data: persistedPosts, error: postError } = await supabaseClient
          .from('posts')
          .insert([{
            author: targetPost.author,
            title: targetPost.title,
            content: targetPost.content,
            category: targetPost.category,
            likes: targetPost.likes,
            tags: targetPost.tags || []
          }])
          .select();

        if (postError || !persistedPosts?.[0]) {
          throw new Error(postError?.message || '게시글을 Supabase에 저장하지 못했습니다.');
        }

        const persistedPost = persistedPosts[0] as Post;
        const replacedPosts = posts.map(p => p.id === targetPost.id ? persistedPost : p);
        savePostsState(replacedPosts);
        setActivePost(persistedPost);
        targetPost = persistedPost;
      }

      const { data, error } = await supabaseClient
        .from('comments')
        .insert([{
          post_id: targetPost.id,
          author,
          content
        }])
        .select();

      if (error || !data?.[0]) {
        throw new Error(error?.message || '댓글 저장 결과를 확인하지 못했습니다.');
      }

      const savedComment = data[0] as Comment;
      saveCommentsState([...comments.filter(c => c.id !== savedComment.id), savedComment]);
      setCommentContent('');

      // Re-read from Supabase so the UI always reflects the server state.
      await fetchSupabaseComments(supabaseClient);
    } catch (err: any) {
      console.error('Comment save error:', err);
      alert('댓글 저장에 실패했습니다: ' + (err?.message || '알 수 없는 오류'));
    }
  };`;

if (source.includes(newHandler)) {
  console.log('Comment fix already applied.');
  process.exit(0);
}

if (!source.includes(oldHandler)) {
  console.error('Expected comment handler was not found; refusing to modify App.tsx.');
  process.exit(1);
}

fs.writeFileSync(path, source.replace(oldHandler, newHandler), 'utf8');
console.log('Supabase comment handler fixed.');
