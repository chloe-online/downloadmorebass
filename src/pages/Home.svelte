<script lang="ts">
  import { onMount } from "svelte";
  import Song from "../components/Song.svelte";
  import SongSkeleton from "../components/SongSkeleton.svelte";
  import SiteMainBar from "../components/SiteMainBar.svelte";
  import SiteHeader from "../components/SiteHeader.svelte";
  import SiteFooter from "../components/SiteFooter.svelte";
  import { getTracks } from "../lib/tracks";
  import type { ArtistProfile, Track } from "../../shared/types";

  type SortMode = "featured" | "popular" | "listened";

  const ERROR_REVEAL_DELAY_MS = 400;

  let tracks: Track[] = $state<Track[]>([]);
  let artistProfile = $state<ArtistProfile | undefined>();
  let artistUsername = $state<string>("");
  let tracksLoading = $state(true);
  let tracksError = $state<string | null>(null);
  let showTracksError = $state(false);
  let sortMode = $state<SortMode>("featured");
  let soundEnabled = $state(false);
  let audioContext = $state<AudioContext | null>(null);
  let currentOscillator = $state<OscillatorNode | null>(null);
  let errorRevealTimeout: ReturnType<typeof setTimeout> | null = null;

  function clearErrorReveal() {
    if (errorRevealTimeout !== null) {
      clearTimeout(errorRevealTimeout);
      errorRevealTimeout = null;
    }
    showTracksError = false;
  }

  function scheduleErrorReveal() {
    clearErrorReveal();
    errorRevealTimeout = setTimeout(() => {
      errorRevealTimeout = null;
      tracksLoading = false;
      showTracksError = true;
    }, ERROR_REVEAL_DELAY_MS);
  }

  const sortedTracks = $derived(
    [...tracks].sort((a, b) => {
      if (sortMode === "popular") {
        return b.stars - a.stars || b.listens - a.listens;
      }
      if (sortMode === "listened") {
        return b.listens - a.listens;
      }
      // featured: newest first
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }),
  );

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

  function goToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function loadTracks() {
    tracksLoading = true;
    tracksError = null;
    clearErrorReveal();

    return getTracks()
      .then((data) => {
        tracks = data.tracks;
        artistProfile = data.user;
        artistUsername = data.user.username;

        if (tracks.length === 0) {
          tracksError = "No tracks available";
          scheduleErrorReveal();
          return;
        }

        tracksLoading = false;
      })
      .catch((error: unknown) => {
        tracksError =
          error instanceof Error ? error.message : "Failed to load tracks";
        scheduleErrorReveal();
      });
  }

  onMount(() => {
    try {
      audioContext = new AudioContext();
      createBassTone();
    } catch (error) {
      console.log("Audio context creation failed:", error);
    }

    loadTracks();

    return () => {
      clearErrorReveal();
    };
  });
</script>

