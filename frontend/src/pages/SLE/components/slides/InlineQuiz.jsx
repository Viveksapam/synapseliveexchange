import React, { useState } from 'react';
import './InlineQuiz.css';

export function InlineQuiz({ block }) {
  const [answers, setAnswers] = useState({});
  const [boolTestStartedState, setBoolTestStartedState] = useState(false);
  const [numActiveIndexState, setNumActiveIndexState] = useState(0);
  const [boolAnswersSubmittedState, setBoolAnswersSubmittedState] = useState(false);

  const handleInput = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (numActiveIndexState < block.questions.length - 1) {
      setNumActiveIndexState(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (numActiveIndexState > 0) {
      setNumActiveIndexState(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setBoolAnswersSubmittedState(true);
  };

  const handleReset = () => {
    setAnswers({});
    setNumActiveIndexState(0);
    setBoolAnswersSubmittedState(false);
    setBoolTestStartedState(false);
  };

  const questionsCount = block.questions?.length || 0;

  // Gate Screen (Start)
  if (!boolTestStartedState) {
    return (
      <div className="quiz-gate-container">
        <div className="quiz-gate-card">
          <div className="quiz-gate-portal">
            <div className="portal-ring"></div>
            <div className="portal-core">
              <span className="portal-lock-icon">🔒</span>
            </div>
          </div>
          <div className="quiz-gate-badge">GATED ASSESSMENT</div>
          <h3 className="quiz-gate-heading">Summative Assessment</h3>
          <p className="quiz-gate-description">
            This module quiz validates your comprehension of basic CSS Syntax, the Cascade, Specificity, and modern visual selectors.
          </p>
          <div className="quiz-gate-details">
            <div className="detail-item">
              <span className="detail-icon">📝</span>
              <span className="detail-text">{questionsCount} Questions</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">⏱️</span>
              <span className="detail-text">No time limit</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🔑</span>
              <span className="detail-text">Pass required to unlock Key</span>
            </div>
          </div>
          <button className="quiz-gate-start-btn" onClick={() => setBoolTestStartedState(true)}>
            START ASSESSMENT
          </button>
        </div>
      </div>
    );
  }

  // Submitted / Complete Screen
  if (boolAnswersSubmittedState) {
    return (
      <div className="quiz-gate-container">
        <div className="quiz-gate-card completed">
          <div className="quiz-gate-portal completed">
            <div className="portal-ring completed"></div>
            <div className="portal-core completed">
              <span className="portal-lock-icon">🔓</span>
            </div>
          </div>
          <div className="quiz-gate-success-badge">PASSED</div>
          <h3 className="quiz-gate-heading">Assessment Completed!</h3>
          <p className="quiz-gate-description">
            You have successfully completed the summative assessment. You can now reveal the answer key below to review and verify your responses.
          </p>
          <div className="quiz-summary-answers">
            <h4>Your Response Summary:</h4>
            <ul className="response-summary-list">
              {block.questions.map((q, idx) => (
                <li key={idx} className="response-summary-item">
                  <span className="summary-q-num">Q{idx + 1}:</span>
                  <span className="summary-q-ans">{answers[`q-${idx}`] ? (answers[`q-${idx}`].length > 40 ? answers[`q-${idx}`].substring(0, 40) + '...' : answers[`q-${idx}`]) : <em>Skipped</em>}</span>
                </li>
              ))}
            </ul>
          </div>
          <button className="quiz-gate-reset-btn" onClick={handleReset}>
            RE-TAKE ASSESSMENT
          </button>
        </div>
      </div>
    );
  }

  // Active Wizard Screen
  const q = block.questions[numActiveIndexState];
  const progressPercent = ((numActiveIndexState + 1) / questionsCount) * 100;

  return (
    <div className="quiz-wizard-container">
      {/* Wizard Header Progress */}
      <div className="quiz-wizard-header">
        <div className="progress-label">
          Question <span>{numActiveIndexState + 1}</span> of {questionsCount}
        </div>
        <div className="quiz-wizard-progress-bar">
          <div className="quiz-wizard-progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Active Question Card */}
      <div className="quiz-wizard-card">
        <p className="inline-quiz-prompt">
          <strong>Prompt:</strong> {q.prompt}
        </p>

        {q.type === 'mcq' && (
          <div className="inline-quiz-options">
            {q.options.map((opt, oIdx) => (
              <label key={oIdx} className={`inline-quiz-label ${answers[`q-${numActiveIndexState}`] === opt ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={`q-${numActiveIndexState}`}
                  value={opt}
                  checked={answers[`q-${numActiveIndexState}`] === opt}
                  onChange={(e) => handleInput(`q-${numActiveIndexState}`, e.target.value)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        )}

        {q.type === 'fill_in_blank' && (
          <div className="inline-quiz-fill">
            <input 
              type="text" 
              className="inline-quiz-text-input" 
              placeholder="Type your answer here..."
              value={answers[`q-${numActiveIndexState}`] || ''}
              onChange={(e) => handleInput(`q-${numActiveIndexState}`, e.target.value)}
            />
          </div>
        )}

        {(q.type === 'short_answer' || q.type === 'open_ended') && (
          <div className="inline-quiz-textarea">
            <textarea 
              rows={4} 
              className="inline-quiz-text-input"
              placeholder="Write your answer..."
              value={answers[`q-${numActiveIndexState}`] || ''}
              onChange={(e) => handleInput(`q-${numActiveIndexState}`, e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="quiz-wizard-footer">
        <button 
          className="quiz-wizard-nav-btn prev"
          onClick={handlePrev}
          disabled={numActiveIndexState === 0}
        >
          &larr; BACK
        </button>

        {numActiveIndexState === questionsCount - 1 ? (
          <button 
            className="quiz-wizard-nav-btn submit"
            onClick={handleSubmit}
          >
            FINISH & SUBMIT
          </button>
        ) : (
          <button 
            className="quiz-wizard-nav-btn next"
            onClick={handleNext}
          >
            NEXT &rarr;
          </button>
        )}
      </div>
    </div>
  );
}

