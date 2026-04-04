import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function Root({children}: {children: React.ReactNode}) {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
