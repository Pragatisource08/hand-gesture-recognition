"use client";

import type { GestureHistoryItem } from "../hooks/useHandGestureRecognition";

interface GestureHistoryProps {
  history: GestureHistoryItem[];
}

export default function GestureHistory({
  history,
}: GestureHistoryProps) {
  return (
    <section className="history-section">
      <div className="history-header">
        <h2>Gesture History</h2>
        <span>{history.length} / 20 events</span>
      </div>

      {history.length === 0 ? (
        <p className="empty-history">
          No gestures recognized yet.
        </p>
      ) : (
        <div className="history-list">
          {history.map((item, index) => (
            <div
              className="history-item"
              key={`${item.timestamp}-${index}`}
            >
              <div className="history-gesture">
                <span className="history-dot" />
                <strong>{item.gesture.replace("_", " ")}</strong>
              </div>

              <time>
                {new Date(item.timestamp).toLocaleTimeString()}
              </time>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}