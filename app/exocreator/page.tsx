"use client"

import ExoCreator from '@/components/exocreator'
import { LoadingScreen } from "@/components/loadingScreen";
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




