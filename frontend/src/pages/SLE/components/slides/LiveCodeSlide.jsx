import React, { useState, useEffect, useRef } from 'react';
import { useCourse } from '../../hooks/useCourse';
import './LiveCodeSlide.css';
import { SyntaxHighlighter } from './SyntaxHighlighter';

const ATTEMPT_STORAGE_KEY = 'sle_sandbox_attempts';
const COOLDOWN_MS = 8 * 60 * 60 * 1000; // 8 hours

function getAttemptData(slideId) {
  try {
    const raw = localStorage.getItem(ATTEMPT_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[slideId] || { count: 0, firstAttemptTime: null };
  } catch {
    return { count: 0, firstAttemptTime: null };
  }
}

function saveAttemptData(slideId, attemptData) {
  try {
    const raw = localStorage.getItem(ATTEMPT_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[slideId] = attemptData;
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

export function LiveCodeSlide({ data }) {
  const { state, dispatch } = useCourse();
  const savedStatus = state.userAnswers[data.id];
  
  const preRef = useRef(null);

  const hasValidations = data.validations && data.validations.length > 0;
  
  const [hasStarted, setHasStarted] = useState(!hasValidations || savedStatus === true);
  const [cssCode, setCssCode] = useState(data.initialCss || '');
  const [feedbackMsg, setFeedbackMsg] = useState(savedStatus === true ? 'TASK COMPLETED: Verification Passed.' : '');
  const [isSuccess, setIsSuccess] = useState(savedStatus === true);
  
  const [attemptInfo, setAttemptInfo] = useState(getAttemptData(data.id));
  const [cooldownText, setCooldownText] = useState(null);

  const maxAttempts = data.maxAttempts || null;
  const hasLimit = hasValidations && maxAttempts !== null;

  useEffect(() => {
    if (!hasLimit) return;

    const check = () => {
      const info = getAttemptData(data.id);
      if (info.count >= maxAttempts && info.firstAttemptTime && !isSuccess) {
        const remaining = getTimeRemaining(info.firstAttemptTime);
        if (remaining) {
          setCooldownText(remaining);
        } else {
          const resetData = { count: 0, firstAttemptTime: null };
          saveAttemptData(data.id, resetData);
          setAttemptInfo(resetData);
          setCooldownText(null);
          setHasStarted(false);
          setFeedbackMsg('');
        }
      } else {
        setCooldownText(null);
      }
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [data.id, hasLimit, maxAttempts, isSuccess]);

  const handleStart = () => {
    if (hasLimit && attemptInfo.count >= maxAttempts && cooldownText && !isSuccess) return;
    setHasStarted(true);
  };

  const handleSubmit = () => {
    if (isSuccess) return; // already passed

    if (!hasValidations) {
      dispatch({ type: 'SAVE_ANSWER', payload: { slideId: data.id, answer: true } });
      setIsSuccess(true);
      setFeedbackMsg('TASK COMPLETED: Verification Passed.');
      return;
    }

    let passed = true;
    let errorMsg = '';

    // Check validations
    for (let i = 0; i < data.validations.length; i++) {
      const v = data.validations[i];
      const regex = new RegExp(v.regex, 'i');
      if (!regex.test(cssCode)) {
        passed = false;
        errorMsg = `ERROR: ${v.errorMessage}`;
        break;
      }
    }

    if (passed) {
      dispatch({ type: 'SAVE_ANSWER', payload: { slideId: data.id, answer: true } });
      setIsSuccess(true);
      setFeedbackMsg('TASK COMPLETED: Verification Passed.');
    } else {
      setIsSuccess(false);
      setFeedbackMsg(errorMsg);
    }

    // Track attempts
    if (hasLimit && !passed) {
      const current = getAttemptData(data.id);
      const updated = {
        count: current.count + 1,
        firstAttemptTime: current.firstAttemptTime || Date.now()
      };
      saveAttemptData(data.id, updated);
      setAttemptInfo(updated);
      
      if (updated.count >= maxAttempts) {
        setHasStarted(false); // kick them out to gate screen
      }
    }
  };

  const attemptsUsed = attemptInfo.count;
  const isLockedOut = hasLimit && attemptsUsed >= maxAttempts && cooldownText && !isSuccess;

  // Gate screen for validated interactive tasks
  if (!hasStarted) {
    return (
      <div className="slide-container">
        <h2 className="slide-title quiz-gate-title">{data.title}</h2>
        <div className="quiz-gate">
          <div className="quiz-gate-icon">💻</div>
          <p className="quiz-gate-text">This is a graded interactive coding challenge. You will need to write CSS to pass the validations.</p>
          
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
              START CHALLENGE
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="live-code-container slide-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
        <h2 className="slide-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>{data.title}</h2>
        {hasLimit && !isSuccess && (
          <div className="quiz-attempt-badge" style={{ marginBottom: 0 }}>
            Attempt {attemptsUsed + 1} of {maxAttempts}
          </div>
        )}
      </div>

      <p className="slide-paragraph">{data.instruction}</p>
      
      <div className="live-code-workspace">
        <div className="editor-pane">
          <div className="pane-header">STYLE.CSS</div>
          <div className="code-editor-container">
            <pre className="code-editor-highlight" ref={preRef} aria-hidden="true">
              <SyntaxHighlighter code={cssCode + (cssCode.endsWith('\n') ? ' ' : '')} language="css" />
            </pre>
            <textarea 
              className="code-editor"
              value={cssCode}
              onChange={(e) => {
                setCssCode(e.target.value);
                if (feedbackMsg && !isSuccess) setFeedbackMsg('');
              }}
              onScroll={(e) => {
                if (preRef.current) {
                  preRef.current.scrollTop = e.target.scrollTop;
                  preRef.current.scrollLeft = e.target.scrollLeft;
                }
              }}
              spellCheck="false"
              disabled={isSuccess}
            />
          </div>
        </div>
        
        <div className="preview-pane">
          <div className="pane-header">LIVE_PREVIEW</div>
          <div className="preview-content">
            <style>{`
              .preview-sandbox { all: initial; font-family: sans-serif; display: block; width: 100%; height: 100%; }
              ${cssCode}
            `}</style>
            <div className="preview-sandbox" dangerouslySetInnerHTML={{ __html: data.htmlContent }} />
          </div>
        </div>
      </div>

      {hasValidations && (
        <div className="interactive-controls">
          <button 
            className="nav-btn" 
            onClick={handleSubmit} 
            disabled={isSuccess}
            style={{ marginTop: '1rem' }}
          >
            {isSuccess ? 'VERIFIED' : 'RUN_VALIDATION'}
          </button>
          
          {feedbackMsg && (
            <div className={`validation-feedback ${isSuccess ? 'success-text' : 'error-text'}`} style={{ marginTop: '1rem', fontFamily: 'var(--sle-font-mono)' }}>
              {feedbackMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

