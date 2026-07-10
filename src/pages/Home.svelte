<script lang="ts">
  import { onMount } from "svelte";
  import Song from "../components/Song.svelte";
  import SiteHeader from "../components/SiteHeader.svelte";
  import SiteFooter from "../components/SiteFooter.svelte";
  import { getTracks } from "../lib/tracks";
  import type { Track } from "../../shared/types";

  let tracks: Track[] = [];
  let artistUsername = "chloemusic8008";
  let tracksLoading = true;
  let tracksError: string | null = null;
  let soundEnabled = false;
  let audioContext: AudioContext | null = null;
  let currentOscillator: OscillatorNode | null = null;

  function createBassTone() {
    if (!audioContext || !soundEnabled) {
      return;
    }

    if (currentOscillator) {
      currentOscillator.stop();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
    oscillator.type = "triangle";

    const pumpFrequency = 2;
    const now = audioContext.currentTime;

    gainNode.gain.setValueAtTime(0, now);

    for (let i = 0; i < 100; i++) {
      const startTime = now + i / pumpFrequency;
      const peakTime = startTime + 0.25 / pumpFrequency;
      const endTime = startTime + 1 / pumpFrequency;

      gainNode.gain.linearRampToValueAtTime(1, peakTime);
      gainNode.gain.linearRampToValueAtTime(0, endTime);
    }

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    currentOscillator = oscillator;
    oscillator.start(audioContext.currentTime);
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;

    if (!soundEnabled && currentOscillator) {
      currentOscillator.stop();
      currentOscillator = null;
    } else if (soundEnabled && audioContext) {
      createBassTone();
    }
  }

  async function handleUserInteraction() {
    const randomBassFile = Math.floor(Math.random() * 3) + 1;
    const bassFile = await fetch(`/bass/${randomBassFile}.wav`);
    const bassFileBlob = await bassFile.blob();
    const bassFileUrl = URL.createObjectURL(bassFileBlob);
    const a = document.createElement("a");
    a.href = bassFileUrl;
    a.download = `bass${randomBassFile}.wav`;
    a.click();
  }

  onMount(() => {
    try {
      audioContext = new AudioContext();
      createBassTone();
    } catch (error) {
      console.log("Audio context creation failed:", error);
    }

    getTracks()
      .then((data) => {
        tracks = data.tracks;
        artistUsername = data.user.username;
      })
      .catch((error: unknown) => {
        tracksError =
          error instanceof Error ? error.message : "Failed to load tracks";
      })
      .finally(() => {
        tracksLoading = false;
      });
  });
</script>

<main>
  <SiteHeader
    showSoundToggle
    {soundEnabled}
    onToggleSound={toggleSound}
  />

  <div class="download-button">
    <button onclick={handleUserInteraction}>DOWNLOAD</button>
    <p>Click the button to download bass to your computer.</p>
  </div>

  <div class="container">
    <div class="playlist">
      <div class="featured-songs">
        <h2>Featured songs</h2>
        <p>Featured songs selected by {artistUsername}</p>
      </div>
      <ul>
        {#if tracksLoading}
          <li><p>Loading tracks...</p></li>
        {:else if tracksError}
          <li><p class="error">{tracksError}</p></li>
        {:else if tracks.length === 0}
          <li><p>No tracks found.</p></li>
        {:else}
          {#each tracks as track (track.url)}
            <li>
              <Song
                cover={track.cover}
                title={track.title}
                description={track.description}
                duration={track.duration}
                artist={track.artist}
                listens={track.listens}
                artistUrl={track.artistUrl}
                url={track.url}
                stars={track.stars}
                isNew={track.isNew}
              />
            </li>
          {/each}
        {/if}
        <li>
          <p>
            Need more bass? <a
              href="https://open.spotify.com/playlist/1N3ktLy4HFlzdd5ULgyqJD?si=3feafcc9ac124751"
              >click here</a
            >
          </p>
        </li>
      </ul>
    </div>
  </div>

  <SiteFooter />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    color: #000;
    padding-bottom: 4rem;
  }

  .download-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .playlist {
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: left;
    width: 100%;
    max-width: 960px;
  }

  .featured-songs {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    border-top: 1px solid #bbb;
    border-bottom: 1px solid #bbb;
    margin-bottom: 20px;
  }

  .featured-songs h2 {
    margin: 0;
    font-size: 19px;
  }

  .featured-songs p {
    margin: 0;
    font-size: 12px;
  }

  .error {
    color: #b00020;
  }

  .playlist ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .playlist ul li {
    padding: 8px;
  }

  .playlist ul li:not(:last-child) {
    border-bottom: 1px dotted #bbb;
  }

  .playlist ul li:not(:first-child) {
    border-top: 1px dotted #bbb;
  }

  button {
    font-family: "Arial", sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #333;
    background: transparent
      url(https://web.archive.org/web/20080416013730im_/http://s.ytimg.com/yt/img/master-vfl37165.gif)
      no-repeat scroll 0 -137px;
    border: 1px solid #d3d3d3;
    border-radius: 3px;
    cursor: pointer;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  @media (max-width: 768px) {
    .download-button {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }

    .container {
      padding: 0.5rem;
    }
  }
</style>
