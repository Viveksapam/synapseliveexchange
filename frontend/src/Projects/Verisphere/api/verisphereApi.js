import { API_BASE } from '../../../api/config';
import { mockCommunities, mockComments, mapBlogToPost } from './verisphereMocks';

const VIVEK_USER_ID = 3;

const blogIdFromString = (idOrString) => {
  const strId = String(idOrString);
  return strId.startsWith('blog_') ? parseInt(strId.replace('blog_', ''), 10) : parseInt(strId, 10);
};

const noCacheHeaders = { 'Cache-Control': 'no-cache', Pragma: 'no-cache' };

export const fetchCommunities = async () => mockCommunities;

export const fetchCommunityDetail = async (numId) => {
  const objCommunity = mockCommunities.find((c) => c.id === parseInt(numId, 10));
  if (!objCommunity) throw new Error('Community not found');
  return objCommunity;
};

export const postCreateCommunity = async (objCommunityData) => {
  const objNew = { id: Date.now(), ...objCommunityData, member_count: 1 };
  mockCommunities.push(objNew);
  return objNew;
};

export const postJoinCommunity = async () => ({ status: 'joined' });

export const fetchPosts = async (numCommunityId = null) => {
  try {
    const objResponse = await fetch(`${API_BASE}/verisphere/blogs/`, { headers: noCacheHeaders });
    if (!objResponse.ok) return [];
    const arrBlogs = await objResponse.json();
    let arrPosts = arrBlogs.map(mapBlogToPost);

    // comments_count from API already includes all comments + replies
    arrPosts.sort((a, b) => b.numUpvotes - a.numUpvotes);
    if (numCommunityId) {
      arrPosts = arrPosts.filter(
        (p) => p.objCommunity === parseInt(numCommunityId, 10) || p.objCommunity === String(numCommunityId)
      );
    }
    return arrPosts;
  } catch (objErr) {
    console.error('Failed to fetch blogs for verisphere', objErr);
    return [];
  }
};

export const postToggleFeatured = async (numPostId, boolCurrentlyFeatured, strToken) => {
  const numBlogId = blogIdFromString(numPostId);
  try {
    const objResponse = await fetch(`${API_BASE}/verisphere/blogs/featured/${numBlogId}`, {
      method: boolCurrentlyFeatured ? 'DELETE' : 'POST',
      headers: { Authorization: `Bearer ${strToken}` },
    });
    return objResponse.ok;
  } catch (objErr) {
    console.error('Failed to toggle featured status', objErr);
    return false;
  }
};

const loadRepliesRecursively = async (numBlogId, numCommentId) => {
  try {
    const repliesResponse = await fetch(`${API_BASE}/verisphere/blogs/${numBlogId}/comments/${numCommentId}/replies/`, { headers: noCacheHeaders });
    const arrReplies = repliesResponse.ok ? await repliesResponse.json() : [];

    // Recursively load replies for each reply (deep nesting like Reddit)
    return await Promise.all(arrReplies.map(async (reply) => {
      const nestedReplies = await loadRepliesRecursively(numBlogId, reply.id);
      return { ...reply, replies: nestedReplies };
    }));
  } catch {
    return [];
  }
};

export const fetchPostDetail = async (idOrString) => {
  const numBlogId = blogIdFromString(idOrString);
  const objResponse = await fetch(`${API_BASE}/verisphere/blogs/`, { headers: noCacheHeaders });
  if (!objResponse.ok) throw new Error('Post not found');
  const arrBlogs = await objResponse.json();
  const objBlog = arrBlogs.find((b) => b.id === numBlogId);
  if (!objBlog) throw new Error('Post not found');
  try {
    const commentsResponse = await fetch(`${API_BASE}/verisphere/blogs/${numBlogId}/comments/`, { headers: noCacheHeaders });
    let arrComments = commentsResponse.ok ? await commentsResponse.json() : [];

    // Load replies recursively for each top-level comment
    arrComments = await Promise.all(arrComments.map(async (comment) => {
      const nestedReplies = await loadRepliesRecursively(numBlogId, comment.id);
      return { ...comment, replies: nestedReplies };
    }));

    const objPost = mapBlogToPost(objBlog);
    objPost.comments = arrComments;
    objPost.comments_count = arrComments.length;

    // Load only approved sources for this post (Community Sources shows the verified list)
    try {
      const sourcesResponse = await fetch(`${API_BASE}/verisphere/blogs/${numBlogId}/sources/?status=approved`, { headers: noCacheHeaders });
      objPost.sources = sourcesResponse.ok ? await sourcesResponse.json() : [];
    } catch {
      objPost.sources = [];
    }

    return objPost;
  } catch {
    const objPost = mapBlogToPost(objBlog);
    objPost.comments = [];
    objPost.comments_count = 0;
    objPost.sources = [];
    return objPost;
  }
};

