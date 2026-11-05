
import type { HandLandmarks } from "../vision/landmarkTypes";

export interface FingerStates {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

function calculateDistance(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number }
): number {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;

  return Math.sqrt(dx * dx + dy * dy);
}

export function analyzeFingers(
  landmarks: HandLandmarks
): FingerStates {
  if (landmarks.length !== 21) {
    throw new Error("Expected exactly 21 hand landmarks.");
  }

  const isFingerExtended = (tipIndex: number, pipIndex: number) => {
    return landmarks[tipIndex].y < landmarks[pipIndex].y;
  };

  const handSize = calculateDistance(
    landmarks[0],
    landmarks[9]
  );

  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  const indexMcp = landmarks[5];

  const thumbExtension = calculateDistance(
    thumbTip,
    thumbMcp
  );

  const thumbSeparation = calculateDistance(
    thumbTip,
    indexMcp
  );

  const thumbExtended =
    handSize > 0 &&
    thumbExtension / handSize > 0.35 &&
    thumbSeparation / handSize > 0.45 &&
    calculateDistance(thumbTip, thumbIp) >
      calculateDistance(thumbIp, thumbMcp) * 0.5;

  return {
    thumb: thumbExtended,
    index: isFingerExtended(8, 6),
    middle: isFingerExtended(12, 10),
    ring: isFingerExtended(16, 14),
    pinky: isFingerExtended(20, 18),
  };
}
