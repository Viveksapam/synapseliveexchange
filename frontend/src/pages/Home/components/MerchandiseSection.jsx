import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const MerchandiseSection = ({ arrProductsState, onSelectProduct }) => {
  return (
    <section className="ath-merch-section ath-reveal" id="merchandise">
      <div className="ath-merch-container">
        <div className="ath-merch-header">
          <div>
            <span className="ath-section-eyebrow">The Shop</span>
            <h2 className="ath-section-title">SLE Merchandise</h2>
          </div>
          <Link to="/shop" className="ath-btn-outline">
            Browse Full Shop
          </Link>
        </div>

        <div className="ath-merch-grid">
          {arrProductsState.slice(0, 3).map((product) => (
            <div 
              key={product.id}
              className="ath-merch-card"
              onClick={() => onSelectProduct(product)}
            >
              <div className="ath-merch-img-wrapper">
                <img src={product.strImage} alt={product.strName} className="ath-merch-img" />
                <span className="ath-merch-price">₹{product.numPrice}</span>
              </div>
              <div className="ath-merch-info">
                <h3 className="ath-merch-title">{product.strName}</h3>
                <p className="ath-merch-desc">{product.strDescription}</p>
                <span className="ath-merch-action">
                  <span>INSPECT ITEM</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

MerchandiseSection.propTypes = {
  arrProductsState: PropTypes.array.isRequired,
  onSelectProduct: PropTypes.func.isRequired
};

export default MerchandiseSection;
