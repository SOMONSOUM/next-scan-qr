import { ScanQRScreen } from "@/screens/scan";

export default function Scan() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center hidden sm:block">
        QR Scanner
      </h1>
      <ScanQRScreen />
    </main>
  );
}
