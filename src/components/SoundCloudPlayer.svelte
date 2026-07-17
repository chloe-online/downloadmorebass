<script lang="ts">
  import Hls from "hls.js";
  import { fetchStreamUrl } from "../lib/api";
  import {
    setPlayerMuted,
    setPlayerPlaying,
    setPlayerVolume,
  } from "../lib/playback.svelte";

  let {
    trackId,
    cover,
    title,
    height = 300,
  }: {
    trackId: number;
    cover: string;
    title: string;
    height?: number;
  } = $props();

  let audioEl = $state<HTMLAudioElement | null>(null);
  let playing = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);
  let volume = $state(0.8);
  let muted = $state(false);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let scrubbing = $state(false);
  let volumeScrubbing = $state(false);

  const SEEK_DEBOUNCE_MS = 150;

  let hls: Hls | null = null;

  const progress = $derived(
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0,
  );

  function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  function cleanupAudio() {
    if (hls) {
      hls.destroy();
      hls = null;
    }

    if (audioEl) {
      audioEl.pause();
      audioEl.removeAttribute("src");
      audioEl.load();
    }

    playing = false;
    setPlayerPlaying(false);
    currentTime = 0;
    duration = 0;
  }

  $effect(() => {
    setPlayerMuted(muted);
  });

  $effect(() => {
    setPlayerVolume(volume);
  });

  function setupAudio(url: string, format: "mp3" | "hls") {
    if (!audioEl) {
      return;
    }

    cleanupAudio();

    if (format === "hls" && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(audioEl);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          error = "Playback failed.";
        }
      });
    } else if (
      format === "hls" &&
      audioEl.canPlayType("application/vnd.apple.mpegurl")
    ) {
      audioEl.src = url;
    } else {
      audioEl.src = url;
    }

    audioEl.volume = volume;
    audioEl.muted = muted;
  }

  function togglePlay() {
    if (!audioEl || loading || error) {
      return;
    }

    if (playing) {
      audioEl.pause();
    } else {
      void audioEl.play();
    }
  }

  function seekBy(seconds: number) {
    if (!audioEl || !duration || loading || error) {
      return;
    }

    const time = Math.min(
      duration,
      Math.max(0, audioEl.currentTime + seconds),
    );
    currentTime = time;
    audioEl.currentTime = time;
  }

  function nudgeVolume(step: number) {
    if (loading || error) {
      return;
    }

    const next = Math.min(1, Math.max(0, volume + step));
    volume = next;

    if (audioEl) {
      audioEl.volume = next;
      if (next > 0 && muted) {
        muted = false;
        audioEl.muted = false;
      }
    }
  }

  function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
      return true;
    }

    if (target.isContentEditable) {
      return true;
    }

    return Boolean(
      target.closest("input, textarea, select, [contenteditable='true']"),
    );
  }

  function getTimeAtClientX(clientX: number, element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }

  function previewSeek(clientX: number, element: HTMLElement) {
    if (!duration) {
      return;
    }

    currentTime = getTimeAtClientX(clientX, element);
  }

  function commitSeek(clientX: number, element: HTMLElement) {
    if (!audioEl || !duration) {
      return;
    }

    const time = getTimeAtClientX(clientX, element);
    currentTime = time;
    audioEl.currentTime = time;
  }

  function handleScrubStart(event: PointerEvent) {
    if (!audioEl || !duration || loading || error) {
      return;
    }

    const track = event.currentTarget as HTMLElement;
    event.preventDefault();

    let seekTimer: ReturnType<typeof setTimeout> | null = null;

    const clearSeekTimer = () => {
      if (seekTimer !== null) {
        clearTimeout(seekTimer);
        seekTimer = null;
      }
    };

    const scheduleSeek = (clientX: number) => {
      clearSeekTimer();
      seekTimer = setTimeout(() => {
        commitSeek(clientX, track);
        seekTimer = null;
      }, SEEK_DEBOUNCE_MS);
    };

    scrubbing = true;
    previewSeek(event.clientX, track);

    const onMove = (moveEvent: PointerEvent) => {
      previewSeek(moveEvent.clientX, track);
      scheduleSeek(moveEvent.clientX);
    };

    const onEnd = (endEvent: PointerEvent) => {
      clearSeekTimer();
      commitSeek(endEvent.clientX, track);
      scrubbing = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }

  function handleProgressKeydown(event: KeyboardEvent) {
    const step =
      event.key === "ArrowRight" ? 5 : event.key === "ArrowLeft" ? -5 : 0;
    if (step) {
      event.preventDefault();
      seekBy(step);
    }
  }

  function toggleMute() {
    if (!audioEl) {
      return;
    }

    muted = !muted;
    audioEl.muted = muted;
  }

  function setVolumeFromClientX(clientX: number, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const value = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));

    volume = value;

    if (audioEl) {
      audioEl.volume = value;
      if (value > 0 && muted) {
        muted = false;
        audioEl.muted = false;
      }
    }
  }

  function handleVolumeScrubStart(event: PointerEvent) {
    if (loading || error) {
      return;
    }

    const track = event.currentTarget as HTMLElement;
    event.preventDefault();

    volumeScrubbing = true;
    setVolumeFromClientX(event.clientX, track);

    const onMove = (moveEvent: PointerEvent) => {
      setVolumeFromClientX(moveEvent.clientX, track);
    };

    const onEnd = (endEvent: PointerEvent) => {
      setVolumeFromClientX(endEvent.clientX, track);
      volumeScrubbing = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }

  function handleVolumeKeydown(event: KeyboardEvent) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? 0.05
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? -0.05
          : 0;

    if (!step) {
      return;
    }

    event.preventDefault();
    nudgeVolume(step);
  }

  $effect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      switch (event.key) {
        case " ":
          event.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          event.preventDefault();
          seekBy(-5);
          break;
        case "ArrowRight":
          event.preventDefault();
          seekBy(5);
          break;
        case "ArrowUp":
          event.preventDefault();
          nudgeVolume(0.05);
          break;
        case "ArrowDown":
          event.preventDefault();
          nudgeVolume(-0.05);
          break;
      }
    };

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  $effect(() => {
    const id = trackId;
    loading = true;
    error = null;

    let cancelled = false;

    fetchStreamUrl(id)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setupAudio(data.url, data.format);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        error = err instanceof Error ? err.message : "Failed to load audio";
      })
      .finally(() => {
        if (!cancelled) {
          loading = false;
        }
      });

    return () => {
      cancelled = true;
      cleanupAudio();
    };
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="yt-player"
  style:height="{height}px"
  onkeydown={(event) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.closest("button, [role='slider']")
    ) {
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      togglePlay();
    }
  }}
