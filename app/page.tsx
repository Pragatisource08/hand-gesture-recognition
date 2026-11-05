"use client";

import CameraView from "../components/CameraView";
import GestureDisplay from "../components/GestureDisplay";
import GestureHistory from "../components/GestureHistory";
import { useHandGestureRecognition } from "../hooks/useHandGestureRecognition";

export default function Home() {
  const {
    videoRef,
    isRunning,
    isHandDetected,
    landmarks,
    currentGesture,
    history,
    error,
    start,
    stop,
  } = useHandGestureRecognition();

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Hand Gesture Recognition</h1>
        <p>Real-time computer vision monitoring system</p>
      </header>

      <div className="dashboard-grid">
        <div className="panel">
          <CameraView
            videoRef={videoRef}
            isRunning={isRunning}
            onStart={start}
            onStop={stop}
            error={error}
            landmarks={landmarks}
          />
        </div>

        <div className="panel">
          <section>
  <h2>Recognition Status</h2>

  <div className="status-row">
    <span
      className={`status-dot ${
        isHandDetected ? "active" : "inactive"
      }`}
    />

    <span>
      {isHandDetected ? "Hand Detected" : "No Hand Detected"}
    </span>
  </div>

  <div className="status-row">
    <span
      className={`status-dot ${
        isRunning ? "active" : "inactive"
      }`}
    />

    <span>
      {isRunning ? "Camera Running" : "Camera Stopped"}
    </span>
  </div>
</section>
          <GestureDisplay gesture={currentGesture} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: "20px" }}>
        <GestureHistory history={history} />
      </div>
    </main>
  );
}