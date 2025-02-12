"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { LoaderCircle } from "lucide-react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { generateInputs, generateProof } from "@/lib/utils";
import { useFormScan } from "./form-scan";
import { ethers } from "ethers";
import { ResponseSubmitProof } from "@/types";
import { LIST_NETWORKS } from "@/constant/data";

export const FaceScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();
  const { address } = useAppKitAccount();
  const { listSteps, setListSteps, setOpen, setSubmittedProof, setSelectedStepIndex } = useFormScan();
  const { caipNetworkId } = useAppKitNetwork();
  const zkvContractAddress = useMemo(
    () => LIST_NETWORKS.find((network) => network.caipNetworkId === caipNetworkId)?.zkVerifyAddress,
    [caipNetworkId]
  );

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

  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

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
        description: "Face detection successful. You can now disable camera permissions.",
        variant: "default",
      });
      setFaceDetected(true);
      handleGenerateProof(detections[0].descriptor);
    } else {
      setErrorMessage("Please hold still and face the camera.");
    }
  };

  const handleGenerateProof = useCallback(
    async (faceEmbeddings: Float32Array<ArrayBufferLike>) => {
      if (address) {
        const data = await generateInputs(faceEmbeddings, address);
        setListSteps((prev) => {
          const res = prev;
          res[0].loading = false;
          res[0].status = true;
          res[1].loading = true;
          return res;
        });

        try {
          const { proof, publicSignals } = await generateProof(data);

          const response = await fetch("/api/submit-proof", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ proof, publicSignals }),
          });

          const result: ResponseSubmitProof = await response.json();

          if (result.success) {
            setListSteps((prev) => {
              const res = prev;
              res[1].loading = false;
              res[1].status = true;
              res[2].status = true;
              res[3].status = true;
              res[4].loading = true;
              return res;
            });
            const { attestationId } = result;

            setSubmittedProof(result);

            // @ts-expect-error msg
            const provider = new ethers.BrowserProvider(window.ethereum, null, { polling: true });
            
            const abiZkvContract = [
              "event AttestationPosted(uint256 indexed attestationId, bytes32 indexed root)",
            ];

            const zkvContract = new ethers.Contract(
              zkvContractAddress || "",
              abiZkvContract,
              provider
            );

            console.log(zkvContractAddress)

            const filterAttestationsById = zkvContract.filters.AttestationPosted(
              attestationId,
              null
            );

            zkvContract.once(filterAttestationsById, async (_id: unknown, _root: unknown) => {
              console.log(_id, _root)
              setListSteps((prev) => {
                const res = prev;
                res[4].loading = false;
                res[4].status = true;
                return res;
              });
              setSelectedStepIndex(2);
            });
          } else {
            setOpen(false);
            setSelectedStepIndex(0);
            toast({
              variant: "destructive",
              title: "Proof Submission Failed, in api calls",
            });
          }
        } catch (error) {
          console.log(error);
          setOpen(false);
          setSelectedStepIndex(0);
          toast({
            variant: "destructive",
            title: "Proof Submission Failed, in try catch",
          });
        }
      }
    },
    [address, setListSteps, setOpen, setSelectedStepIndex, setSubmittedProof, toast, zkvContractAddress]
  );

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
          <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", aspectRatio: "16/13" }} />
          <canvas ref={canvasRef} className="absolute w-full top-0 left-0 z-10" />
        </div>
      )}
      {faceDetected && (
        <>
          <div className="space-y-2 w-full pb-4 px-4">
            {listSteps.map((item) => (
              <div className="flex items-center gap-2" key={item.label}>
                <div className={`w-2 rounded-full aspect-square ${item.status || item.loading ? "bg-primary" : "bg-muted-foreground"}`} />
                <div className={`${item.loading || item.status ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {item.label}
                </div>
                {item.loading && <LoaderCircle className="animate-spin" size={14} />}
                {!item.loading && item.status && <div>✅</div>}
              </div>
            ))}
          </div>
          <div className="pb-4 px-4 w-full">
            <Button variant="default" className="w-full" disabled>
              Next
            </Button>
          </div>
        </>
      )}
      {errorMessage && <div className="text-red-500 font-medium">{errorMessage}</div>}
    </div>
  );
};

export default FaceScanner;
