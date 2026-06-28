import React from 'react';
import { Link } from 'react-router-dom';
import ThreeVisual from '../../components/ThreeVisual';
import { Brain, CheckCircle, Shield } from 'lucide-react';

function WelcomePage() {
    return (
        <>
            <div className="v2-canvas-container">
                <ThreeVisual />
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                textAlign: 'center',
                padding: '2rem',
                position: 'relative',
                zIndex: 1
            }}>
            <h1 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                fontWeight: '800',
                margin: '0 0 1.5rem 0',
                letterSpacing: '-0.02em',
                color: 'var(--v2-text-main)'
            }}>
                Welcome to <span style={{ 
                    background: 'linear-gradient(to right, var(--v2-accent-3), var(--v2-accent-1))', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent' 
                }}>VeriSphere</span>
            </h1>
            
            <p style={{
                fontSize: '1.25rem',
                color: 'var(--v2-text-muted)',
                maxWidth: '650px',
                lineHeight: '1.6',
                marginBottom: '4rem'
            }}>
                The rational public square. Step into an AI-moderated arena where truth takes center stage, and arguments are weighed on their merits, not their volume.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                maxWidth: '1000px',
                width: '100%',
                marginBottom: '4rem'
            }}>
                {[
                    { icon: <Brain size={48} color="var(--v2-accent-3)" />, title: 'AI-Reasoned', desc: 'Every argument is analyzed to promote clarity, constructive dialogue, and mutual understanding.' },
                    { icon: <CheckCircle size={48} color="var(--v2-accent-1)" />, title: 'Fact-Checked', desc: 'Claims are automatically cross-referenced with verified sources in real-time.' },
                    { icon: <Shield size={48} color="#2ea043" />, title: 'Civil Discourse', desc: 'A protected environment where ideas battle, but personal attacks are filtered out.' }
                ].map(feature => (
                    <div key={feature.title} style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '24px',
                        padding: '2rem',
                        backdropFilter: 'blur(16px)',
                        transition: 'transform 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
                        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--v2-text-main)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
                        <p style={{ color: 'var(--v2-text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{feature.desc}</p>
                    </div>
                ))}
            </div>

            <Link 
                to="/verisphere/feed"
                className="verisphere-btn-primary"
                style={{
                    fontSize: '1.25rem',
                    padding: '16px 48px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)'
                }}
            >
                Enter The Sphere
            </Link>
        </div>
        </>
    );
}

export default WelcomePage;
