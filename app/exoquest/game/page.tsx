import React, { Suspense } from 'react';  
import ExoQuest from "@/components/exoquest";

const ExoQuestGame: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-blue-950">Loading...</div>}>
      <ExoQuest />
    </Suspense>
  );
};

export default ExoQuestGame;
