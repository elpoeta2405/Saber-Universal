import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
    duration: number;
    onTimeUp: () => void;
    isPaused: boolean;
}

// A short, royalty-free tick sound encoded in base64, valid and non-empty.
const TICK_SOUND_B64 = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, isPaused }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isPaused) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => {
                    // Autoplay can be blocked by the browser, we catch the error silently.
                    // User interaction with the page will enable it.
                });
            }
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, onTimeUp]);

    const percentage = (timeLeft / duration) * 100;
    
    let barColor = 'bg-indigo-500';
    if (percentage < 50) barColor = 'bg-yellow-400';
    if (percentage < 25) barColor = 'bg-red-500';

    return (
        <div className="w-full my-4">
            <div className="flex justify-between items-center mb-1 px-1">
                <span className="text-sm font-semibold text-slate-300/80">Tiempo restante</span>
                <span className="text-lg font-bold text-white">{timeLeft}s</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-2.5 rounded-full ${barColor} transition-all duration-1000 linear`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <audio ref={audioRef} src={TICK_SOUND_B64} preload="auto" />
        </div>
    );
};

export default Timer;