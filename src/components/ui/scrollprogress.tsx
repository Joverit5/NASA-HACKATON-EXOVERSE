"use client";
import { motion, MotionValue } from "framer-motion";

interface ScrollProgressProps {
  progress: MotionValue<number>;
}

export default function ScrollProgress({ progress }: ScrollProgressProps) {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50"
      style={{ scaleX: progress, transformOrigin: "0%" }}
    />
  );
}

