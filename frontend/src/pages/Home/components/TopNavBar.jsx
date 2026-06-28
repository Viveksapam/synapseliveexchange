import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const TopNavBar = ({ boolIsLoggedInState, onOpenLogin, handleLogout }) => {
  return (
    <header className="ath-header">
      <nav className="ath-nav">
        <div className="ath-brand-group">
          <Link to="/" className="ath-brand">
            Synapse LE
          </Link>
          <ul className="ath-nav-links hidden-mobile">
            <Link className="ath-nav-link" to="/verisphere">
              Verisphere
            </Link>
            <a 
              className="ath-nav-link" 
              href="#video"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('video')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Spotlight
            </a>
            <a 
              className="ath-nav-link" 
              href="#merchandise"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('merchandise')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Merchandise
            </a>
          </ul>
        </div>
        
        <div className="ath-nav-actions">
          <div className="ath-dropdown-container">
            <button className="ath-dropdown-trigger">
              APPS <ChevronDown size={12} style={{ marginLeft: '4px' }} />
            </button>
            <div className="ath-dropdown-menu">
              <div className="ath-dropdown-column">
                <h4>Verisphere</h4>
                <Link to="/verisphere">Verisphere Main</Link>
              </div>
              <div className="ath-dropdown-column">
                <h4>E-Commerce</h4>
                <Link to="/shop">Shop Page</Link>
              </div>
              <div className="ath-dropdown-column">
                <h4>Learning</h4>
                <Link to="/credentials">Credentials (CAS)</Link>
                <Link to="/assessment">Assessment Hub</Link>
                <Link to="/sle">Classroom Map</Link>
              </div>
            </div>
          </div>
          
          {boolIsLoggedInState ? (
            <button 
              onClick={handleLogout}
              className="ath-btn-login"
            >
              LOG OUT
            </button>
          ) : (
            <button 
              onClick={onOpenLogin}
              className="ath-btn-login"
            >
              LOG IN
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

TopNavBar.propTypes = {
  boolIsLoggedInState: PropTypes.bool,
  onOpenLogin: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired
};

export default TopNavBar;
