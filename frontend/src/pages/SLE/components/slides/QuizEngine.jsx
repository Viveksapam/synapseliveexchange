import React, { useState, useEffect } from 'react';
import { useCourse } from '../../hooks/useCourse';
import './QuizEngine.css';

const ATTEMPT_STORAGE_KEY = 'sle_quiz_attempts';
const COOLDOWN_MS = 8 * 60 * 60 * 1000; // 8 hours

function getAttemptData(quizId) {
  try {
    const raw = localStorage.getItem(ATTEMPT_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[quizId] || { count: 0, firstAttemptTime: null };
  } catch {
    return { count: 0, firstAttemptTime: null };
  }
}

function saveAttemptData(quizId, attemptData) {
  try {
    const raw = localStorage.getItem(ATTEMPT_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[quizId] = attemptData;
    localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(all));
  } catch { /* silent */ }
}

function getTimeRemaining(firstAttemptTime) {
  const elapsed = Date.now() - firstAttemptTime;
  const remaining = COOLDOWN_MS - elapsed;
  if (remaining <= 0) return null;
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function QuizEngine({ data }) {
  const { state, dispatch } = useCourse();
  const savedAnswer = state.userAnswers[data.id];
  
  const [hasStarted, setHasStarted] = useState(savedAnswer !== undefined);
  const [selectedIdx, setSelectedIdx] = useState(savedAnswer !== undefined ? savedAnswer : null);
  const [showFeedback, setShowFeedback] = useState(savedAnswer !== undefined);
  const [attemptInfo, setAttemptInfo] = useState(getAttemptData(data.id));
  const [cooldownText, setCooldownText] = useState(null);

  const maxAttempts = data.maxAttempts || null; // null = unlimited
  const hasLimit = maxAttempts !== null;

  // Check cooldown on mount and every minute
  useEffect(() => {
    if (!hasLimit) return;

    const check = () => {
      const info = getAttemptData(data.id);
      if (info.count >= maxAttempts && info.firstAttemptTime) {
        const remaining = getTimeRemaining(info.firstAttemptTime);
        if (remaining) {
          setCooldownText(remaining);
        } else {
          // Cooldown expired — reset attempts
          const resetData = { count: 0, firstAttemptTime: null };
          saveAttemptData(data.id, resetData);
          setAttemptInfo(resetData);
          setCooldownText(null);
          setHasStarted(false);
          setSelectedIdx(null);
          setShowFeedback(false);
        }
      } else {
        setCooldownText(null);
      }
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [data.id, hasLimit, maxAttempts]);

  const handleStart = () => {
    if (hasLimit && attemptInfo.count >= maxAttempts && cooldownText) return;
    setHasStarted(true);
  };

  const handleSelect = (idx) => {
    if (showFeedback) return;
    setSelectedIdx(idx);
  };

  const handleSubmit = () => {
    if (selectedIdx === null) return;
    
    dispatch({
      type: 'SAVE_ANSWER',
      payload: { slideId: data.id, answer: selectedIdx }
    });
    
    setShowFeedback(true);

    // Track attempts
    if (hasLimit) {
      const current = getAttemptData(data.id);
      const updated = {
        count: current.count + 1,
        firstAttemptTime: current.firstAttemptTime || Date.now()
      };
      saveAttemptData(data.id, updated);
      setAttemptInfo(updated);
    }
  };

  const isCorrect = selectedIdx === data.correctAnswer;
  const attemptsUsed = attemptInfo.count;
  const isLockedOut = hasLimit && attemptsUsed >= maxAttempts && cooldownText;

  // Gate screen
  if (!hasStarted) {
    return (
      <div className="quiz-container">
        <h2 className="slide-title quiz-gate-title">{data.title}</h2>
        <div className="quiz-gate">
          <div className="quiz-gate-icon">📝</div>
          <p className="quiz-gate-text">This is a graded assessment. Your answer will count toward your final score.</p>
          
          {hasLimit && (
            <div className="quiz-gate-limit">
              <span className="limit-label">Attempt Limit:</span>
              <span className="limit-value">{maxAttempts} attempts per 8 hours</span>
            </div>
          )}

          {hasLimit && attemptsUsed > 0 && (
            <div className="quiz-gate-used">
              Attempts used: {attemptsUsed} / {maxAttempts}
            </div>
          )}

          {isLockedOut ? (
            <div className="quiz-lockout">
              <span className="lockout-icon">🔒</span>
              <p>You've used all {maxAttempts} attempts.</p>
              <p className="lockout-timer">Resets in: {cooldownText}</p>
            </div>
          ) : (
            <button className="nav-btn quiz-start-btn" onClick={handleStart}>
              BEGIN ASSESSMENT
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active quiz
  return (
    <div className="quiz-container">
      <h2 className="slide-title quiz-active-title">{data.title}</h2>
      
      {hasLimit && (
        <div className="quiz-attempt-badge">
          Attempt {Math.min(attemptsUsed + (showFeedback ? 0 : 1), maxAttempts)} of {maxAttempts}
        </div>
      )}

      <div className="quiz-question">
        {data.question}
      </div>

      <div className="quiz-options">
        {data.options.map((opt, idx) => (
          <button
            key={idx}
            className={`quiz-option ${selectedIdx === idx ? 'selected' : ''}`}
            onClick={() => handleSelect(idx)}
            disabled={showFeedback}
          >
            [{idx + 1}] {opt}
          </button>
        ))}
      </div>

      {!showFeedback && (
        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button className="nav-btn" onClick={handleSubmit} disabled={selectedIdx === null}>
            SUBMIT_ANSWER
          </button>
        </div>
      )}

      {showFeedback && (
        <div className={`quiz-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
          {isCorrect ? '✓ Correct!' : '✗ Incorrect.'}
        </div>
      )}
    </div>
  );
}

