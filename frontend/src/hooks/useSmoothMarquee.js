import { useEffect, useRef } from 'react';

/**
 * useSmoothMarquee - Infinite auto-scrolling carousel with amplified touch drag.
 * 
 * @param {number} speed - Pixels per frame for auto-scroll (default 0.5).
 * @param {number} copies - How many times items are duplicated in JSX (default 4).
 * @param {number} dragMultiplier - How much faster manual drag feels (default 2.5).
 */
export const useSmoothMarquee = (speed = 0.5, copies = 4, dragMultiplier = 2.5) => {
  const refContainer = useRef(null);
  const refLoopPoint = useRef(0);
  const refIsInteracting = useRef(false);
  const refAutoPos = useRef(0);
  const refTouchStartX = useRef(0);
  const refScrollStart = useRef(0);

  useEffect(() => {
    const container = refContainer.current;
    if (!container) return;

    const track = container.firstElementChild;
    if (!track) return;

    // GPU hints
    track.style.willChange = 'transform';
    track.style.backfaceVisibility = 'hidden';

    // ── Loop Point ──
    const calcLoopPoint = () => {
      const numWidth = track.scrollWidth;
      if (numWidth <= 0) return;
      const numLoop = (numWidth + 24) / copies;
      if (Math.abs(numLoop - refLoopPoint.current) > 1) {
        refLoopPoint.current = numLoop;
        if (container.scrollLeft < 10 && numLoop > 24) {
          container.scrollLeft = numLoop;
          refAutoPos.current = numLoop;
        }
      }
    };

    const observer = new ResizeObserver(calcLoopPoint);
    observer.observe(track);
    window.addEventListener('resize', calcLoopPoint);

    // ── Interaction Tracking & Dragging (Merch Style) ──
    let boolIsDragging = false;
    let numStartX = 0;
    let numScrollLeft = 0;

    const onTouchStart = () => { refIsInteracting.current = true; };
    const onTouchEnd = () => { refIsInteracting.current = false; };

    // Mobile: rely purely on native CSS momentum scroll!
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // Desktop: manual drag
    const onMouseDown = (e) => {
      boolIsDragging = true;
      refIsInteracting.current = true;
      numStartX = e.pageX - container.offsetLeft;
      numScrollLeft = container.scrollLeft;
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
    };

    const onMouseMove = (e) => {
      if (!boolIsDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - numStartX) * 2; 
      container.scrollLeft = numScrollLeft - walk;
    };

    const onMouseUpOrLeave = () => {
      boolIsDragging = false;
      refIsInteracting.current = false;
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    };

    const boolHasHover = window.matchMedia ? window.matchMedia('(hover: hover)').matches : true;
    if (boolHasHover) {
      container.style.cursor = 'grab';
      container.addEventListener('mousedown', onMouseDown);
      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('mouseup', onMouseUpOrLeave);
      container.addEventListener('mouseleave', onMouseUpOrLeave);
    }

    // ── Trackpad wheel ──
    let numWheelTimer;
    const onWheel = () => {
      refIsInteracting.current = true;
      clearTimeout(numWheelTimer);
      numWheelTimer = setTimeout(() => { refIsInteracting.current = false; }, 200);
    };
    container.addEventListener('wheel', onWheel, { passive: true });

    // ── Infinite Loop Boundaries ──
    const onScroll = () => {
      const L = refLoopPoint.current;
      if (L <= 24) return;
      
      if (container.scrollLeft <= 0) {
        container.scrollLeft = L;
        refAutoPos.current = L;
      } else if (container.scrollLeft >= L * 2) {
        const numNew = L + (container.scrollLeft - L * 2);
        container.scrollLeft = numNew;
        refAutoPos.current = numNew;
      }
    };
    container.addEventListener('scroll', onScroll, { passive: true });

    // ── Animation Loop ──
    let numFrameId;
    let boolTransformIsZero = false;

    const animate = () => {
      const L = refLoopPoint.current;
      const numActualScroll = container.scrollLeft;
      const numExpectedScroll = Math.floor(refAutoPos.current);

      // If the physical scroll position moved by more than 1px compared to what we 
      // expected, it means the browser's native momentum is still decelerating!
      const boolIsMomentum = Math.abs(numActualScroll - numExpectedScroll) > 1;

      if (refIsInteracting.current || boolIsMomentum) {
        // Sync our tracker to the physical scroll position and let momentum finish
        refAutoPos.current = numActualScroll;
        
        if (!boolTransformIsZero) {
          track.style.transform = 'translate3d(0, 0, 0)';
          boolTransformIsZero = true;
        }
      } else if (L > 24) {
        // Safe to auto-scroll! Momentum has completely stopped.
        boolTransformIsZero = false;
        refAutoPos.current += speed;
        
        const numInt = Math.floor(refAutoPos.current);
        const numFrac = refAutoPos.current - numInt;
        
        if (numActualScroll !== numInt) {
          container.scrollLeft = numInt;
        }
        
        track.style.transform = `translate3d(${-numFrac}px, 0, 0)`;
      }
      
      numFrameId = requestAnimationFrame(animate);
    };

    refAutoPos.current = container.scrollLeft;
    numFrameId = requestAnimationFrame(animate);

    // ── Cleanup ──
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calcLoopPoint);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      if (boolHasHover) {
        container.removeEventListener('mousedown', onMouseDown);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mouseup', onMouseUpOrLeave);
        container.removeEventListener('mouseleave', onMouseUpOrLeave);
      }
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(numFrameId);
    };
  }, [copies, speed, dragMultiplier]);

  return { refTrack: refContainer, events: {} };
};

