"use client";

import type { GestureType } from "../gestures/gestureTypes";

interface GestureDisplayProps {
  gesture: GestureType;
}

const GESTURE_LABELS: Record<GestureType, string> = {
  FIST: "Fist",
  OPEN_PALM: "Open Palm",
  THUMBS_UP: "Thumbs Up",
  PEACE: "Peace Sign",
  UNKNOWN: "No recognized gesture",
};

export default function GestureDisplay({
  gesture,
}: GestureDisplayProps) {
  return (
    <section className="gesture-section">
      <h2>Current Gesture</h2>

      <div className="gesture-card">
        <span className="gesture-label">
          RECOGNIZED GESTURE
        </span>

        <h3>
          {GESTURE_LABELS[gesture]}
        </h3>

        <span className="gesture-code">
          {gesture}
        </span>
      </div>
    </section>
  );
}