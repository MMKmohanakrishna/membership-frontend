import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useMutation } from '@tanstack/react-query';
import { attendanceService } from '../services/apiService';
import { toast } from 'react-toastify';
import { Camera, CheckCircle, XCircle, User, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Scanner = () => {
  const [scanner, setScanner] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const scanMutation = useMutation({
    mutationFn: attendanceService.scanQR,
    onSuccess: (data) => {
      setScanResult(data.data);
      if (data.data.accessGranted) {
        toast.success(`Access granted for ${data.data.member.name}`);
      } else {
        toast.error(`Access denied: ${data.data.denialReason}`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Scan failed');
      setScanResult(null);
    },
  });

  useEffect(() => {
    if (scanning) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          html5QrcodeScanner.clear();
          setScanning(false);
          scanMutation.mutate(decodedText);
        },
        (error) => {
          // Ignore scan errors (happens continuously while scanning)
        }
      );

      setScanner(html5QrcodeScanner);

      return () => {
        if (html5QrcodeScanner) {
          html5QrcodeScanner.clear().catch(console.error);
        }
      };
    }
  }, [scanning]);

  const startScanning = () => {
    setScanResult(null);
    setScanning(true);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear().catch(console.error);
    }
    setScanning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">QR Code Scanner</h2>
        <p className="text-gray-600 mt-1">Scan member QR codes for check-in</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Camera Scanner</h3>

          {!scanning ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                Click the button below to start scanning QR codes
              </p>
              <button onClick={startScanning} className="btn-primary">
                Start Scanner
              </button>
            </div>
          ) : (
            <div>
              <div id="qr-reader" className="w-full"></div>
              <div className="mt-4 text-center">
                <button onClick={stopScanning} className="btn-secondary">
                  Stop Scanner
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scan Result */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Scan Result</h3>

          {!scanResult ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Waiting for scan...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status */}
              <div
                className={`p-6 rounded-lg text-center ${
                  scanResult.accessGranted
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-red-50 border-2 border-red-200'
                }`}
              >
                {scanResult.accessGranted ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
                    <h4 className="text-2xl font-bold text-green-800 mb-2">
                      Access Granted
                    </h4>
                    <p className="text-green-700">Welcome to the gym!</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 text-red-600 mx-auto mb-3" />
                    <h4 className="text-2xl font-bold text-red-800 mb-2">
                      Access Denied
                    </h4>
                    <p className="text-red-700">{scanResult.denialReason}</p>
                  </>
                )}
              </div>

              {/* Member Details */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Member Name</p>
                    <p className="font-semibold text-gray-800">
                      {scanResult.member.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-semibold text-gray-800">
                      {scanResult.member.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Member ID</p>
                    <p className="font-semibold text-gray-800">
                      {scanResult.member.memberId}
                    </p>
                  </div>
                </div>

                {scanResult.accessGranted && scanResult.member.membershipPlan && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Membership Plan</p>
                      <p className="font-semibold text-gray-800">
                        {scanResult.member.membershipPlan}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Membership Expiry</p>
                    <p className="font-semibold text-gray-800">
                      {format(new Date(scanResult.member.membershipEndDate), 'PPP')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={startScanning}
                className="w-full btn-primary"
              >
                Scan Next Member
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3">
          Scanner Instructions
        </h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li>• Click "Start Scanner" to activate the camera</li>
          <li>• Position the QR code within the scanning area</li>
          <li>• The system will automatically validate membership and record attendance</li>
          <li>• Access will be granted or denied based on membership status</li>
          <li>• Alerts will be sent to admins for denied access attempts</li>
        </ul>
      </div>
    </div>
  );
};

export default Scanner;
