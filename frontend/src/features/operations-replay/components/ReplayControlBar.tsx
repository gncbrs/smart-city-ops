import type { ReplayMode, ReplaySpeed } from "../types";
import "../styles/ReplayControlBar.css";
import "../../../shared/styles/buttons.css";

const SPEED_OPTIONS: ReplaySpeed[] = [1, 2, 5];

interface ReplayControlBarProps {
  mode: ReplayMode;
  onEnterReplay: () => void;
  onExitReplay: () => void;
  minTimestamp: string | null;
  maxTimestamp: string | null;
  timestamp: string | null;
  onScrub: (timestamp: string) => void;
  isPlaying: boolean;
  onTogglePlayback: () => void;
  speed: ReplaySpeed;
  onSpeedChange: (speed: ReplaySpeed) => void;
  isLoading: boolean;
}

export function ReplayControlBar({
  mode,
  onEnterReplay,
  onExitReplay,
  minTimestamp,
  maxTimestamp,
  timestamp,
  onScrub,
  isPlaying,
  onTogglePlayback,
  speed,
  onSpeedChange,
  isLoading,
}: ReplayControlBarProps) {
  const isReplayMode = mode === "replay";
  const hasHistory = minTimestamp !== null && maxTimestamp !== null;

  const minMs = minTimestamp ? new Date(minTimestamp).getTime() : 0;
  const maxMs = maxTimestamp ? new Date(maxTimestamp).getTime() : 0;
  const currentMs = timestamp ? new Date(timestamp).getTime() : minMs;

  return (
    <div className="replay-control-bar">
      <div className="replay-control-bar__mode-toggle">
        <button
          type="button"
          className={
            "app-button replay-control-bar__mode-button" +
            (!isReplayMode ? " replay-control-bar__mode-button--active" : "")
          }
          onClick={onExitReplay}
        >
          Live
        </button>
        <button
          type="button"
          className={
            "app-button replay-control-bar__mode-button" +
            (isReplayMode ? " replay-control-bar__mode-button--active" : "")
          }
          onClick={onEnterReplay}
          disabled={!hasHistory}
        >
          Historical Replay
        </button>
      </div>

      {isReplayMode && !hasHistory && (
        <p className="replay-control-bar__empty">No historical data available yet.</p>
      )}

      {isReplayMode && hasHistory && (
        <>
          <div className="replay-control-bar__playback">
            <button
              type="button"
              className="app-button replay-control-bar__play-button"
              onClick={onTogglePlayback}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <input
              type="range"
              className="replay-control-bar__slider"
              min={minMs}
              max={maxMs}
              step={1000}
              value={currentMs}
              onChange={(event) => onScrub(new Date(Number(event.target.value)).toISOString())}
              aria-label="Replay timeline scrubber"
            />

            <select
              className="replay-control-bar__speed"
              value={speed}
              onChange={(event) => onSpeedChange(Number(event.target.value) as ReplaySpeed)}
              aria-label="Playback speed"
            >
              {SPEED_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}x
                </option>
              ))}
            </select>
          </div>

          <span className="replay-control-bar__timestamp">
            {timestamp ? new Date(timestamp).toLocaleString() : "--"}
            {isLoading && " (loading…)"}
          </span>

          <p className="replay-control-bar__readonly-note">Historical snapshot — actions disabled.</p>
        </>
      )}
    </div>
  );
}
