export const playerPlayback = $state({
  playing: false,
  muted: false,
  volume: 1,
  playId: 0,
});

export function setPlayerPlaying(playing: boolean) {
  playerPlayback.playing = playing;
  if (playing && isPlayerAudible()) {
    playerPlayback.playId += 1;
  }
}

export function setPlayerMuted(muted: boolean) {
  const wasAudible = isPlayerAudible();
  playerPlayback.muted = muted;
  if (playerPlayback.playing && !wasAudible && isPlayerAudible()) {
    playerPlayback.playId += 1;
  }
}

export function setPlayerVolume(volume: number) {
  const wasAudible = isPlayerAudible();
  playerPlayback.volume = volume;
  if (playerPlayback.playing && !wasAudible && isPlayerAudible()) {
    playerPlayback.playId += 1;
  }
}

export function isPlayerAudible() {
  return (
    playerPlayback.playing &&
    !playerPlayback.muted &&
    playerPlayback.volume > 0
  );
}

export function resetPlayerPlayback() {
  playerPlayback.playing = false;
  playerPlayback.muted = false;
  playerPlayback.volume = 1;
}
