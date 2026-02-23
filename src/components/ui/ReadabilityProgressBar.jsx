import React, { useState, useEffect } from 'react';

const ReadabilityProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) {
        setProgress(100);
        return;
      }

      const percent = Math.min(100, (scrollTop / docHeight) * 100);
      setProgress(percent);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="readability-progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
      <div className="readability-progress-fill" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default ReadabilityProgressBar;
