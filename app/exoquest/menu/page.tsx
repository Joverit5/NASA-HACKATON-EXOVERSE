"use client"

import React from 'react';
import ExoPlanetPlatform from '@/src/components/menuexoquest';
import { LoadingScreen } from "@/src/components/loadingScreen";
import { useState, useEffect } from 'react';

export default function ExoQuestPage() {
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
  return <ExoPlanetPlatform />;
}
