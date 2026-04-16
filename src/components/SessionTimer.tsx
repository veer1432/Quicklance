import React, { useState, useEffect, useRef } from 'react';

interface SessionTimerProps {
  startTime: string;
  durationMinutes: number;
  onFiveMinutesLeft?: () => void;
  onLowTime?: (isLow: boolean) => void;
  onTimeUp?: () => void;
  className?: string;
}

const SessionTimer = React.memo(({ 
  startTime, 
  durationMinutes, 
  onFiveMinutesLeft, 
  onLowTime,
  onTimeUp,
  className 
}: SessionTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const milestoneReached = useRef<{ fiveMin: boolean; timeUp: boolean; lowTime: boolean }>({
    fiveMin: false,
    timeUp: false,
    lowTime: false
  });

  useEffect(() => {
    // Reset milestones if startTime or duration changes
    milestoneReached.current = { fiveMin: false, timeUp: false, lowTime: false };
  }, [startTime, durationMinutes]);

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - start) / 1000);
      const totalSeconds = durationMinutes * 60;
      const remaining = totalSeconds - elapsedSeconds;

      setTimeLeft(Math.max(0, remaining));

      // Milestone: 5 minutes left (300 seconds)
      if (remaining <= 300 && remaining > 0) {
        if (!milestoneReached.current.fiveMin) {
          milestoneReached.current.fiveMin = true;
          onFiveMinutesLeft?.();
        }
        if (!milestoneReached.current.lowTime) {
          milestoneReached.current.lowTime = true;
          onLowTime?.(true);
        }
      } else if (remaining > 300 && milestoneReached.current.lowTime) {
        milestoneReached.current.lowTime = false;
        onLowTime?.(false);
      }

      // Milestone: Time up
      if (remaining <= 0 && !milestoneReached.current.timeUp) {
        milestoneReached.current.timeUp = true;
        onTimeUp?.();
      }
    };

    calculateTime(); // Initial call
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [startTime, durationMinutes, onFiveMinutesLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <span className={className}>
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  );
});

export default SessionTimer;
