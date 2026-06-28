import React from 'react';
import { X, CheckCircle2, BookOpen, Cpu, Sparkles } from 'lucide-react';

/**
 * SkillModal component displays an expanded capabilities map for a selected skill.
 * Accepts props: objSelectedSkill, onClose, numDemoLevel, onDemoLevelChange.
 */
function SkillModal({ objSelectedSkill, onClose, numDemoLevel, onDemoLevelChange }) {
  if (!objSelectedSkill) return null;

  const details = objSelectedSkill.objDetails || {
    strDebugStory: "In-depth execution and debugging details for this capability are currently being documented.",
    strAnimations: "Modular animation techniques.",
    strThreeD: "Spatial UI and 3D environment architectures.",
    arrBooksCerts: ["Continuous Learning & Iteration"]
  };

  return (
    <div className="portfolio-modal-overlay">
      <div className="portfolio-modal-content">
        
        {/* Modal Header */}
        <div className="portfolio-modal-header">
          <div className="portfolio-modal-header-left">
            {objSelectedSkill.strIconSvg ? (
              <div
                className="portfolio-icon-box"
                dangerouslySetInnerHTML={{ __html: objSelectedSkill.strIconSvg }}
              />
            ) : (
              <div className="portfolio-icon-box">
                <Cpu size={24} />
              </div>
            )}
            <div>
              <h4 className="portfolio-card-title">{objSelectedSkill.strTitle}</h4>
              <p className="portfolio-modal-meta-title">Expanded Capabilities Map</p>
            </div>
          </div>
          <button onClick={onClose} className="portfolio-close-button">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="portfolio-modal-body" style={{ padding: '32px' }}>
          {objSelectedSkill.strModalHtml ? (
            <div 
              className="portfolio-custom-html-content"
              style={{ lineHeight: 1.6, fontSize: '1.05rem', color: 'var(--text-main)' }}
              dangerouslySetInnerHTML={{ __html: objSelectedSkill.strModalHtml }} 
            />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
              Detailed content for this skill is currently being documented.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="portfolio-modal-footer">
          <button onClick={onClose} className="portfolio-close-footer-button">
            Close Map
          </button>
        </div>

      </div>
    </div>
  );
}

export default SkillModal;

