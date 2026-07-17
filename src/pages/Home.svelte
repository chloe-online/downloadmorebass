<script lang="ts">
  import { onMount } from "svelte";
  import Song from "../components/Song.svelte";
  import SearchResults from "../components/SearchResults.svelte";
  import HomePageSkeleton from "../components/HomePageSkeleton.svelte";
  import SiteMainBar from "../components/SiteMainBar.svelte";
  import FeaturedArtistSection from "../components/FeaturedArtistSection.svelte";
  import PopularTagsSection from "../components/PopularTagsSection.svelte";
  import SiteHeader from "../components/SiteHeader.svelte";
  import SiteFooter from "../components/SiteFooter.svelte";
  import ErrorPanel from "../components/ErrorPanel.svelte";
  import { getTracks } from "../lib/tracks";
  import { getLocation, subscribe, type Location } from "../lib/router";
  import type { ArtistProfile, Track } from "../../shared/types";

  type SortMode = "featured" | "popular" | "listened";

  const ERROR_REVEAL_DELAY_MS = 400;

  let location = $state<Location>(getLocation());
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

  const searchQuery = $derived(location.q);

  const sortedTracks = $derived(
    [...tracks].sort((a, b) => {
      if (sortMode === "popular") {
        return b.stars - a.stars || b.listens - a.listens;
      }
      if (sortMode === "listened") {
        return b.listens - a.listens;
      }
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
    const unsubscribe = subscribe((next) => {
      location = next;
    });

    try {
      audioContext = new AudioContext();
      createBassTone();
    } catch (error) {
      console.log("Audio context creation failed:", error);
    }

    loadTracks();

    return () => {
      unsubscribe();
      clearErrorReveal();
    };
  });
</script>

<main>
  <SiteHeader />

  <div class="container">
    {#if tracksLoading}
      <HomePageSkeleton searchQuery={searchQuery || null} />
    {:else}
      <div class="home-layout">
        <div class="tracks-column">
          {#if showTracksError}
            <ErrorPanel
              title="Oh uh, something went wrong."
              message="I'm sorry, but an error occurred while loading the tracks. The playlist should be back soon, please try again in a bit."
              actionLabel="Try again"
              onAction={() => loadTracks()}
            />
          {:else if searchQuery}
            <SearchResults {tracks} query={searchQuery} />
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
                      genre={track.genre}
                      isNew={track.isNew}
                    />
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>

        <aside class="site-sidebar" class:has-tags={tracks.length > 0}>
          <div class="sidebar-primary">
            <SiteMainBar />
            {#if artistProfile}
              <FeaturedArtistSection artist={artistProfile} />
            {/if}
          </div>
          {#if tracks.length > 0}
            <div class="sidebar-tags">
              <PopularTagsSection {tracks} />
            </div>
          {/if}
        </aside>

        {#if !showTracksError}
          <div class="back-to-top-container">
            <button class="back-to-top-button" onclick={goToTop}
              >Back to top</button
            >
          </div>
        {/if}
      </div>
    {/if}
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
    display: grid;
    grid-template-columns: minmax(0, var(--song-max)) minmax(0, 1fr);
    grid-template-areas:
      "tracks sidebar"
      "back .";
    column-gap: 1rem;
    row-gap: 0;
    align-items: start;
    width: 100%;
    max-width: var(--layout-max);
    margin: 0 auto;
  }

  .tracks-column {
    grid-area: tracks;
    width: 100%;
    max-width: var(--song-max);
    min-width: 0;
  }

  .site-sidebar {
    grid-area: sidebar;
    min-width: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    /* position: sticky; */
    top: 1rem;
  }

  .sidebar-primary {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
  }

  .sidebar-tags {
    min-width: 0;
  }

  h2 {
    margin: 0;
    font-size: 19px;
    font-weight: bold;
    color: #333;
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

  .featured-subtitle {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
    background-color: var(--theme-gray);
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

  .playlist ul {
    list-style: none;
    margin: 0 0 8px;
    padding: 0;
  }

  .playlist ul li {
    padding-top: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dotted #bbb;
  }

  @media (max-width: 768px) {
    .container {
      padding: 0.5rem;
    }

    .home-layout {
      grid-template-columns: 1fr;
      grid-template-areas:
        "tracks"
        "sidebar"
        "back";
      row-gap: 1rem;
    }

    .tracks-column {
      max-width: 100%;
    }

    .site-sidebar.has-tags {
      position: static;
      width: 100%;
      flex-direction: row;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .site-sidebar.has-tags .sidebar-primary {
      flex: 0 1 auto;
      width: max-content;
      max-width: 48%;
      gap: 0.5rem;
    }

    .site-sidebar.has-tags .sidebar-tags {
      flex: 1 1 0;
    }
  }

  .back-to-top-container {
    grid-area: back;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .back-to-top-button {
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: normal;
    line-height: 1.2;
    color: #03c;
    text-decoration: underline;
    cursor: pointer;
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
  }

  .back-to-top-button:hover {
    text-decoration: none;
  }

  .back-to-top-button:active {
    text-decoration: underline;
  }
</style>
