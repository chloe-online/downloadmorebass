<script lang="ts">
  import { onMount } from "svelte";
  import Song from "../components/Song.svelte";
  import SongSkeleton from "../components/SongSkeleton.svelte";
  import ArtistProfileBar from "../components/ArtistProfileBar.svelte";
  import ArtistProfileBarSkeleton from "../components/ArtistProfileBarSkeleton.svelte";
  import SiteHeader from "../components/SiteHeader.svelte";
  import SiteFooter from "../components/SiteFooter.svelte";
  import { getTracks } from "../lib/tracks";
  import type { ArtistProfile, Track } from "../../shared/types";

  let tracks: Track[] = $state<Track[]>([]);
  let artistProfile = $state<ArtistProfile | undefined>();
  let artistUsername = $state<string>("");
  let tracksLoading = $state(true);
  let tracksError = $state<string | null>(null);
  let soundEnabled = $state(false);
  let audioContext = $state<AudioContext | null>(null);
  let currentOscillator = $state<OscillatorNode | null>(null);

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
        artistProfile = data.user;
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
  <SiteHeader />

  <div class="container">
    <div class="home-layout">
      <div class="tracks-column">
        <div class="playlist">
          <div class="featured-songs">
            <h2>Featured songs</h2>
          </div>
          <ul>
            {#if tracksError}
              <li><p class="error">{tracksError}</p></li>
            {:else if tracksLoading}
              {#each Array(5) as _, i (i)}
                <li><SongSkeleton /></li>
              {/each}
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

      <aside class="artist-column">
        {#if tracksLoading}
          <ArtistProfileBarSkeleton />
        {:else if artistProfile}
          <ArtistProfileBar profile={artistProfile} />
        {/if}
      </aside>
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

  .container {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    box-sizing: border-box;
  }

  .home-layout {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    width: 100%;
    max-width: var(--layout-max);
    margin: 0 auto;
  }

  .tracks-column {
    width: 100%;
    max-width: var(--song-max);
    flex-shrink: 0;
    min-width: 0;
  }

  .artist-column {
    flex: 1;
    min-width: 0;
    position: sticky;
    top: 1rem;
  }

  .playlist {
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: left;
    width: 100%;
  }

  .featured-songs {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
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

  .featured-subtitle {
    height: 12px;
    width: 180px;
    margin-top: 2px;
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

  @media (max-width: 768px) {
    .container {
      padding: 0.5rem;
    }

    .home-layout {
      flex-direction: column;
    }

    .tracks-column {
      max-width: 100%;
    }

    .artist-column {
      position: static;
      width: 100%;
    }
  }
</style>
