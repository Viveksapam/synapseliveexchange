import React from 'react';
import PropTypes from 'prop-types';

const AnalysisLoadingOverlay = ({ boolIsVisible, strPhase, numProgress }) => {
  if (!boolIsVisible) return null;

  const phases = [
    { id: 'post', label: 'Analyzing post...' },
    { id: 'comments', label: 'Analyzing comments...' },
    { id: 'sources', label: 'Adding recommended sources...' },
    { id: 'reload', label: 'Refreshing data...' },
    { id: 'done', label: 'Analysis complete.' },
  ];

  const currentPhaseIndex = Math.max(0, phases.findIndex((p) => p.id === strPhase));
  const boolIsDone = strPhase === 'done';
  const progressPercent = boolIsDone
    ? 100
    : Math.min(96, ((currentPhaseIndex + (numProgress || 0)) / (phases.length - 1)) * 100);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 20, 30, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '2.5rem',
          maxWidth: '360px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 1rem',
              background: boolIsDone ? 'rgba(46, 160, 67, 0.15)' : 'var(--glass-border)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: boolIsDone ? '#2ea043' : 'inherit',
              animation: boolIsDone ? 'none' : 'spin 1s linear infinite',
              transition: 'background 0.3s ease',
            }}
          >
            {boolIsDone ? '✓' : '⊙'}
          </div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--v2-text-main)', fontSize: '1.1rem' }}>
            Analyzing Post & Discussion
          </h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--v2-text-muted)' }}>
            {phases[currentPhaseIndex]?.label || 'Processing...'}
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              height: '4px',
              background: 'var(--glass-border)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: boolIsDone ? '#2ea043' : 'var(--v2-accent-secondary)',
                width: `${progressPercent}%`,
                transition: 'width 0.5s ease, background 0.3s ease',
              }}
            />
          </div>
          <p style={{ margin: '0.6rem 0 0', fontSize: '0.75rem', color: 'var(--v2-text-muted)' }}>
            {Math.round(progressPercent)}%
          </p>
        </div>

        <div style={{ display: 'grid', gap: '0.4rem' }}>
          {phases.map((phase, idx) => {
            const isDone = idx < currentPhaseIndex;
            const isCurrent = idx === currentPhaseIndex;
            return (
              <div
                key={phase.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.8rem',
                  color: isDone ? 'var(--v2-text-muted)' : isCurrent ? 'var(--v2-accent-secondary)' : 'var(--v2-text-muted)',
                  opacity: isDone || isCurrent ? 1 : 0.5,
                }}
              >
                <span>{isDone ? '✓' : isCurrent ? '◉' : '◯'}</span>
                <span>{phase.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

AnalysisLoadingOverlay.propTypes = {
  boolIsVisible: PropTypes.bool.isRequired,
  strPhase: PropTypes.oneOf(['post', 'comments', 'sources', 'reload', 'done']),
  numProgress: PropTypes.number,
};

export default AnalysisLoadingOverlay;
