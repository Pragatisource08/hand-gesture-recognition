
"use client";

import type { HandLandmarks } from "../vision/landmarkTypes";

interface HandSkeletonProps {
  landmarks: HandLandmarks | null;
}

const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],

  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],

  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],

  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],

  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],

  // Palm connections
  [5, 9], [9, 13], [13, 17], [5, 17],
];

export default function HandSkeleton({
  landmarks,
}: HandSkeletonProps) {
  if (!landmarks || landmarks.length !== 21) {
    return null;
  }

  return (
    <svg
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {HAND_CONNECTIONS.map(([start, end]) => (
        <line
          key={`${start}-${end}`}
          x1={landmarks[start].x}
          y1={landmarks[start].y}
          x2={landmarks[end].x}
          y2={landmarks[end].y}
          stroke="#00FF88"
          strokeWidth="0.008"
          strokeLinecap="round"
        />
      ))}

      {landmarks.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="0.012"
          fill="#FF3B6B"
          stroke="white"
          strokeWidth="0.003"
        />
      ))}
    </svg>
  );
}
