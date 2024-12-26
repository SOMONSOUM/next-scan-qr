"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flashlight, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const QRScanner = () => {
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const startScanner = useCallback(async () => {
    if (!videoRef.current || typeof window === "undefined") return;

    try {
      const QrScannerModule = await import("qr-scanner");
      const scanner = new QrScannerModule.default(
        videoRef.current,
        (result: any) => {
          setScanResult(result.data);
          stopScanner();
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      const hasCamera = await QrScannerModule.default.hasCamera();
      setHasCamera(hasCamera);

      if (!hasCamera) {
        console.error("No camera found");
        return;
      }

      await scanner.start();
      scannerRef.current = scanner;
      setIsScanning(true);
    } catch (error) {
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
      console.error("Flashlight error:", error);
    }
  }, []);

  const closeDialog = () => {
    setScanResult(null);
    startScanner();
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  const handleBack = () => {
    stopScanner();
    router.back();
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="relative w-full h-full md:h-[80vh] md:w-[500px] md:rounded-2xl md:shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <h1 className="text-xl font-bold text-white">AAS ស្កែន</h1>
          <Button
            variant="ghost"
            className="text-white p-2 h-auto hover:bg-transparent"
            onClick={handleBack}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="relative h-full bg-gray-900 flex items-center justify-center">
          <video
            ref={videoRef}
            className="h-full w-full object-cover md:object-contain"
          />
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 pb-safe bg-gradient-to-t from-black/80 to-transparent">
          {/* Action Buttons */}
          <div className="flex justify-center gap-3 p-4 md:pb-6">
            <Button
              variant="ghost"
              className="h-12 flex-1 max-w-40 bg-black/80 text-white hover:bg-black/70 rounded-full"
              onClick={toggleFlashlight}
            >
              <Flashlight
                className="w-5 h-5 mr-2"
                color={`${flashlightOn ? "yellow" : "white"}`}
              />
              <span>ភ្លើង</span>
            </Button>
            <Button
              variant="ghost"
              className="h-12 flex-1 max-w-40 bg-black/80 hover:bg-black/70 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <QrCode className="w-5 h-5 mr-2" color="white" />
              <span className="text-white">បើក QR</span>
            </Button>
          </div>

          {/* Payment Methods */}
          <div className="bg-black/80 backdrop-blur-sm p-4">
            <div className="flex justify-center items-center gap-2 overflow-x-auto py-2 px-4 bg-white rounded-lg">
              {[
                "/bakong.png",
                "/nbc.svg",
                "/unionpay.svg",
                "/visa.svg",
                "/mastercard.svg",
              ].map((src, index) => (
                <div key={index} className="flex-shrink-0 w-10 h-6">
                  <Image
                    src={src}
                    alt="Payment method"
                    width={40}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Keeping your existing file input and dialog components */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || typeof window === "undefined") return;

            try {
              const QrScannerModule = await import("qr-scanner");
              const result = await QrScannerModule.default.scanImage(file);
              setScanResult(result);
            } catch (error) {
              console.error("File scanning error:", error);
            }
            e.target.value = "";
          }}
        />

        <AlertDialog
          open={!!scanResult}
          onOpenChange={() => scanResult && closeDialog()}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>QR Code Detected</AlertDialogTitle>
              <AlertDialogDescription className="break-all">
                {scanResult}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={closeDialog}>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
