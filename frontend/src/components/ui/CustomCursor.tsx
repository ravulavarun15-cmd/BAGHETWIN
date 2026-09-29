import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Position tracking with linear interpolation (lerp)
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const animFrame = useRef<number | null>(null);

  useEffect(() => {
    // Check if user is on touch device or prefers reduced motion
    const touchCheck = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };

    if (touchCheck()) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Instant inner dot placement for crisp responsiveness
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      // Check if target is interactive
      const elem = e.target as HTMLElement | null;
      if (elem) {
        const interactive = elem.closest(
          'button, a, input, select, textarea, [role="button"], [role="tab"], .interactive, .card-interactive, canvas'
        );
        setIsHovering(!!interactive);
      }
    };

    const onMouseDown = () => setIsActive(true);
    const onMouseUp = () => setIsActive(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth physics loop for outer ring
    const render = () => {
      // Lerp factor 0.22 for quick, responsive fluid follow
      pos.current.x += (target.current.x - pos.current.x) * 0.22;
      pos.current.y += (target.current.y - pos.current.y) * 0.22;

      if (outerRef.current) {
        outerRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animFrame.current = requestAnimationFrame(render);
    };

    animFrame.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      <div
        ref={outerRef}
        className={`custom-cursor-outer ${
          isHovering ? 'custom-cursor-hover' : ''
        } ${isActive ? 'custom-cursor-active' : ''}`}
        aria-hidden="true"
      />
      <div ref={innerRef} className="custom-cursor-inner" aria-hidden="true" />
    </>
  );
};