export const postCreatePost = async (objPostData) => ({
  id: `blog_${Date.now()}`,
  ...objPostData,
  author_name: 'CurrentUser',
  created_at: new Date().toISOString(),
  score: 0, comments_count: 0,
});

export const postCreateSource = async (numPostId, objSourceData) => {
  const numBlogId = blogIdFromString(numPostId);
  const objResponse = await fetch(`${API_BASE}/verisphere/blogs/${numBlogId}/sources/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(objSourceData),
  });
  if (!objResponse.ok) {
    const strDetail = await objResponse.text().catch(() => '');
    throw new Error(`Failed to submit source (${objResponse.status}): ${strDetail}`);
  }
  return objResponse.json();
};

export const fetchPendingSources = async (numPostId) => {
  const numBlogId = blogIdFromString(numPostId);
  try {
    const objResponse = await fetch(`${API_BASE}/verisphere/blogs/${numBlogId}/sources/?status=pending`, { headers: noCacheHeaders });
    return objResponse.ok ? await objResponse.json() : [];
  } catch {
    return [];
  }
};

export const postApproveSource = async (numSourceId, strToken) => {
  try {
    const objResponse = await fetch(`${API_BASE}/verisphere/sources/${numSourceId}/approve/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${strToken}` },
    });
    return objResponse.ok ? await objResponse.json() : null;
  } catch {
    return null;
  }
};

export const postCreateComment = async (numPostId, objCommentData) => {
  const numBlogId = blogIdFromString(numPostId);
  try {
    if (objCommentData.objParent) {
      const objResponse = await fetch(`${API_BASE}/verisphere/blogs/${numBlogId}/comments/${objCommentData.objParent}/replies/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strContent: objCommentData.strContent, strAuthor: 'CurrentUser' }),
      });
      if (objResponse.ok) return await objResponse.json();
    } else {
      const objResponse = await fetch(`${API_BASE}/verisphere/blogs/${numBlogId}/comments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strContent: objCommentData.strContent, strAuthor: 'CurrentUser' }),
      });
      if (objResponse.ok) return await objResponse.json();
    }
  } catch (objErr) {
    console.error('Failed to create comment:', objErr);
  }
  return null;
};

export const postVote = async () => ({ success: true });

export const fetchPostReactions = async (numPostId) => {
  const numBlogId = blogIdFromString(numPostId);
  try {
    const objResponse = await fetch(`${API_BASE}/verisphere/blogs/${numBlogId}/reactions?user_id=${VIVEK_USER_ID}`);
    if (objResponse.ok) return await objResponse.json();
  } catch (objErr) {
    console.error('Failed to fetch reactions', objErr);
  }
  return { reactions: {}, user_reacted: {} };
};

export const postToggleReaction = async (numPostId, strEmoji) => {
  const numBlogId = blogIdFromString(numPostId);
  try {
    const objResponse = await fetch(`${API_BASE}/verisphere/blogs/${numBlogId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji: strEmoji, user_id: VIVEK_USER_ID }),
    });
    if (objResponse.ok) return await objResponse.json();
  } catch (objErr) {
    console.error('Failed to toggle reaction', objErr);
  }
  return { status: 'error' };
};

export const postAnalyzeContext = async () => ({ summary: 'Mock AI analysis of the post context.' });

export const postAnalyzePost = async (numPostId, strToken) => {
  const numBlogId = blogIdFromString(numPostId);
  try {
    const objResponse = await fetch(`${API_BASE}/verisphere/blogs/${numBlogId}/analysis/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(strToken && { Authorization: `Bearer ${strToken}` }) },
    });
    if (objResponse.ok) return await objResponse.json();
  } catch (objErr) {
    console.error('Failed to analyze post:', objErr);
  }
  return {
    verifiable: 'yes',
    logical_soundness: 0,
    ai_summary: 'Analysis unavailable',
    ai_context_guardrail: '',
    analysis_detail: null,
  };
};

export const postAnalyzeComment = async (numCommentId, strToken) => {
  try {
    const objResponse = await fetch(`${API_BASE}/verisphere/comments/${numCommentId}/analyze/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(strToken && { Authorization: `Bearer ${strToken}` }) },
    });
    if (objResponse.ok) return await objResponse.json();
  } catch (objErr) {
    console.error('Failed to analyze comment:', objErr);
  }
  return { sentiment: null, relevance_score: 0.5, ai_summary: 'Analysis unavailable' };
};

export const deleteComment = async (numPostId, numCommentId) => {
  const numBlogId = blogIdFromString(numPostId);
  try {
    const objResponse = await fetch(`${API_BASE}/verisphere/blogs/${numBlogId}/comments/${numCommentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (objResponse.ok) return await objResponse.json();
  } catch (objErr) {
    console.error('Failed to delete comment:', objErr);
  }
  return null;
};
