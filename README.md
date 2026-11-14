# Hand Gesture Recognition

A real-time, browser-based hand gesture recognition app. It uses your webcam to detect a hand, draws its skeleton over the live video, classifies the gesture with rule-based logic, and records a history of recognized gestures.

Everything runs in the browser. There is no login, no database, and no Python backend.

---

## Features

- **Start camera button** to begin the webcam stream
- **Live camera feed**
- **Hand skeleton overlay** drawn when a hand is detected
- **Hand status**: detected / not detected
- **Recognized gesture** shown in real time
- **Gesture history** of previously recognized gestures

### Recognized gestures

| Gesture    | Thumb   | Index | Middle | Ring | Pinky |
|------------|---------|-------|--------|------|-------|
| Open palm  | 1       | 1     | 1      | 1    | 1     |
| Fist       | 0       | 0     | 0      | 0    | 0     |
| Peace      | Depends | 1     | 1      | 0    | 0     |
| Thumbs-up  | 1       | 0     | 0      | 0    | 0     |

If a hand is detected but no rule matches, the result is `UNKNOWN`.

> These are simplified patterns. The thumb needs different geometric checks from the other fingers, and hand orientation is taken into account rather than relying on a single coordinate comparison.

---

## How it works

1. The browser captures webcam frames through the MediaDevices API.
2. MediaPipe detects a hand and estimates **21 landmarks** (normalized `x`, `y`, `z`).
3. The finger analyzer decides which fingers are extended:
   ```ts
   interface FingerStates {
     thumb: boolean;
     index: boolean;
     middle: boolean;
     ring: boolean;
     pinky: boolean;
   }
   ```
4. The gesture classifier maps finger states to a gesture using rules.
5. The UI displays the status, gesture, skeleton and history.

```
Webcam frame → Hand detection → 21 landmarks → Finger states → Gesture rules → UI
```

### Gesture history behaviour

A gesture is added to the history only when:

- a new gesture has been recognized,
- it stays stable for a short duration (about 300 ms), and
- it differs from the last recorded gesture.

Holding one gesture does not create a new entry for every frame.

---

## Architecture

The project is split into four layers so each part can change independently.

| Layer | Responsibility | Knows nothing about |
|-------|----------------|---------------------|
| **Presentation** (React components) | Displays camera, skeleton, status, gesture and history | How landmarks are detected or fingers are evaluated |
| **Application / orchestration** (`useHandGestureRecognition` hook) | Camera lifecycle, processing loop, state coordination, gesture history | Gesture-classification maths |
| **Computer vision** (MediaPipe) | Takes a frame, detects the hand, returns landmarks | UI details |
| **Gesture domain** (own logic) | Finger geometry and gesture rules | React and MediaPipe |

Because the gesture layer depends only on a common landmark representation, the landmark detector could be replaced without rewriting the gesture rules.

### Rendering approach

- A `<video>` element shows the camera, with a transparent `<canvas>` placed on top for the hand skeleton.
- Landmark coordinates are **not** stored in React state on every frame. The canvas is drawn directly, and React state updates only when meaningful information changes (hand status, gesture, history).

---

## Project structure

```
hand-gesture-recognition/
│
├── app/
│   ├── page.tsx
│   └── layout.tsx
│
├── components/
│   ├── CameraView.tsx
│   ├── StartCameraButton.tsx
│   ├── DetectionStatus.tsx
│   ├── GestureDisplay.tsx
│   ├── GestureHistory.tsx
│   └── HandSkeleton.tsx
│
├── hooks/
│   └── useHandGestureRecognition.ts
│
├── vision/
│   ├── handDetector.ts
│   ├── landmarkTypes.ts
│   └── visionConfig.ts
│
├── gestures/
│   ├── fingerAnalyzer.ts
│   ├── gestureClassifier.ts
│   └── gestureTypes.ts
│
└── package.json
```

| File | Responsibility |
|------|----------------|
| `handDetector.ts` | MediaPipe initialization and hand detection |
| `landmarkTypes.ts` | Common landmark data types |
| `fingerAnalyzer.ts` | Determines which fingers are extended |
| `gestureClassifier.ts` | Applies gesture-recognition rules |
| `useHandGestureRecognition.ts` | Coordinates camera and processing lifecycle |
| `CameraView.tsx` | Displays the webcam |
| `HandSkeleton.tsx` | Draws the landmarks and connections |
| `GestureHistory.tsx` | Displays previously recognized gestures |

---

## Tech stack

| Area | Technology |
|------|------------|
| Framework | Next.js + React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Camera | Browser MediaDevices API |
| Hand landmarks | MediaPipe (in the browser) |
| Gesture classification | Custom rule-based classifier |

MediaPipe provides a pretrained hand landmark pipeline; no model is trained from scratch. The gesture interpretation on top of the landmarks is this project's own logic.

---

## Getting started

### Prerequisites

- Node.js and npm
- A webcam
- A modern browser with camera permission granted (camera access requires `localhost` or HTTPS)

### Run locally

```bash
git clone <your-repo-url>
cd hand-gesture-recognition
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Start Camera**, and allow camera access.

---

## Design decisions

- **Browser-only processing.** No backend, so no frame upload and no network latency.
- **Rule-based classification instead of ML.** No dataset or training is needed, and the logic is easy to inspect and explain.
- **No made-up confidence score.** A rule-based classifier does not naturally produce a calibrated confidence, so none is shown.
- **Transition-based history.** Gestures are recorded when they change and stabilise, not on every frame.

---

## Limitations

- **Lighting:** poor lighting can reduce landmark detection quality.
- **Occlusion:** fingers hidden behind other fingers can confuse the classifier.
- **Hand orientation:** simple finger-extension rules can fail when the hand is strongly rotated.
- **Left vs right hand:** mirrored webcam feeds can change how a gesture appears.
- **Jitter:** predictions can switch rapidly between gestures near rule boundaries.
- **Scope:** this is a controlled demonstration of a small set of gestures, **not** a general sign-language recognition system.

---
