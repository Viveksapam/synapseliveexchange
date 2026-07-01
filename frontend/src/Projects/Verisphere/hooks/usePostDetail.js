import { useState, useEffect, useCallback } from 'react';
import {
  fetchPostDetail, postCreateSource, postCreateComment, postAnalyzeComment, deleteComment, postAnalyzePost,
  fetchApprovedSources, postAnalyzeCommentsBatch,
} from '../api/verisphereApi';

// Ensures a phase stays visible for at least `numMs`, even if the underlying
// request resolves instantly - so the loading overlay reads as real progress
// rather than a flicker.
const withMinDuration = async (promiseFn, numMs) => {
  const [result] = await Promise.all([
    promiseFn(),
    new Promise((resolve) => setTimeout(resolve, numMs)),
  ]);
  return result;
};

// Recursively gather every comment id in the thread (top-level + nested replies).
const collectCommentIds = (comments = []) =>
  comments.flatMap((c) => [c.id, ...collectCommentIds(c.replies)]);

// Recursively apply an analysis result to the matching comment anywhere in the tree.
// Pure prose only now - no sentiment/relevance_score fields.
const applyCommentAnalysis = (comments = [], numCommentId, data) =>
  comments.map((c) => {
    if (c.id === numCommentId) {
      return {
        ...c,
        strAiAnalysis: data.ai_summary,
        dictAiMetrics: { analyzed_at: data.analyzed_at },
      };
    }
    return c.replies?.length
      ? { ...c, replies: applyCommentAnalysis(c.replies, numCommentId, data) }
      : c;
  });

export const usePostDetail = (postId, strToken, boolIsLoggedIn) => {
  const [objPostState, setObjPostState] = useState(null);
  const [boolIsLoadingState, setBoolIsLoadingState] = useState(true);
  const [loadingCommentsState, setLoadingCommentsState] = useState({});
  const [boolIsAnalyzingPostState, setBoolIsAnalyzingPostState] = useState(false);
  const [strAnalysisPhaseState, setStrAnalysisPhaseState] = useState(null);
  const [boolIsAnalyzingCommentsState, setBoolIsAnalyzingCommentsState] = useState(false);

  const loadPost = useCallback(async () => {
    try {
      const data = await fetchPostDetail(postId);
      setObjPostState(data);
    } catch (objErr) {
      console.error('Error fetching post detail:', objErr);
    } finally {
      setBoolIsLoadingState(false);
    }
  }, [postId]);

  useEffect(() => { loadPost(); }, [loadPost]);

  const submitComment = async (objCommentData) => {
    if (!boolIsLoggedIn) return false;
    await postCreateComment(postId, objCommentData, strToken);
    await loadPost();
    return true;
  };

  const submitSource = async (objSourceData) => {
    if (!boolIsLoggedIn) return false;
    await postCreateSource(postId, objSourceData, strToken);
    await loadPost();
    return true;
  };

  const analyzeComment = async (numCommentId) => {
    setLoadingCommentsState((prev) => ({ ...prev, [numCommentId]: true }));
    try {
      const data = await postAnalyzeComment(numCommentId, strToken);
      setObjPostState((prev) => ({
        ...prev,
        comments: applyCommentAnalysis(prev.comments, numCommentId, data),
      }));
    } catch (objErr) {
      console.error('Failed to analyze comment', objErr);
      alert(objErr.message || 'Failed to analyze comment.');
    } finally {
      setLoadingCommentsState((prev) => ({ ...prev, [numCommentId]: false }));
    }
  };

  // Analyzes every not-yet-analyzed comment on this post in ONE request,
  // deliberately kept SEPARATE from analyzePost() - the post's claim/sources
  // audit and the discussion's comment audit are two independent actions now,
  // triggered independently (e.g. from the comments page).
  const analyzeAllComments = async () => {
    const arrCommentIds = collectCommentIds(objPostState?.comments);
    if (arrCommentIds.length === 0) return;
    setBoolIsAnalyzingCommentsState(true);
    try {
      const batchResult = await postAnalyzeCommentsBatch(postId, strToken);
      setObjPostState((prev) => {
        if (!prev) return prev;
        let comments = prev.comments;
        for (const item of batchResult.analyzed || []) {
          comments = applyCommentAnalysis(comments, item.comment_id, item);
        }
        return { ...prev, comments };
      });
    } catch (objErr) {
      console.error('Failed to analyze comments', objErr);
      alert(objErr.message || 'Failed to analyze comments. Please try again.');
    } finally {
      setBoolIsAnalyzingCommentsState(false);
    }
  };

  const handleDeleteComment = async (numCommentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(postId, numCommentId);
      await loadPost();
    } catch (objErr) {
      console.error('Failed to delete comment', objErr);
      alert('Failed to delete comment');
    }
  };

  // Analyzes ONLY the post's claim + its community sources - no comments.
  // See analyzeAllComments() for the separate, decoupled discussion analysis.
  const analyzePost = async () => {
    setBoolIsAnalyzingPostState(true);
    setStrAnalysisPhaseState('post');
    try {
      const data = await withMinDuration(() => postAnalyzePost(postId, strToken), 600);
      setObjPostState((prev) => ({
        ...prev,
        ai_summary: data.ai_summary,
        ai_context_guardrail: data.ai_context_guardrail,
        analysis_detail: data.analysis_detail,
        analyzed_at: data.analyzed_at,
      }));

      // Refresh approved sources (Synapse AI auto-approves its recommendations)
      setStrAnalysisPhaseState('sources');
      const arrSources = await withMinDuration(() => fetchApprovedSources(postId), 600);
      setObjPostState((prev) => (prev ? { ...prev, sources: arrSources } : prev));

      // Reload the full post to capture all updates (analysis, new sources, etc.)
      setStrAnalysisPhaseState('reload');
      await withMinDuration(() => loadPost(), 600);

      // Briefly show 100% complete before closing the overlay.
      setStrAnalysisPhaseState('done');
      await new Promise((resolve) => setTimeout(resolve, 900));
    } catch (objErr) {
      console.error('Failed to analyze post', objErr);
      alert(objErr.message || 'Failed to analyze this post. Please try again.');
    } finally {
      setBoolIsAnalyzingPostState(false);
      setStrAnalysisPhaseState(null);
    }
  };

  return {
    objPostState, boolIsLoadingState, loadingCommentsState, boolIsAnalyzingPostState, strAnalysisPhaseState,
    boolIsAnalyzingCommentsState,
    submitComment, submitSource, analyzeComment, analyzeAllComments, analyzePost, handleDeleteComment,
    refetch: loadPost,
  };
};
