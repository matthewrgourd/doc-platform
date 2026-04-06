import React, { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AiPanel } from '@site/src/components/AiPanel';

export default function Root({children}: {children: React.ReactNode}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-ai-panel', handler);
    return () => window.removeEventListener('open-ai-panel', handler);
  }, []);

  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
      <AiPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
