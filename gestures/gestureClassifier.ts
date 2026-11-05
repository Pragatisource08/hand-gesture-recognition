
import type { FingerStates } from "./fingerAnalyzer";
import type { GestureType } from "./gestureTypes";

export function classifyGesture(
  fingers: FingerStates
): GestureType {
  const { thumb, index, middle, ring, pinky } = fingers;

  // All fingers folded
  if (!thumb && !index && !middle && !ring && !pinky) {
    return "FIST";
  }

  // All fingers extended
  if (thumb && index && middle && ring && pinky) {
    return "OPEN_PALM";
  }

  // Only thumb extended
  if (thumb && !index && !middle && !ring && !pinky) {
    return "THUMBS_UP";
  }

  // Index and middle fingers extended
  if (!thumb && index && middle && !ring && !pinky) {
    return "PEACE";
  }

  return "UNKNOWN";
}
