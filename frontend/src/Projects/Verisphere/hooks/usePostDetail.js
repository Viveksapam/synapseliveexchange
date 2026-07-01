import { useState, useEffect, useCallback } from 'react';
import {
  fetchPostDetail, postCreateSource, postCreateComment, postAnalyzeComment, deleteComment, postAnalyzePost,
  fetchApprovedSources,
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
const applyCommentAnalysis = (comments = [], numCommentId, data) =>
  comments.map((c) => {
    if (c.id === numCommentId) {
      return {
        ...c,
        strAiAnalysis: data.ai_summary,
        dictAiMetrics: { sentiment: data.sentiment, relevance_score: data.relevance_score, analyzed_at: data.analyzed_at },
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

  const analyzePost = async () => {
    setBoolIsAnalyzingPostState(true);
    setStrAnalysisPhaseState('post');
    try {
      // Step 1: Analyze the post
      const data = await withMinDuration(() => postAnalyzePost(postId, strToken), 600);
      setObjPostState((prev) => ({
        ...prev,
        verifiable: data.verifiable,
        logical_soundness: data.logical_soundness,
        ai_summary: data.ai_summary,
        ai_context_guardrail: data.ai_context_guardrail,
        analysis_detail: data.analysis_detail,
        analyzed_at: data.analyzed_at,
        dictAiMetrics: {
          verifiable: data.verifiable,
          logical_soundness: data.logical_soundness,
        },
      }));

      // Step 2: Analyze comments in the thread
      setStrAnalysisPhaseState('comments');
      const arrCommentIds = collectCommentIds(objPostState?.comments);
      await withMinDuration(async () => {
        for (const numCommentId of arrCommentIds) {
          await analyzeComment(numCommentId);
        }
      }, 600);

      // Step 3: Refresh approved sources (Synapse AI auto-approves its recommendations)
      setStrAnalysisPhaseState('sources');
      const arrSources = await withMinDuration(() => fetchApprovedSources(postId), 600);
      setObjPostState((prev) => (prev ? { ...prev, sources: arrSources } : prev));

      // Step 4: Reload the full post to capture all updates (analysis, new sources, etc.)
      setStrAnalysisPhaseState('reload');
      await withMinDuration(() => loadPost(), 600);

      // Step 5: Briefly show 100% complete before closing the overlay.
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
    submitComment, submitSource, analyzeComment, analyzePost, handleDeleteComment,
    refetch: loadPost,
  };
};
