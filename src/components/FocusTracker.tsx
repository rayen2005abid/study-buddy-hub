import React, { useEffect, useRef, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { FaceLandmarker, FilesetResolver, ObjectDetector } from '@mediapipe/tasks-vision';

interface FocusTrackerProps {
    className?: string;
}

const VOICE_MESSAGES = {
    Overwhelmed: [
        "You seem a bit overwhelmed. Take a deep breath.",
        "It's okay to take a step back. Just breathe.",
        "Don't stress. One thing at a time.",
        "Maybe close your eyes for a second and reset.",
    ],
    Fatigued: [
        "You seem tired. Maybe stretch for a moment?",
        "Time for a quick stand-up break? You look sleepy.",
        "Eyes are getting heavy! Wake up with some water.",
        "Power stance! Shake it off!"
    ],
    Confused: [
        "You look puzzled. Try breaking it down.",
        "Stuck on something? Maybe ask the chatbot.",
        "Don't worry, confusion is part of learning.",
        "Take a second to rethink the problem."
    ],
    Happy: [
        "You're in the zone! Keep it up!",
        "Great focus! You're crushing it.",
        "Love the positive energy!",
        "Whatever you're doing, it's working."
    ],
    Distracted: [
        "Let's get back to it.",
        "Eyes on the prize!",
        "Focus on the screen, please.",
        "You drifted off there. Back to work!"
    ],
    Focused: [
        "Steady progress. Keep going.",
        "You're doing great. Stay with it.",
        "Nice consistent focus.",
        "One step at a time. You got this.",
        "Breath in, breath out. Stay focused."
    ],
    Hydration: [
        "Remember to stay hydrated.",
        "Take a sip of water.",
        "Hydration helps your brain function better.",
        "Don't forget to drink some water."
    ],
    Rewards: [
        "You've been working hard, maybe grab a healthy snack.",
        "Reward yourself with a small treat soon.",
        "Great focus session! You deserve a snack.",
        "Keep it up, and then treat yourself."
    ]
};

const FocusTracker = ({ className }: FocusTrackerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<'Focused' | 'Distracted' | 'Loading'>('Loading');
    const [emotion, setEmotion] = useState<string>('Neutral');
    const [phoneDetected, setPhoneDetected] = useState<boolean>(false);
    const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
    const [objectDetector, setObjectDetector] = useState<ObjectDetector | null>(null);
    const ws = useRef<WebSocket | null>(null);
    const { toast } = useToast();
    const sessionStart = useRef<number>(Date.now());
    const lastAnalysis = useRef<number>(Date.now());
    const lastObjectDetection = useRef<number>(Date.now());
    const lastAdviceTime = useRef<number>(0);
    const lastHappyTime = useRef<number>(0); // Rate limit positive feedback too
    const lastPhoneWarning = useRef<number>(0); // Rate limit phone warnings

    // Smoothing Variables
    const prevYaw = useRef<number>(0.5); // Start centered
    const prevPitch = useRef<number>(0.5); // Start centered (approx)
    const SMOOTHING_FACTOR = 0.2; // Lower = smoother but more lag

    // Statistics for analysis
    const focusHistory = useRef<boolean[]>([]);

    // Emotion History Buffer (for smoothing output)
    const emotionBuffer = useRef<string[]>([]);

    useEffect(() => {
        const initMediaPipe = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            const landmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numFaces: 1,
                outputFaceBlendshapes: true
            });
            setFaceLandmarker(landmarker);

            const objectDetector = await ObjectDetector.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
                    delegate: "GPU"
                },
                scoreThreshold: 0.5,
                runningMode: 'VIDEO'
            });
            setObjectDetector(objectDetector);

            setStatus('Distracted'); // Default start
        };
        initMediaPipe();

        // Connect to WebSocket
        ws.current = new WebSocket("ws://localhost:8000/ws/focus/1"); // Hardcoded client ID 1 for now
        ws.current.onopen = () => console.log("Focus Ws Connected");
        ws.current.onerror = (e) => console.error("WS Error", e);

        return () => {
            if (ws.current) ws.current.close();
        }
    }, []);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.addEventListener('loadeddata', predict);
            }
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setStatus('Distracted');
        }
    };

    const predict = async () => {
        if (!faceLandmarker || !videoRef.current || !canvasRef.current) return;

        let startTimeMs = performance.now();
        const results = await faceLandmarker.detectForVideo(videoRef.current, startTimeMs);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Match canvas size to video
        if (canvas.width !== videoRef.current.videoWidth || canvas.height !== videoRef.current.videoHeight) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
        }

        let isFocused = false;
        let currentEmotion = "Neutral";

        if (results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            const blendshapes = results.faceBlendshapes?.[0]?.categories;

            // Draw Landmarks (Simple dots)
            ctx.fillStyle = "#00FF00";
            for (const landmark of landmarks) {
                ctx.beginPath();
                ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 1, 0, 2 * Math.PI);
                ctx.fill();
            }

            // Key Landmarks
            const nose = landmarks[1];
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];

            // Highlight Key Areas
            ctx.fillStyle = "red";
            [nose, leftEye, rightEye].forEach(pt => {
                ctx.beginPath();
                ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, 2 * Math.PI);
                ctx.fill();
            });

            // 1. Calculate Raw Values
            const eyeDist = Math.abs(rightEye.x - leftEye.x);
            const noseToLeftDist = Math.abs(nose.x - leftEye.x);

            const rawYaw = noseToLeftDist / eyeDist; // 0.5 is center
            const rawPitch = nose.y; // 0 is top, 1 is bottom

            // 2. Apply Exponential Smoothing
            const smoothedYaw = (rawYaw * SMOOTHING_FACTOR) + (prevYaw.current * (1.0 - SMOOTHING_FACTOR));
            const smoothedPitch = (rawPitch * SMOOTHING_FACTOR) + (prevPitch.current * (1.0 - SMOOTHING_FACTOR));

            // Update refs for next frame
            prevYaw.current = smoothedYaw;
            prevPitch.current = smoothedPitch;

            // 3. Thresholds (Calibrated)
            // Yaw: Center is approx 0.5. Tolerance +/- 0.15 => 0.35 to 0.65
            const isLookingCenter = smoothedYaw > 0.35 && smoothedYaw < 0.65;

            // Pitch: Nose usually around 0.4-0.6. 
            // Looking down (phone) => y increases > 0.7
            // Looking up => y decreases < 0.3
            const isLookingDown = smoothedPitch > 0.65; // Adjusted threshold for phone detection
            const isLookingUp = smoothedPitch < 0.25; // Adjusted threshold for looking up
            const isLookingUpOrDown = isLookingUp || isLookingDown;

            // Detect phone usage (looking down)
            if (isLookingDown) {
                setPhoneDetected(true);
                setStatus('Distracted');
                if (ws.current?.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({
                        type: "distraction",
                        distraction_type: "phone",
                        focus_score: 0
                    }));
                }

                // Warn about phone usage (rate limited)
                const now = Date.now();
                if (now - lastPhoneWarning.current > 15000) { // Every 15 seconds
                    speak("Phone detected. Please focus on your screen.");
                    console.log('Phone detection state:', isLookingDown);
                    lastPhoneWarning.current = now;
                }
            } else if (isLookingCenter && !isLookingUpOrDown) {
                setPhoneDetected(false);
                setStatus('Focused');
                isFocused = true;
                if (ws.current?.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({
                        type: "focused",
                        focus_score: 100
                    }));
                }
            } else {
                setPhoneDetected(false);
                setStatus('Distracted');
                if (ws.current?.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({
                        type: "distracted",
                        focus_score: 50
                    }));
                }
            }

            // Draw Focus Box
            ctx.strokeStyle = isFocused ? "#00FF00" : "#FF0000";
            ctx.lineWidth = 4;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);


            // --- EMOTION & STATE ANALYSIS ---
            if (blendshapes) {
                const getScore = (name: string) => blendshapes.find(b => b.categoryName === name)?.score || 0;

                // 1. HAPPY (Flow State)
                const smile = getScore('mouthSmileLeft') + getScore('mouthSmileRight');

                // 2. OVERWHELMED (Stress)
                // Brow Down (Concentration/Stress) + Mouth Frown (Unhappiness)
                const browDown = getScore('browDownLeft') + getScore('browDownRight');
                const frown = getScore('mouthFrownLeft') + getScore('mouthFrownRight');
                const overwhelmScore = (browDown + frown) / 2;

                // 3. FATIGUED (Drowsy)
                // Eyes closing (blink) + Yawing (jawOpen) + Head Pitch (Drooping)
                const eyeBlink = (getScore('eyeBlinkLeft') + getScore('eyeBlinkRight')) / 2;
                const jawOpen = getScore('jawOpen');
                // Pitch > 0.7 is looking down
                const fatigueScore = (eyeBlink * 0.4) + (jawOpen * 0.4) + (smoothedPitch > 0.65 ? 0.2 : 0);

                // 4. CONFUSED
                // Brow Inner Up (Questioning)
                const confusionScore = getScore('browInnerUp');

                // Logic Selection
                if (smile > 0.5) {
                    currentEmotion = "😊 Happy";
                } else if (overwhelmScore > 0.45) { // Thresholds need tuning
                    currentEmotion = "😫 Overwhelmed";
                } else if (fatigueScore > 0.35) {
                    currentEmotion = "😴 Fatigued";
                } else if (confusionScore > 0.4) {
                    currentEmotion = "🤔 Confused";
                } else {
                    currentEmotion = "😐 Neutral";
                }
            }

        } else {
            setStatus('Distracted');
            if (ws.current?.readyState === WebSocket.OPEN) ws.current.send("away");
            currentEmotion = "Searching...";
        }

        // Update history
        focusHistory.current.push(isFocused);
        if (focusHistory.current.length > 300) focusHistory.current.shift(); // Keep last ~10s (assuming 30fps)

        // Smooth Emotion Display
        emotionBuffer.current.push(currentEmotion);
        if (emotionBuffer.current.length > 20) emotionBuffer.current.shift(); // approx 0.5s buffer

        // Find most frequent emotion in buffer (Mode)
        const counts: { [key: string]: number } = {};
        emotionBuffer.current.forEach(e => counts[e] = (counts[e] || 0) + 1);
        const dominantEmotion = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        setEmotion(dominantEmotion);

        // Unified Coach Commentary Loop
        const now = Date.now();
        // Guaranteed message attempt every 50 seconds regardless of strong emotion
        // We use lastAdviceTime for ALL types of messages to keep a steady rhythm
        if (now - lastAdviceTime.current > 50000) {
            let category = null;

            // 1. Critical States (Priority)
            if (dominantEmotion.includes("Overwhelmed")) category = 'Overwhelmed';
            else if (dominantEmotion.includes("Fatigued")) category = 'Fatigued';
            else if (dominantEmotion.includes("Confused")) category = 'Confused';

            // 2. Positive/Flow States
            else if (dominantEmotion.includes("Happy") && status === 'Focused') category = 'Happy';

            // 3. Normal Focused State (The "Loop" filler)
            else if (status === 'Focused') category = 'Focused';

            // 4. Distracted
            else if (status === 'Distracted') category = 'Distracted';

            if (category) {
                // @ts-ignore - TS might complain about indexing with string logic, but keys match
                const msgs = VOICE_MESSAGES[category as keyof typeof VOICE_MESSAGES] || VOICE_MESSAGES.Focused;
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                speak(msg);
                lastAdviceTime.current = now;
            } else {
                // Randomly suggest Hydration or Rewards if strictly focused
                if (Math.random() > 0.8) {
                    const extraCategory = Math.random() > 0.5 ? 'Hydration' : 'Rewards';
                    // @ts-ignore
                    const extraMsgs = VOICE_MESSAGES[extraCategory];
                    const msg = extraMsgs[Math.floor(Math.random() * extraMsgs.length)];
                    speak(msg);
                    lastAdviceTime.current = now;
                }
            }
        }
        // Periodic Analysis Check (Every 10 seconds for demo purposes, normally every minute)
        if (Date.now() - lastAnalysis.current > 10000) {
            await runAnalysis();
            lastAnalysis.current = Date.now();
        }

        // Object Detection (Every 2 seconds)
        if (Date.now() - lastObjectDetection.current > 2000) {
            detectObjects();
            lastObjectDetection.current = Date.now();
        }

        requestAnimationFrame(predict);
    };

    const detectObjects = async () => {
        if (!objectDetector || !videoRef.current) return;

        let startTimeMs = performance.now();
        const detections = objectDetector.detectForVideo(videoRef.current, startTimeMs);

        if (detections.detections && detections.detections.length > 0) {
            // Check for specific distracting objects
            // MediaPipe efficientdet_lite0 COCO labels: "cell phone" is a label
            const distractingObjects = detections.detections.filter((d) => {
                const label = d.categories[0].categoryName?.toLowerCase();
                return label === 'cell phone' || label === 'remote';
            });

            if (distractingObjects.length > 0) {
                const label = distractingObjects[0].categories[0].categoryName;
                // console.log("Distracting object detected:", label);
                setPhoneDetected(true); // Re-use phone detected state for UI badge

                const now = Date.now();
                if (now - lastPhoneWarning.current > 15000) {
                    speak(`I see a ${label}. Please put it away.`);
                    lastPhoneWarning.current = now;
                }
            } else if (!distractingObjects.length) {
                // If not distracted by phone, we rely on face pose for clearing the flag
                // We don't exclusively clear it here to avoid flickering if pose is also bad
            }
        }
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
            if (preferredVoice) utterance.voice = preferredVoice;
            window.speechSynthesis.speak(utterance);

            toast({
                title: "Study Coach",
                description: text,
            });
        }
    };

    const runAnalysis = async () => {
        // Calculate average focus score (simple ratio)
        const focusedFrames = focusHistory.current.filter(f => f).length;
        const totalFrames = focusHistory.current.length;
        const score = totalFrames > 0 ? focusedFrames / totalFrames : 0;

        const durationMinutes = Math.floor((Date.now() - sessionStart.current) / 60000);

        try {
            const res = await fetch("http://localhost:8000/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: 1, // Hardcoded
                    focus_score: score,
                    current_duration_minutes: durationMinutes
                })
            });
            const data = await res.json();

            if (data.advice) {
                // Show Visual Notification
                toast({
                    title: data.advice.title,
                    description: data.advice.description,
                    variant: data.advice.type === 'warning' ? 'destructive' : 'default',
                    duration: 5000,
                });

                if ('speechSynthesis' in window) {
                    // Only speak if we haven't given immediate advice recently to avoid double-talking
                    if (Date.now() - lastAdviceTime.current > 10000) {
                        speak(data.advice.description);
                    }
                }
            }
        } catch (e) {
            console.error("Analysis failed", e);
        }
    };

    useEffect(() => {
        if (faceLandmarker) {
            startWebcam();
        }
    }, [faceLandmarker]);

    return (
        <div className={`relative bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
            <div className="relative aspect-video bg-gray-100">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1] absolute inset-0 z-0"
                />
                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover transform scale-x-[-1] absolute inset-0 z-10 opacity-70"
                />

                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium z-20 ${status === 'Focused' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {status}
                </div>

                {/* Phone Detection Badge */}
                {phoneDetected && (
                    <div className="absolute top-10 right-2 px-2 py-0.5 rounded text-xs font-medium z-20 bg-orange-100 text-orange-700 shadow-sm border border-orange-200 animate-pulse">
                        📱 Phone Detected
                    </div>
                )}

                {/* Emotion Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium z-20 bg-blue-100 text-blue-700 shadow-sm border border-blue-200">
                    {emotion}
                </div>
            </div>
            <div className="p-3">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-semibold">Focus Tracker AI</h3>
                    <button
                        onClick={() => speak("Voice system check complete.")}
                        className="text-[10px] bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                        Test Voice
                    </button>
                </div>
                <p className="text-xs text-gray-500">
                    {status === 'Focused' ? 'Great work! Keep it up.' : 'Please focus on the screen.'}
                </p>
            </div>
        </div>
    );
};

export default FocusTracker;
