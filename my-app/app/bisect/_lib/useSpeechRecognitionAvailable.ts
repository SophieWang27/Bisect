"use client";

import { useEffect, useState } from "react";
import { speechRecognitionSupported } from "./speech";

export function useSpeechRecognitionAvailable(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAvailable(speechRecognitionSupported());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return available;
}
