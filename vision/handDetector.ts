
import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

import { HAND_LANDMARKER_CONFIG } from "./visionConfig";
import type { HandLandmarks, Handedness } from "./landmarkTypes";

const WASM_FILES_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

export async function createHandLandmarker(): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_FILES_PATH);

  try {
    // First attempt: GPU acceleration
    return await HandLandmarker.createFromOptions(vision, {
      ...HAND_LANDMARKER_CONFIG,
      baseOptions: {
        ...HAND_LANDMARKER_CONFIG.baseOptions,
        delegate: "GPU",
      },
    });
  } catch (gpuError) {
    console.warn("GPU initialization failed. Trying CPU.", gpuError);

    // Fallback: CPU processing
    return await HandLandmarker.createFromOptions(vision, {
      ...HAND_LANDMARKER_CONFIG,
      baseOptions: {
        ...HAND_LANDMARKER_CONFIG.baseOptions,
        delegate: "CPU",
      },
    });
  }
}

export function detectHandLandmarks(
  detector: HandLandmarker,
  video: HTMLVideoElement,
  timestamp: number
): {
  landmarks: HandLandmarks | null;
  handedness: Handedness | null;
} {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return {
      landmarks: null,
      handedness: null,
    };
  }

  const result = detector.detectForVideo(video, timestamp);

  const detectedLandmarks = result.landmarks[0];

  if (!detectedLandmarks) {
    return {
      landmarks: null,
      handedness: null,
    };
  }

  const landmarks: HandLandmarks = detectedLandmarks.map((point) => ({
    x: point.x,
    y: point.y,
    z: point.z,
  }));

  const label = result.handednesses[0]?.[0]?.categoryName;

  const handedness: Handedness | null =
    label === "Left" || label === "Right" ? label : null;

  return {
    landmarks,
    handedness,
  };
}
