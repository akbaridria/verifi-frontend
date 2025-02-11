"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { LoaderCircle } from "lucide-react";

const LIST_STEPS_PROOF = [
  {
    label: "Generate Proof",
    status: false,
    loading: true,
  },
  {
    label: "Submit proof to zkVerify",
    status: false,
    loading: false,
  },
  {
    label: "Transactions accepted in zkVerify",
    status: false,
    loading: false,
  },
  {
    label: "Transactions finalized in zkVerify",
    status: false,
    loading: false,
  },
  {
    label: "Waiting for transactions to be included in Arbitrum sepolia",
    status: false,
    loading: false,
  },
];

export const FaceScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast(); // Initialize the toast

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  // Start camera stream
  useEffect(() => {
    const startCamera = async () => {
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
          setErrorMessage("");
        } catch (error) {
          console.error("Error accessing camera:", error);
          toast({
            title: "Camera Permission Denied",
            variant: "destructive",
            description: "Please allow camera access in your browser settings.",
          });
        }
      }
    };

    if (isModelLoaded) {
      startCamera();
    }
  }, [isModelLoaded, toast]);

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setFaceDetected(false);
      setErrorMessage("");
    }
  };

  // Detect faces in video stream
  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    // Draw results on canvas
    const displaySize = {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight,
    };
    faceapi.matchDimensions(canvasRef.current, displaySize);

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
    }

    const classScore = detections?.[0]?.detection?.classScore;
    if (classScore > 0.9) {
      stopCamera();
      toast({
        title: "Face Detected",
        description:
          "Face detection successful. You can now disable camera permissions.",
        variant: "default",
      });
      setFaceDetected(true);
      console.log(detections[0]?.descriptor); // This will log the 128-dimension face embedding
    } else {
      setErrorMessage("Please hold still and face the camera.");
    }
  };

  // Run face detection when camera is active
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isCameraActive && isModelLoaded) {
      intervalId = setInterval(detectFaces, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCameraActive, isModelLoaded]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {!faceDetected && (
        <div className="relative w-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "100%", aspectRatio: "16/13" }}
          />
          <canvas
            ref={canvasRef}
            className="absolute w-full top-0 left-0 z-10"
          />
        </div>
      )}
      {faceDetected && (
        <>
          <div className="space-y-2 w-full pb-4 px-4">
            {LIST_STEPS_PROOF.map((item) => {
              return (
                <div className="flex items-center gap-2" key={item.label}>
                  <div
                    className={`w-2 rounded-full aspect-square ${
                      item.status || item.loading
                        ? "bg-primary"
                        : "bg-muted-foreground"
                    }`}
                  />
                  <div
                    className={`${
                      item.loading || item.status
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </div>
                  {item.loading && (
                    <LoaderCircle className="animate-spin" size={14} />
                  )}
                  {!item.loading && item.status && <div>✅</div>}
                </div>
              );
            })}
          </div>
          <div className="pb-4 px-4 w-full">
            <Button variant="default" className="w-full" disabled>
              Next
            </Button>
          </div>
        </>
      )}
      {errorMessage && (
        <div className="text-red-500 font-medium">{errorMessage}</div>
      )}
    </div>
  );
};

export default FaceScanner;
