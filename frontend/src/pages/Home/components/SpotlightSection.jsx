import React, { useState } from 'react';

const hardcodedVideos = [
  {
    id: 101,
    strTitle: "Miley Cyrus - The Climb",
    strYoutubeEmbedUrl: "https://www.youtube.com/embed/oMeSf6d4Xrg",
    strDescription: "Official Music Video for The Climb by Miley Cyrus"
  },
  {
    id: 102,
    strTitle: "Adele - Hello",
    strYoutubeEmbedUrl: "https://www.youtube.com/embed/YQHsXMglC9A",
    strDescription: "Official Music Video for Hello by Adele"
  },
  {
    id: 103,
    strTitle: "Clean Bandit - Rockabye",
    strYoutubeEmbedUrl: "https://www.youtube.com/embed/papuvlVeZg8",
    strDescription: "Official Music Video for Rockabye by Clean Bandit"
  },
  {
    id: 104,
    strTitle: "Jessie J - Flashlight",
    strYoutubeEmbedUrl: "https://www.youtube.com/embed/D-NvQ6VJYtE",
    strDescription: "Official Music Video for Flashlight by Jessie J"
  }
];

const extractYoutubeId = (url) => {
  if (!url) return null;
  const match = url.match(/embed\/([^?]+)/);
  if (match) return match[1];
  const watchMatch = url.match(/v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  return null;
};

const SpotlightSection = () => {
  const [objActiveVideoState, setObjActiveVideoState] = useState(hardcodedVideos[0]);
  const [boolIsVideoPlayingState, setBoolIsVideoPlayingState] = useState(false);

  return (
    <section className="ath-video-section ath-reveal" id="video">
      <div className="ath-video-header">
        <div className="ath-video-header-left">
          <span className="ath-video-eyebrow">// MEDIA HUB</span>
          <h2 className="ath-video-title">Featured Spotlights</h2>
        </div>
        <div className="ath-video-header-right">
          <span className="ath-video-count">
            {hardcodedVideos.indexOf(objActiveVideoState) + 1} / {hardcodedVideos.length}
          </span>
        </div>
      </div>

      <div className="ath-video-stage">
        <div className="ath-video-player-wrap">
          <div className="ath-video-iframe-container">
            {!boolIsVideoPlayingState ? (
              <div 
                className="ath-video-facade"
                style={{ backgroundImage: `url(https://img.youtube.com/vi/${extractYoutubeId(objActiveVideoState.strYoutubeEmbedUrl)}/maxresdefault.jpg)` }}
                onClick={() => setBoolIsVideoPlayingState(true)}
              />
            ) : (
              <iframe
                src={`${objActiveVideoState.strYoutubeEmbedUrl?.replace('youtube.com', 'youtube-nocookie.com')}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`}
                title={objActiveVideoState.strTitle}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            )}
          </div>
          <div className="ath-video-info-bar">
            <div className="ath-video-info-left">
              <span className="ath-video-now-playing">NOW PLAYING</span>
              <h3 className="ath-video-active-title">{objActiveVideoState.strTitle}</h3>
            </div>
            <span className="ath-video-active-desc">{objActiveVideoState.strDescription}</span>
          </div>
        </div>

        <div className="ath-filmstrip-wrapper">
          <div className="ath-filmstrip">
            {hardcodedVideos.map((video, idx) => {
              const isActive = objActiveVideoState.id === video.id;
              const videoId = extractYoutubeId(video.strYoutubeEmbedUrl);
              const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
              return (
                <div
                  key={video.id}
                  onClick={() => {
                    setObjActiveVideoState(video);
                    setBoolIsVideoPlayingState(false);
                  }}
                  className={`ath-filmstrip-item ${isActive ? 'active' : ''}`}
                >
                  <div className="ath-filmstrip-thumb" style={{ backgroundImage: `url(${thumbUrl})` }}>
                    <span className="ath-filmstrip-index">0{idx + 1}</span>
                    {isActive && (
                      <div className="ath-filmstrip-playing-indicator">
                        <span /><span /><span />
                      </div>
                    )}
                  </div>
                  <div className="ath-filmstrip-meta">
                    <span className="ath-filmstrip-label">LOG 0{idx + 1}</span>
                    <p className="ath-filmstrip-item-title">{video.strTitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpotlightSection;