<main>
  <SiteHeader />

  <div class="container">
    <div class="home-layout">
      <div class="tracks-column">
        {#if showTracksError}
          <div class="tracks-error" role="alert">
            <h2 class="tracks-error-title">Oh uh, something went wrong.</h2>
            <p class="tracks-error-message">
              I'm sorry, but an error occurred while loading the tracks. The
              playlist should be back soon, please try again in a bit.
            </p>
            <div class="tracks-error-actions">
              <button
                type="button"
                class="tracks-error-retry"
                onclick={() => loadTracks()}
              >
                Try again
              </button>
              <p class="tracks-error-contact">
                Still broken?
                <a
                  href="https://instagram.com/chloemusic8008"
                  target="_blank"
                  rel="noreferrer">Tell Chloe to fix it</a
                >
              </p>
            </div>
          </div>
        {:else}
          <div class="playlist">
            <div class="featured-songs">
              <h2>Featured songs</h2>
              <div class="featured-subtitle">
                <div class="featured-subtitle-content">
                  <p class="curator">Featured songs selected by:</p>
                  <p class="curator">
                    <a
                      href="https://instagram.com/chloemusic8008"
                      target="_blank"
                      rel="noreferrer">@ChloeMusic8008</a
                    >
                  </p>
                </div>
                <div class="sort-tabs" role="tablist" aria-label="Sort songs">
                  <button
                    type="button"
                    role="tab"
                    class="sort-tab"
                    class:active={sortMode === "featured"}
                    aria-selected={sortMode === "featured"}
                    onclick={() => (sortMode = "featured")}
                  >
                    Featured
                  </button>
                  <button
                    type="button"
                    role="tab"
                    class="sort-tab"
                    class:active={sortMode === "popular"}
                    aria-selected={sortMode === "popular"}
                    onclick={() => (sortMode = "popular")}
                  >
                    Popular
                  </button>
                  <button
                    type="button"
                    role="tab"
                    class="sort-tab"
                    class:active={sortMode === "listened"}
                    aria-selected={sortMode === "listened"}
                    onclick={() => (sortMode = "listened")}
                  >
                    Most listened
                  </button>
                </div>
              </div>
            </div>
            <ul>
              {#if tracksLoading}
                {#each Array(10) as _, i (i)}
                  <li><SongSkeleton /></li>
                {/each}
              {:else}
                {#each sortedTracks as track (track.url)}
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
            </ul>
            <div class="back-to-top-container">
              <button class="back-to-top-button" onclick={goToTop}
                >Back to top</button
              >
            </div>
          </div>
        {/if}
      </div>

      <aside class="site-sidebar">
        <SiteMainBar />
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
    flex: 1;
    min-height: 100%;
  }

  .container {
    display: flex;
    flex-direction: column;
    flex: 1 0 auto;
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

  .site-sidebar {
    flex: 1;
    min-width: 0;
    width: 100%;
    display: flex;
    /* position: sticky; */
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
  }

  .featured-songs h2 {
    margin: 0;
    font-size: 19px;
  }

  .featured-subtitle {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
    background-color: #ddd;
    width: 100%;
    box-sizing: border-box;
    padding: 6px 6px 0;
    border-top: 1px solid #999;
    border-bottom: 1px solid #999;
  }

  .curator {
    margin: 0 0 5px;
    font-size: 12px;
    line-height: 1.2;
    min-width: 0;
  }

  .sort-tabs {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    flex-shrink: 0;
    margin-left: auto;
  }

  .sort-tab {
    appearance: none;
    margin: 0;
    padding: 4px 10px 5px;
    border: 1px solid #999;
    border-bottom: none;
    background: #eee;
    color: #03c;
    font: inherit;
    font-size: 12px;
    line-height: 1.2;
    cursor: pointer;
    text-decoration: underline;
    border-radius: 3px 3px 0 0;
    position: relative;
    bottom: -1px;
  }

  .sort-tab:hover {
    background: #f5f5f5;
  }

  .sort-tab.active {
    background: #fff;
    color: #000;
    font-weight: bold;
    text-decoration: none;
    cursor: default;
    z-index: 1;
  }

  .tracks-error {
    border: 1px solid #999;
    background: #f9f9f9;
    padding: 1.25rem 1rem;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
  }

  .tracks-error-title {
    margin: 0 0 0.75rem;
    font-size: 19px;
    font-weight: bold;
    color: #333;
  }

  .tracks-error-message {
    margin: 0 0 0.5rem;
    font-size: 13px;
    line-height: 1.4;
    color: #333;
  }

  .tracks-error-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #ddd;
  }

  .tracks-error-retry {
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #03c;
    text-decoration: underline;
    cursor: pointer;
    background: #eee;
    border: 1px solid #999;
    border-radius: 3px;
    padding: 6px 14px;
    line-height: 1.2;
  }

  .tracks-error-retry:hover {
    background: #f5f5f5;
    text-decoration: none;
  }

  .tracks-error-contact {
    margin: 0;
    font-size: 12px;
    color: #666;
  }

  .playlist ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .playlist ul li {
    padding-top: 8px;
    padding-bottom: 2px; /* accounts for 2px border-bottom on song element  this shoulddddd be fixed but mehhhh */
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

    .site-sidebar {
      position: static;
      width: 100%;
      flex: 1 1 100%;
    }
  }

  .back-to-top-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .back-to-top-button {
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #03c;
    text-decoration: underline;
    cursor: pointer;
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    font-size: inherit;
  }

  .back-to-top-button:hover {
    text-decoration: none;
  }

  .back-to-top-button:active {
    text-decoration: underline;
  }
</style>
