
"use client";

import type { RefObject } from "react";
import HandSkeleton from "./HandSkeleton";
import type { HandLandmarks } from "../vision/landmarkTypes";

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  error: string | null;
  landmarks: HandLandmarks | null;
}

export default function CameraView({
  videoRef,
  isRunning,
  onStart,
  onStop,
  error,
  landmarks,
}: CameraViewProps) {
  return (
    <section>
      <h2>Camera</h2>

      <div
        style={{
          position: "relative",
          width: "min(100%, 640px)",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width="640"
          height="480"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
          }}
        />

        <HandSkeleton landmarks={landmarks} />
      </div>

      <div>
        {!isRunning ? (
          <button onClick={onStart}>
            Start Camera
          </button>
        ) : (
          <button onClick={onStop}>
            Stop Camera
          </button>
        )}
      </div>

      <p>
        Camera status: {isRunning ? "Running" : "Stopped"}
      </p>

      {error && (
        <p role="alert">
          Error: {error}
        </p>
      )}
    </section>
  );
}
