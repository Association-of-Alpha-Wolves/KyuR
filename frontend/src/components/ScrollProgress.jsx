import { useState, useEffect } from 'react';

export default function ScrollProgress({ position = 'absolute', bottom = 0, top = 'auto', zIndex = 101 }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = (e) => {
      let scrollTop, scrollHeight, clientHeight;
      
      if (e.target === document || e.target === window) {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = document.documentElement.clientHeight;
      } else {
        scrollTop = e.target.scrollTop;
        scrollHeight = e.target.scrollHeight;
        clientHeight = e.target.clientHeight;
      }
      
      const totalHeight = scrollHeight - clientHeight;
      const progress = totalHeight > 0 ? (scrollTop / totalHeight) : 0;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use specific containers if available, else window
    const scrollContainer = document.querySelector('.custom-scroll-container') || document.querySelector('.dashboard-main-content');
    const targetElement = scrollContainer || window;

    targetElement.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll({ target: scrollContainer || document });

    return () => targetElement.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      position,
      bottom,
      top,
      left: 0,
      width: '100%',
      height: '4px',
      background: 'transparent',
      zIndex,
    }}>
      <div style={{
        height: '100%',
        width: '100%',
        transform: `scaleX(${scrollProgress})`,
        transformOrigin: 'left',
        background: 'linear-gradient(to right, var(--blue), var(--cyan))',
        boxShadow: '0 0 10px rgba(7, 152, 201, 0.4)',
        transition: 'transform 0.05s linear'
      }} />
    </div>
  );
}
