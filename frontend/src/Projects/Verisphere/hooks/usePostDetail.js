import { useState, useEffect, useCallback } from 'react';
import {
  fetchPostDetail, postCreateSource, postCreateComment, postAnalyzeComment, deleteComment,
} from '../api/verisphereApi';

export const usePostDetail = (postId, strToken, boolIsLoggedIn) => {
  const [objPostState, setObjPostState] = useState(null);
  const [boolIsLoadingState, setBoolIsLoadingState] = useState(true);
  const [loadingCommentsState, setLoadingCommentsState] = useState({});

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
      const data = await postAnalyzeComment(numCommentId);
      setObjPostState((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === numCommentId ? { ...c, strAiAnalysis: data.strAiAnalysis, dictAiMetrics: data.dictAiMetrics } : c
        ),
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

  return {
    objPostState, boolIsLoadingState, loadingCommentsState,
    submitComment, submitSource, analyzeComment, handleDeleteComment,
  };
};
