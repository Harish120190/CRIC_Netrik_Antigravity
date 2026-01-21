import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose?: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    if (!containerRef.current) return;

    try {
      setError(null);
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          console.log('QR Code scanned:', decodedText);
          stopScanner();
          onScan(decodedText);
        },
        (errorMessage) => {
          // Ignore continuous scanning errors
          console.debug('QR scan error:', errorMessage);
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err) {
      console.error('Failed to start scanner:', err);
      setHasPermission(false);
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Scan Team QR Code</h3>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div
          ref={containerRef}
          id="qr-reader"
          className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative"
        >
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              {error ? (
                <>
                  <p className="text-destructive text-center px-4">{error}</p>
                  <Button onClick={startScanner} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <Button onClick={startScanner}>
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {isScanning && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={stopScanner}>
              <X className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center mt-4">
          Point your camera at a team QR code to join
        </p>
      </CardContent>
    </Card>
  );
}
