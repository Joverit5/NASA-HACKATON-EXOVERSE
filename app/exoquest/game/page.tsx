import React, { Suspense } from 'react';  
import ExoQuest from "@/components/exoquest";

export default function ExoQuestGame() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExoQuest />
    </Suspense>
  );
}
