import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'motion/react';

interface VideoCallProps {
  autoStart?: boolean;
  isExpert?: boolean;
}

const VideoCall = React.memo(({ autoStart = false, isExpert = false }: VideoCallProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsVideoOn(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsVideoOn(false);
    }
  };

  const toggleVideo = () => {
    if (isVideoOn) {
      stream?.getVideoTracks().forEach(track => track.enabled = false);
      setIsVideoOn(false);
    } else {
      if (!stream) {
        startCamera();
      } else {
        stream.getVideoTracks().forEach(track => track.enabled = true);
        setIsVideoOn(true);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    return () => stopCamera();
  }, [autoStart]);

  return (
    <motion.div 
      layout
      className={`fixed z-[100] transition-all duration-500 ease-in-out ${
        isMinimized 
          ? 'bottom-24 right-4 w-48 h-32' 
          : 'bottom-24 right-4 w-80 h-60 md:w-96 md:h-72'
      } rounded-3xl overflow-hidden bg-gray-900 shadow-2xl border-2 border-blue-500/30 group`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // Mute local preview to avoid feedback
        className="w-full h-full object-cover bg-gray-800"
      />

      {/* Placeholder when video is off */}
      {!isVideoOn && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500">
          <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mb-2">
            <VideoOff className="h-8 w-8" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest">Camera Off</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
          <p className="text-xs font-bold text-red-500 leading-relaxed">{error}</p>
          <button 
            onClick={startCamera}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-center gap-3">
          <button 
            onClick={toggleMic}
            className={`p-3 rounded-2xl transition-all ${
              isMicOn ? 'bg-gray-800/80 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <button 
            onClick={toggleVideo}
            className={`p-3 rounded-2xl transition-all ${
              isVideoOn ? 'bg-gray-800/80 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-3 rounded-2xl bg-gray-800/80 text-white transition-all"
          >
            {isMinimized ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isVideoOn ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            {isExpert ? 'Expert Preview' : 'My Preview'}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

export default VideoCall;
