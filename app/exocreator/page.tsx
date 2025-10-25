"use client";

import dynamic from "next/dynamic";
import { LoadingScreen } from "@/src/components/loadingScreen";
import { useState, useEffect } from "react";

const ExoCreator = dynamic(() => import("@/src/components/exocreator"), { ssr: false });

export default function ExoCreatorClient() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingScreen />;
  return <ExoCreator />;
}
