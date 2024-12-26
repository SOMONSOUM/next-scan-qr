"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { motion } from "framer-motion";
import { Camera, FileUp, Flashlight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function QRScanner() {
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startScanner = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          toast.success("QR Code detected!", {
            description: result.data,
          });
          // Handle the QR code result here
          console.log("QR code detected:", result);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);

      if (!hasCamera) {
        toast.error("No camera found");
        return;
      }

      await scanner.start();
      scannerRef.current = scanner;
      setIsScanning(true);
    } catch (error) {
      toast.error("Failed to start scanner", {
        description: "Please make sure you've granted camera permissions",
      });
      console.error("Scanner error:", error);
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
      setFlashlightOn(false);
    }
  }, []);

  const toggleFlashlight = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.toggleFlash();
      setFlashlightOn((prev) => !prev);
    } catch (error) {
      toast.error("Failed to toggle flashlight");
      console.error("Flashlight error:", error);
    }
  }, []);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const result = await QrScanner.scanImage(file);
        toast.success("QR Code detected!", {
          description: result,
        });
        // Handle the QR code result here
        console.log("QR code detected from image:", result);
      } catch (error) {
        toast.error("No QR code found in image");
        console.error("File scanning error:", error);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  useEffect(() => {
    startScanner();
  }, [startScanner]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
        {/* Camera View */}
        <video ref={videoRef} className="w-full h-full object-cover" />

        {/* Scanning Frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-64 h-64 border-2 rounded-lg"
            initial={{ borderColor: "rgba(255,255,255,0.2)" }}
            animate={{
              borderColor: [
                "rgba(255,255,255,0.2)",
                "rgba(255,255,255,0.8)",
                "rgba(255,255,255,0.2)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Corner Markers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-72 h-72">
            {/* Top Left */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl" />
            {/* Top Right */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr" />
            {/* Bottom Left */}
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl" />
            {/* Bottom Right */}
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br" />
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 inset-x-0 p-4 flex justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
          <Button
            variant="outline"
            size="icon"
            className="bg-white/10 border-0 hover:bg-white/20"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="w-5 h-5" />
          </Button>
          {isScanning ? (
            <Button
              variant="outline"
              size="icon"
              className="bg-white/10 border-0 hover:bg-white/20"
              onClick={stopScanner}
            >
              <span className="sr-only">Stop scanning</span>
              <X className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="outline"
              className="bg-white/10 border-0 hover:bg-white/20 px-4"
              onClick={startScanner}
            >
              <Camera className="w-5 h-5 mr-2" />
              Scan
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className={`bg-white/10 border-0 hover:bg-white/20 ${
              !isScanning ? "opacity-50 cursor-not-allowed" : ""
            } ${flashlightOn ? "text-yellow-300" : ""}`}
            onClick={toggleFlashlight}
            disabled={!isScanning}
          >
            <Flashlight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
        onClick={(e) => {
          // Reset file input
          (e.target as HTMLInputElement).value = "";
        }}
      />
    </div>
  );
}
