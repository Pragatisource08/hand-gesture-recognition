
export const HAND_LANDMARKER_CONFIG = {
  baseOptions: {
    modelAssetPath: "/models/hand_landmarker.task",
    delegate: "GPU",
  },
  runningMode: "VIDEO" as const,
  numHands: 1,
  minHandDetectionConfidence: 0.5,
  minHandPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
};
