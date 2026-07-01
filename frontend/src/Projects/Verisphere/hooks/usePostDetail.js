import { useState, useEffect, useCallback } from 'react';
import {
  fetchPostDetail, postCreateSource, postCreateComment, postAnalyzeComment, deleteComment, postAnalyzePost,
} from '../api/verisphereApi';

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
        dictAiMetrics: { sentiment: data.sentiment, relevance_score: data.relevance_score },
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
    try {
      const data = await postAnalyzePost(postId, strToken);
      setObjPostState((prev) => ({
        ...prev,
        verifiable: data.verifiable,
        logical_soundness: data.logical_soundness,
        ai_summary: data.ai_summary,
        ai_context_guardrail: data.ai_context_guardrail,
        analysis_detail: data.analysis_detail,
        dictAiMetrics: {
          verifiable: data.verifiable,
          logical_soundness: data.logical_soundness,
        },
      }));

      // "Analyze Post & Discussion" also audits every comment in the thread.
      // Note: we intentionally do NOT refetch the post afterward — the comments
      // endpoint doesn't return per-comment analysis, so a reload would wipe the
      // in-place results below. AI-recommended sources are added as pending on
      // the backend and surface fresh when the user opens "+ In Review".
      const arrCommentIds = collectCommentIds(objPostState?.comments);
      // Run sequentially to keep per-comment loading indicators meaningful and
      // avoid hammering the backend with a burst of requests.
      for (const numCommentId of arrCommentIds) {
        await analyzeComment(numCommentId);
      }
    } catch (objErr) {
      console.error('Failed to analyze post', objErr);
    } finally {
      setBoolIsAnalyzingPostState(false);
    }
  };

  return {
    objPostState, boolIsLoadingState, loadingCommentsState, boolIsAnalyzingPostState,
    submitComment, submitSource, analyzeComment, analyzePost, handleDeleteComment,
    refetch: loadPost,
  };
};
