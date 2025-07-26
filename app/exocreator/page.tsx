// Archivo movido desde app/exocreator/page.tsx
"use client"

import ExoCreator from '@/src/components/exocreator'
import { LoadingScreen } from "@/src/components/loadingScreen";
import { useState, useEffect } from 'react';

export default function ExoCreatorPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds loading time, adjust as needed

    return () => clearTimeout(timer);
  }, [])

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <ExoCreator />
}
