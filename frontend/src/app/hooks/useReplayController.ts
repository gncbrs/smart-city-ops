import { useEffect, useState } from "react";
import { useReplayTimeRange } from "../../features/operations-replay/hooks/useReplayTimeRange";
import type { ReplayMode, ReplaySpeed } from "../../features/operations-replay/types";

const PLAYBACK_TICK_MS = 300;
const TOTAL_PLAYBACK_STEPS = 200; // full min→max sweep takes ~60s of real time at 1x

export function useReplayController() {
  const { data: timeRange } = useReplayTimeRange();
  const minTimestamp = timeRange?.minTimestamp ?? null;
  const maxTimestamp = timeRange?.maxTimestamp ?? null;

  const [mode, setMode] = useState<ReplayMode>("live");
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<ReplaySpeed>(1);

  const isReplayMode = mode === "replay";

  useEffect(() => {
    if (isReplayMode && timestamp === null && minTimestamp) {
      setTimestamp(minTimestamp);
    }
  }, [isReplayMode, timestamp, minTimestamp]);

  useEffect(() => {
    if (!isReplayMode || !isPlaying || !minTimestamp || !maxTimestamp) return;

    const min = new Date(minTimestamp).getTime();
    const max = new Date(maxTimestamp).getTime();
    const stepMs = ((max - min) / TOTAL_PLAYBACK_STEPS) * speed;

    if (stepMs <= 0) {
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setTimestamp((current) => {
        const currentMs = current ? new Date(current).getTime() : min;
        const nextMs = currentMs + stepMs;

        if (nextMs >= max) {
          setIsPlaying(false);
          return maxTimestamp;
        }

        return new Date(nextMs).toISOString();
      });
    }, PLAYBACK_TICK_MS);

    return () => clearInterval(interval);
  }, [isReplayMode, isPlaying, speed, minTimestamp, maxTimestamp]);

  const enterReplayMode = () => {
    setMode("replay");
    setIsPlaying(false);
  };

  const exitReplayMode = () => {
    setMode("live");
    setIsPlaying(false);
  };

  const scrubTo = (value: string) => {
    setIsPlaying(false);
    setTimestamp(value);
  };

  const togglePlayback = () => {
    if (!minTimestamp || !maxTimestamp) return;

    setIsPlaying((prev) => {
      const next = !prev;
      if (next && timestamp === maxTimestamp) {
        setTimestamp(minTimestamp);
      }
      return next;
    });
  };

  return {
    mode,
    isReplayMode,
    timestamp,
    isPlaying,
    speed,
    setSpeed,
    minTimestamp,
    maxTimestamp,
    enterReplayMode,
    exitReplayMode,
    scrubTo,
    togglePlayback,
  };
}
