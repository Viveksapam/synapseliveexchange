import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const ContributionsSection = ({ arrBlogsState }) => {
  const navigate = useNavigate();

  return (
    <section className="ath-blog-section ath-reveal" id="blog">
      <div className="ath-blog-container">
        <div className="ath-blog-header-row" style={{ marginBottom: '40px' }}>
          <span className="ath-section-eyebrow">The Marginalia</span>
          <h2 className="ath-section-title">Recent Contributions</h2>
        </div>

        <div className="ath-blog-grid">
          {arrBlogsState.map((post, idx) => {
            // Hardcode images matching design blueprint
            const sampleImages = [
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ-xrMHOTSyTGEaZCNGiU9gtTYSDojAQACt63gecdlIrSsG55GzaE3bicWwoTNTNAUKFERznT-yjwWHN5RalKznk_NmtOqeYDeUfH3gKx_SYB5RtGhawvD7o7cTe8KP3AUZrY-T69o5ZuM5kC7aCkzjMQu1ojJSMQWw0BxY__wuM5WvttYxSyKhOet10bEzjXqgytwMG_lIwCl0kRHPvPrq1V_bSyLxMB826x1JUbhFSbIPpl7gPsqoWpr9AIO2FuDJfWd-ZklxdOz",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBMWCwgITglCjMFiGhLDeRMIOt3EpWxXiQfEI0qngNHfWCZesJ29CXVZzB-FixPUsqzUCezweeknZW_tFJ2-5f8RRGeRy4MdBm9PeRAXOokcPlUgreENnHCVM-4D_JX_QKnFN9FPSfKzLyRfuan2aNBJPjmFx0Wj-SqIBc4dimxEJBH_ZDcU99hr7aNsKBQppqeN0WnFqBE7ndlYHXI-149E0CNtrZmByKgd7je_hlb3sAcxamSU7ICXiFL0NKXiyzHeqvX5kAIOCZI",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuB1g2ZqTjW4KleUJFDXGMSymLSFLHl2HuYV9kniKLeY3Wn-7ZgLcdsToKCGMoJgM1ALsFvgSa5GdF1WGxDgTsELsgdTqm2B9hq1-XYjidyYoIQpKR2ql50qx_5asYck4sIO0Q4JcyDl2Q2VWqEv5GabwsawpOcX1PuSixdSp_ZPsBzK_YJnQbDUhCgn1YiedZHu5YYndKjUjimJh5jxmBA5t1ztl-wpHzie2Fwh3rxz-Dk-eUKY4y2kh_mYbnOWoFP04063Nya-ipH9"
            ];
            const bgImage = sampleImages[idx % sampleImages.length];
            const readTime = post.strThemeColor === '#10b981' ? '08' : '12';
            const category = post.strThemeColor === '#10b981' ? 'Ethics' : 'Discovery';

            return (
              <div 
                key={post.id}
                className="ath-blog-card"
                onClick={() => navigate(`/verisphere/post/blog_${post.id}`)}
              >
                <div className="ath-blog-img-wrapper">
                  <img src={bgImage} alt={post.strTitle} className="ath-blog-img" />
                </div>
                <span className="ath-blog-category">{category} // {readTime} Min Read</span>
                <h3 className="ath-blog-title">{post.strTitle}</h3>
                <p className="ath-blog-summary">{post.strSummary}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

ContributionsSection.propTypes = {
  arrBlogsState: PropTypes.array.isRequired
};

export default ContributionsSection;
