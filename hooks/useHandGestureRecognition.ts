
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";

import { createHandLandmarker, detectHandLandmarks } from "../vision/handDetector";
import type { HandLandmarks, Handedness } from "../vision/landmarkTypes";

import { analyzeFingers } from "../gestures/fingerAnalyzer";
import { classifyGesture } from "../gestures/gestureClassifier";
import type { GestureType } from "../gestures/gestureTypes";

export interface GestureHistoryItem {
  gesture: GestureType;
  timestamp: number;
}

const STABILITY_DURATION = 300;

export function useHandGestureRecognition() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const lastVideoTimeRef = useRef(-1);
  const pendingGestureRef = useRef<GestureType>("UNKNOWN");
  const pendingSinceRef = useRef(0);
  const stableGestureRef = useRef<GestureType>("UNKNOWN");

  const [isRunning, setIsRunning] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [landmarks, setLandmarks] = useState<HandLandmarks | null>(null);
  const [handedness, setHandedness] = useState<Handedness | null>(null);
  const [currentGesture, setCurrentGesture] =
    useState<GestureType>("UNKNOWN");
  const [history, setHistory] = useState<GestureHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    detectorRef.current?.close();
    detectorRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    lastVideoTimeRef.current = -1;
    pendingGestureRef.current = "UNKNOWN";
    pendingSinceRef.current = 0;
    stableGestureRef.current = "UNKNOWN";

    setIsRunning(false);
    setIsHandDetected(false);
    setLandmarks(null);
    setHandedness(null);
    setCurrentGesture("UNKNOWN");
  }, []);

  const start = useCallback(async () => {
    if (streamRef.current) return;

    try {
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported by this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        throw new Error("Video element is not available.");
      }

      video.srcObject = stream;

// Wait until the browser has loaded video metadata.
if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();

    video.onerror = () => {
      reject(new Error("Unable to load camera video."));
    };
  });
}

// Start video playback.
await video.play();

// Initialize MediaPipe after video playback starts.
const detector = await createHandLandmarker();
      detectorRef.current = detector;

      setIsRunning(true);

      const processFrame = () => {
        const currentVideo = videoRef.current;
        const currentDetector = detectorRef.current;

        if (!currentVideo || !currentDetector) return;

        if (
          currentVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          currentVideo.currentTime !== lastVideoTimeRef.current
        ) {
          lastVideoTimeRef.current = currentVideo.currentTime;

          try {
            const result = detectHandLandmarks(
              currentDetector,
              currentVideo,
              performance.now()
            );

            setLandmarks(result.landmarks);
            setHandedness(result.handedness);
            setIsHandDetected(result.landmarks !== null);

            let detectedGesture: GestureType = "UNKNOWN";

            if (result.landmarks) {
              const fingers = analyzeFingers(result.landmarks);
              detectedGesture = classifyGesture(fingers);
            }

            const now = performance.now();

            if (detectedGesture !== pendingGestureRef.current) {
              pendingGestureRef.current = detectedGesture;
              pendingSinceRef.current = now;
            } else if (
              now - pendingSinceRef.current >= STABILITY_DURATION &&
              detectedGesture !== stableGestureRef.current
            ) {
              stableGestureRef.current = detectedGesture;
              setCurrentGesture(detectedGesture);

              if (detectedGesture !== "UNKNOWN") {
                setHistory((previous) => [
                  {
                    gesture: detectedGesture,
                    timestamp: Date.now(),
                  },
                  ...previous,
                ].slice(0, 20));
              }
            }
          } catch (frameError) {
            console.error("Frame processing failed:", frameError);
          }
        }

        animationFrameRef.current =
          requestAnimationFrame(processFrame);
      };

      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (startError) {
      const message =
        startError instanceof Error
          ? startError.message
          : "Unable to start hand recognition.";

      setError(message);
      stop();
    }
  }, [stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    videoRef,
    isRunning,
    isHandDetected,
    landmarks,
    handedness,
    currentGesture,
    history,
    error,
    start,
    stop,
  };
}
