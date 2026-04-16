import React, { useEffect, useRef } from 'react';

interface JitsiMeetingProps {
  roomName: string;
  displayName?: string;
  onClose?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const JitsiMeeting = React.memo(({ roomName, displayName, onClose }: JitsiMeetingProps) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const onCloseRef = useRef(onClose);

  // Update ref when onClose changes without triggering useEffect
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!jitsiContainerRef.current) return;

    if (!window.JitsiMeetExternalAPI) {
      console.error("Jitsi Meet External API not loaded");
      return;
    }

    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: displayName || 'Quicklancer User'
      },
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        enableClosePage: false,
        disableRemoteMute: false,
        p2p: {
          enabled: true
        },
        // Echo cancellation and audio quality
        disableEchoCancellation: false,
        autoCaption: false,
        enableNoAudioDetection: true,
        enableNoisyMicDetection: true,
        // Modern toolbar configuration
        toolbarButtons: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
          'security', 'select-background', 'shareaudio', 'noise-suppression'
        ],
        settingsSections: ['devices', 'language', 'moderator', 'profile', 'calendar'],
      },
      interfaceConfigOverwrite: {
        MOBILE_APP_PROMO: false,
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_REMOTE_DISPLAY_NAME: 'Quicklancer',
      }
    };

    apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

    apiRef.current.addEventListener('videoConferenceLeft', () => {
      onCloseRef.current?.();
    });

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomName, displayName]); // Removed onClose from dependencies

  return (
    <div 
      ref={jitsiContainerRef} 
      className="w-full h-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl"
      style={{ minHeight: '500px' }}
    />
  );
});

export default JitsiMeeting;
