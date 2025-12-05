import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RefreshCw, Upload, X, Scale, ScanLine, MoveVertical, AlertTriangle, Check } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  
  // Simulated measurement state
  const [measurements, setMeasurements] = useState({
    width: 0,
    height: 0,
    length: 0,
    weight: 0
  });

  // Simulated distance state (0-100, 50 is optimal)
  const [rangeValue, setRangeValue] = useState(50);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please allow permissions or use file upload.");
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Simulate active scanning fluctuation & distance
  useEffect(() => {
    const interval = setInterval(() => {
      // Dimensions
      setMeasurements({
        width: 24 + (Math.random() * 0.8 - 0.4),
        height: 18 + (Math.random() * 0.8 - 0.4),
        length: 32 + (Math.random() * 0.8 - 0.4),
        weight: 2.4 + (Math.random() * 0.2 - 0.1)
      });

      // Range simulation - oscillate WIDER to show state changes (swings between ~15 and ~85)
      setRangeValue(50 + Math.sin(Date.now() / 1500) * 35);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Determine Range Status Logic
  let statusMode: 'optimal' | 'close' | 'far' = 'optimal';
  if (rangeValue <= 30) statusMode = 'close';
  else if (rangeValue >= 70) statusMode = 'far';

  const statusConfig = {
    optimal: {
      color: 'text-cyan-400',
      borderColor: 'border-cyan-400',
      bgColor: 'bg-cyan-400',
      text: 'OPTIMAL RANGE',
      Icon: Check,
      opacity: 'opacity-100'
    },
    close: {
      color: 'text-rose-500',
      borderColor: 'border-rose-500',
      bgColor: 'bg-rose-500',
      text: 'TOO CLOSE',
      Icon: AlertTriangle,
      opacity: 'opacity-60'
    },
    far: {
      color: 'text-amber-500',
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-500',
      text: 'TOO FAR',
      Icon: AlertTriangle,
      opacity: 'opacity-60'
    }
  };

  const currentStatus = statusConfig[statusMode];
  const isOptimalRange = statusMode === 'optimal';

  return (
    <div className="relative h-full w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Video Feed */}
      {!error ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="text-white text-center p-6 bg-slate-800 rounded-lg max-w-sm z-10">
          <p className="mb-4 text-red-400">{error}</p>
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full cursor-pointer flex items-center justify-center gap-2">
            <Upload size={20} />
            <span>Upload Photo Instead</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {/* AR Overlay */}
      {!error && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          
          {/* Bounding Box Container */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 transition-all duration-300">
            
            {/* Box Border - Dashed & Glowing */}
            <div className={`absolute inset-0 border-2 border-dashed ${currentStatus.borderColor} opacity-60 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.2)] animate-[pulse_2s_infinite] transition-colors duration-300`}></div>

            {/* Corner Markers (Solid) */}
            <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 ${currentStatus.borderColor} rounded-tl-sm transition-colors duration-300`}></div>
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 ${currentStatus.borderColor} rounded-tr-sm transition-colors duration-300`}></div>
            <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 ${currentStatus.borderColor} rounded-bl-sm transition-colors duration-300`}></div>
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 ${currentStatus.borderColor} rounded-br-sm transition-colors duration-300`}></div>

            {/* Scanning Scanline - Only visible when optimal */}
            {isOptimalRange && (
               <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-scan"></div>
            )}

            {/* Range Status Text (Top) */}
            <div className={`absolute -top-12 left-0 right-0 text-center flex justify-center`}>
                <div className={`flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 ${currentStatus.color} transition-all duration-300`}>
                    <currentStatus.Icon size={14} className={isOptimalRange ? "" : "animate-pulse"} />
                    <span className="text-xs font-bold tracking-[0.2em]">{currentStatus.text}</span>
                </div>
            </div>

            {/* Range Meter (Right Side) */}
            <div className="absolute top-4 bottom-4 -right-8 w-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 overflow-hidden flex flex-col justify-end">
                {/* Safe Zone Indicator */}
                <div className="absolute top-[30%] bottom-[30%] left-0 right-0 bg-white/10"></div>
                
                {/* Moving Indicator */}
                <div 
                    className={`absolute left-0 right-0 h-8 rounded-full shadow-[0_0_8px_currentColor] transition-all duration-300 ease-out ${currentStatus.bgColor}`}
                    style={{ bottom: `${rangeValue}%`, transform: 'translateY(50%)' }}
                ></div>
            </div>

            {/* Dimensions Labels - Refined positioning and styling */}
            
            {/* Width - Top */}
            <div className={`absolute -top-14 left-0 w-full flex justify-center z-20 transition-opacity duration-300 ${currentStatus.opacity}`}>
              <div className={`bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 ${currentStatus.color} flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)]`}>
                 <span className="opacity-80 text-[10px] tracking-wider uppercase font-bold">WIDTH</span>
                 <span className="text-white text-sm font-mono font-bold">{measurements.width.toFixed(1)} cm</span>
              </div>
            </div>

            {/* Height - Left */}
            <div className={`absolute top-0 -left-14 h-full flex items-center z-20 transition-opacity duration-300 ${currentStatus.opacity}`}>
               <div className={`bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 ${currentStatus.color} whitespace-nowrap -rotate-90 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center gap-2`}>
                 <span className="opacity-80 text-[10px] tracking-wider uppercase font-bold">HEIGHT</span>
                 <span className="text-white text-sm font-mono font-bold">{measurements.height.toFixed(1)} cm</span>
               </div>
            </div>

            {/* Length - Right (Simulated) */}
            <div className={`absolute top-0 -right-14 h-full flex items-center z-20 transition-opacity duration-300 ${currentStatus.opacity}`}>
               <div className={`bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 ${currentStatus.color} whitespace-nowrap rotate-90 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center gap-2`}>
                 <span className="opacity-80 text-[10px] tracking-wider uppercase font-bold">LENGTH</span>
                 <span className="text-white text-sm font-mono font-bold">{measurements.length.toFixed(1)} cm</span>
               </div>
            </div>

             {/* Weight Tag */}
             <div className={`absolute -bottom-20 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300 ${currentStatus.opacity}`}>
                <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                    <Scale size={16} className={isOptimalRange ? "text-yellow-500" : "text-gray-500"} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isOptimalRange ? "text-yellow-500" : "text-gray-500"}`}>Est. Weight</span>
                    <span className="text-base font-bold text-white font-mono">{measurements.weight.toFixed(1)} kg</span>
                </div>
            </div>

             {/* Center Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-50">
                <div className={`absolute top-1/2 left-0 w-full h-0.5 ${currentStatus.bgColor} -translate-y-1/2 transition-colors duration-300`}></div>
                <div className={`absolute left-1/2 top-0 h-full w-0.5 ${currentStatus.bgColor} -translate-x-1/2 transition-colors duration-300`}></div>
            </div>

          </div>
          
           {/* Calibrating Text */}
           <div className={`absolute bottom-32 flex items-center gap-2 ${currentStatus.color} opacity-80`}>
              {isOptimalRange && <div className={`w-2 h-2 ${currentStatus.bgColor} rounded-full animate-ping`}></div>}
              <span className="text-xs font-mono tracking-widest uppercase">
                {isOptimalRange ? 'Detecting Surface' : (statusMode === 'close' ? 'Move Camera Back' : 'Move Camera Closer')}
              </span>
           </div>

        </div>
      )}

      {/* Controls */}
      {!error && (
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-around items-center bg-gradient-to-t from-black/90 to-transparent z-20">
          <label className="p-3 rounded-full bg-slate-800/80 text-white cursor-pointer hover:bg-slate-700 transition backdrop-blur-sm border border-white/10">
            <Upload size={24} />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>

          <button
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white/20 bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] backdrop-blur-sm group"
          >
            <div className={`w-16 h-16 rounded-full ${isOptimalRange ? 'bg-cyan-500 group-hover:bg-cyan-400' : 'bg-slate-600'} transition-colors shadow-inner flex items-center justify-center`}>
                <ScanLine size={32} className="text-white opacity-80" />
            </div>
          </button>

          <button
            onClick={toggleCamera}
            className="p-3 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition backdrop-blur-sm border border-white/10"
          >
            <RefreshCw size={24} />
          </button>
        </div>
      )}

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-30 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 backdrop-blur-sm border border-white/10"
      >
        <X size={24} />
      </button>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};