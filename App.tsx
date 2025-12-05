import React, { useState } from 'react';
import { Camera, Package, Info, ChevronRight, Box, Upload } from 'lucide-react';
import { CameraView } from './components/CameraView';
import { AnalysisView } from './components/AnalysisView';
import { analyzePackageImage } from './services/geminiService';
import { PackageData, AppState } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<PackageData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartScanning = () => {
    setAppState(AppState.CAMERA);
    setErrorMsg(null);
  };

  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setAppState(AppState.ANALYZING);

    try {
      const data = await analyzePackageImage(imageData);
      setAnalysisData(data);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze package. Please ensure the image is clear and try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAnalysisData(null);
    setAppState(AppState.IDLE);
    setErrorMsg(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-white font-sans overflow-hidden">
      
      {/* State: IDLE - Landing Screen */}
      {appState === AppState.IDLE && (
        <div className="flex-1 flex flex-col relative overflow-hidden">
           {/* Background Deco */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

           <header className="p-6 pt-10 flex items-center gap-3 z-10">
             <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
               <Package className="text-white" size={24} />
             </div>
             <span className="text-xl font-bold tracking-tight">SmartSend</span>
           </header>

           <main className="flex-1 px-6 flex flex-col justify-center z-10">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
                Instant <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Package Logic</span>
              </h1>
              <p className="text-slate-400 text-lg mb-10 max-w-xs">
                Calculate dimensions, weight, and shipping costs instantly with AI-powered AR vision.
              </p>

              <div className="space-y-4">
                <button 
                  onClick={handleStartScanning}
                  className="w-full bg-white text-slate-900 font-bold py-4 px-6 rounded-xl flex items-center justify-between shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <Camera className="text-blue-600" />
                    Scan Package
                  </span>
                  <ChevronRight className="text-slate-400" />
                </button>

                <label className="w-full bg-slate-800 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between cursor-pointer border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all">
                  <span className="flex items-center gap-3">
                    <Upload className="text-cyan-400" />
                    Upload Photo
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <ChevronRight className="text-slate-500" />
                </label>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                   <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <Box className="text-cyan-400 mb-2" />
                      <p className="text-sm font-semibold">Measure</p>
                      <p className="text-xs text-slate-500">Auto L x W x H</p>
                   </div>
                   <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <Info className="text-blue-400 mb-2" />
                      <p className="text-sm font-semibold">Price</p>
                      <p className="text-xs text-slate-500">Real-time quotes</p>
                   </div>
                </div>
              </div>
           </main>
        </div>
      )}

      {/* State: CAMERA */}
      {appState === AppState.CAMERA && (
        <CameraView onCapture={handleCapture} onClose={handleReset} />
      )}

      {/* State: ANALYZING */}
      {appState === AppState.ANALYZING && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900 relative">
          <div className="absolute inset-0 z-0">
             {capturedImage && (
               <img src={capturedImage} alt="Processing" className="w-full h-full object-cover opacity-20 blur-sm" />
             )}
          </div>
          
          <div className="z-10 flex flex-col items-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-slate-700 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
              <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyzing Package</h2>
            <p className="text-slate-400 text-center max-w-xs">
              AI is calculating dimensions, estimating weight, and fetching rates...
            </p>
          </div>
        </div>
      )}

      {/* State: RESULTS */}
      {appState === AppState.RESULTS && analysisData && capturedImage && (
        <AnalysisView data={analysisData} capturedImage={capturedImage} onReset={handleReset} />
      )}

      {/* State: ERROR */}
      {appState === AppState.ERROR && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <Info className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-slate-400 mb-8 max-w-xs">{errorMsg}</p>
          <button 
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-full font-medium transition"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}