>
  <button
    class="video-stage"
    type="button"
    aria-label={playing ? `Pause ${title}` : `Play ${title}`}
    disabled={loading || !!error}
    onclick={togglePlay}
    draggable="false"
  >
    {#if cover}
      <img class="cover" src={cover} alt="" draggable="false" />
    {/if}

    {#if loading}
      <div class="overlay status-overlay">Loading...</div>
    {:else if error}
      <div class="overlay status-overlay error">{error}</div>
    {:else if !playing}
      <span class="big-play" aria-hidden="true">
        <span class="big-play-icon"></span>
      </span>
    {/if}
  </button>

  <audio
    bind:this={audioEl}
    preload="metadata"
    onplay={() => {
      playing = true;
      setPlayerPlaying(true);
    }}
    onpause={() => {
      playing = false;
      setPlayerPlaying(false);
    }}
    ontimeupdate={() => {
      if (!scrubbing && audioEl) {
        currentTime = audioEl.currentTime;
      }
    }}
    onloadedmetadata={() => {
      if (audioEl) {
        duration = audioEl.duration;
      }
    }}
    ondurationchange={() => {
      if (audioEl) {
        duration = audioEl.duration;
      }
    }}
    onended={() => {
      playing = false;
      setPlayerPlaying(false);
    }}
    onerror={() => {
      error = "Playback failed.";
    }}
  ></audio>

  <div class="controls-bar">
    <button
      class="ctrl-btn play-btn"
      class:is-playing={playing}
      type="button"
      aria-label={playing ? "Pause" : "Play"}
      disabled={loading || !!error}
      onclick={togglePlay}
    >
      <span class="play-icon" aria-hidden="true"></span>
    </button>

    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="progress-wrap"
      class:scrubbing
      role="slider"
      tabindex="0"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      onpointerdown={handleScrubStart}
      onkeydown={handleProgressKeydown}
    >
      <div class="progress-track">
        <div class="progress-played" style:width="{progress}%"></div>
        <div class="progress-knob" style:left="{progress}%"></div>
      </div>
    </div>

    <span class="time-display">
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>

    <button
      class="ctrl-btn volume-btn"
      class:is-muted={muted || volume === 0}
      type="button"
      aria-label={muted ? "Unmute" : "Mute"}
      disabled={loading || !!error}
      onclick={toggleMute}
    >
      <span class="volume-icon" aria-hidden="true"></span>
    </button>

    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="volume-slider"
      class:scrubbing={volumeScrubbing}
      role="slider"
      tabindex="0"
      aria-label="Volume"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={muted ? 0 : volume}
      aria-disabled={loading || !!error}
      onpointerdown={handleVolumeScrubStart}
      onkeydown={handleVolumeKeydown}
    >
      <div class="volume-track">
        <div
          class="volume-filled"
          style:width="{(muted ? 0 : volume) * 100}%"
        ></div>
        <div
          class="volume-knob"
          style:left="{(muted ? 0 : volume) * 100}%"
        ></div>
      </div>
    </div>
  </div>
</div>

<style>
  .yt-player {
    width: 100%;
    background: #000;
    border: 1px solid #999;
    display: flex;
    flex-direction: column;
    font-family: Arial, sans-serif;
    outline: none;
  }

  .video-stage {
    flex: 1;
    position: relative;
    overflow: hidden;
    min-height: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    border: none;
    background: #000;
    cursor: pointer;
    color: inherit;
    font: inherit;
    text-align: left;
  }

  .video-stage:disabled {
    cursor: default;
  }

  .yt-player > audio {
    display: none;
  }

  .cover {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    -webkit-user-drag: none;
    user-select: none;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status-overlay {
    background: rgba(0, 0, 0, 0.55);
    color: #ccc;
    font-size: 13px;
  }

  .status-overlay.error {
    color: #f99;
    padding: 1rem;
    text-align: center;
  }

  .big-play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 58px;
    height: 42px;
    border: 2px solid #fff;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.55);
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .video-stage:hover:not(:disabled) .big-play {
    background: rgba(204, 0, 0, 0.75);
  }

  .big-play-icon {
    display: block;
    width: 0;
    height: 0;
    margin-left: 5px;
    border-style: solid;
    border-width: 9px 0 9px 16px;
    border-color: transparent transparent transparent #fff;
  }

  .controls-bar {
    height: 28px;
    background: linear-gradient(to bottom, #4a4a4a 0%, #2b2b2b 100%);
    border-top: 1px solid #111;
    display: flex;
    align-items: center;
    padding: 0 4px;
    gap: 4px;
    flex-shrink: 0;
  }

  .ctrl-btn {
    width: 22px;
    height: 22px;
    border: none;
    padding: 0;
    cursor: pointer;
    flex-shrink: 0;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ctrl-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .play-icon {
    display: block;
    position: relative;
    width: 10px;
    height: 12px;
  }

  .play-btn:not(.is-playing) .play-icon {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px 0 6px 10px;
    border-color: transparent transparent transparent var(--theme-gray);
  }

  .play-btn.is-playing .play-icon::before,
  .play-btn.is-playing .play-icon::after {
    content: "";
    position: absolute;
    top: 0;
    width: 3px;
    height: 12px;
    background: var(--theme-gray);
    border-radius: 1px;
  }

  .play-btn.is-playing .play-icon::before {
    left: 0;
  }

  .play-btn.is-playing .play-icon::after {
    right: 0;
  }

  .volume-icon {
    display: block;
    position: relative;
    width: 14px;
    height: 12px;
  }

  .volume-icon::before {
    content: "";
    position: absolute;
    left: 0;
    top: 3px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 3px 4px 3px 0;
    border-color: transparent var(--theme-gray) transparent transparent;
  }

  .volume-icon::after {
    content: "";
    position: absolute;
    left: 4px;
    top: 1px;
    width: 5px;
    height: 10px;
    background: var(--theme-gray);
    clip-path: polygon(0 35%, 100% 0, 100% 100%, 0 65%);
  }

  .volume-btn.is-muted .volume-icon::before {
    border-right-color: #999;
  }

  .volume-btn.is-muted .volume-icon::after {
    background: #999;
  }

  .volume-btn.is-muted::after {
    content: "";
    position: absolute;
    width: 12px;
    height: 2px;
    background: var(--theme-gray);
    transform: rotate(-45deg);
    border-radius: 1px;
  }

  .volume-btn {
    position: relative;
  }

  .progress-wrap {
    flex: 1;
    height: 18px;
    display: flex;
    align-items: center;
    cursor: pointer;
    min-width: 0;
    padding: 0 2px;
    touch-action: none;
    user-select: none;
  }

  .progress-wrap.scrubbing {
    cursor: grabbing;
  }

  .progress-wrap.scrubbing .progress-knob {
    background: #fff;
    border-color: #ccc;
  }

  .progress-track {
    position: relative;
    width: 100%;
    height: 8px;
    background: #666;
    border: 1px solid #222;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .progress-played {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(to bottom, #e33 0%, #c00 100%);
    pointer-events: none;
  }

  .progress-knob {
    position: absolute;
    top: 50%;
    width: 6px;
    height: 12px;
    margin-left: -3px;
    transform: translateY(-50%);
    background: var(--theme-gray);
    border: 1px solid #888;
    pointer-events: none;
  }

  .time-display {
    color: #ccc;
    font-size: 11px;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 72px;
    text-align: center;
    text-shadow: 0 1px 0 #000;
  }

  .volume-slider {
    width: 52px;
    height: 18px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    cursor: pointer;
    touch-action: none;
    user-select: none;
  }

  .volume-slider.scrubbing {
    cursor: grabbing;
  }

  .volume-slider[aria-disabled="true"] {
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
  }

  .volume-track {
    position: relative;
    width: 100%;
    height: 4px;
    background: #666;
    border: 1px solid #222;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.4);
  }

  .volume-filled {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: #c00;
    pointer-events: none;
  }

  .volume-knob {
    position: absolute;
    top: 50%;
    width: 10px;
    height: 10px;
    margin-left: -5px;
    margin-top: -5px;
    background: var(--theme-gray);
    border: 1px solid #888;
    border-radius: 1px;
    pointer-events: none;
  }

  .volume-slider.scrubbing .volume-knob {
    background: #fff;
    border-color: #ccc;
  }

  .speed-btn {
    font-family: Arial, sans-serif;
    font-size: 10px;
    font-weight: bold;
    color: #ccc;
    background: linear-gradient(to bottom, #4a4a4a 0%, #333 100%);
    border: 1px solid #555;
    border-radius: 2px;
    padding: 2px 5px;
    cursor: pointer;
    flex-shrink: 0;
    min-width: 30px;
    line-height: 1;
    text-shadow: 0 1px 0 #000;
  }

  .speed-btn:hover:not(:disabled) {
    color: #fff;
    border-color: #888;
  }

  .speed-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  audio {
    display: none;
  }
</style>
