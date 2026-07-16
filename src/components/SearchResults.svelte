<script lang="ts">
  import Song from "./Song.svelte";
  import { homePath, navigate } from "../lib/router";
  import type { Track } from "../../shared/types";

  type SearchSortMode = "listened" | "liked";

  let {
    tracks,
    query,
  }: {
    tracks: Track[];
    query: string;
  } = $props();

  let sortMode = $state<SearchSortMode>("listened");

  const results = $derived.by(() => {
    const q = query.toLowerCase();
    const filtered = tracks.filter((track) => {
      const haystack =
        `${track.title} ${track.artist} ${track.description}`.toLowerCase();
      return haystack.includes(q);
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "liked") {
        return b.likes - a.likes || b.listens - a.listens;
      }
      return b.listens - a.listens;
    });
  });

  function clearSearch(event: MouseEvent) {
    event.preventDefault();
    navigate(homePath());
  }

  function goToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>

<div class="playlist">
  <div class="search-header">
    <h2>Search results</h2>
    <div class="search-subtitle">
      <div class="search-subtitle-content">
        <p class="meta">
          Results for <strong>{query}</strong>
          ({results.length})
        </p>
        <p class="meta">
          <a href="/" onclick={clearSearch}>Clear search</a>
        </p>
      </div>
      <label class="sort-dropdown">
        <span class="sort-dropdown-label">Sort by</span>
        <select
          class="sort-select"
          aria-label="Sort search results"
          bind:value={sortMode}
        >
          <option value="listened">Most listened</option>
          <option value="liked">Most liked</option>
        </select>
      </label>
    </div>
  </div>

  <ul>
    {#if results.length === 0}
      <li class="search-empty">
        No songs matched your search.
        <a href="/" onclick={clearSearch}>Back to featured songs</a>
      </li>
    {:else}
      {#each results as track (track.url)}
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
    <button class="back-to-top-button" onclick={goToTop}>Back to top</button>
  </div>
</div>

<style>
  .playlist {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .search-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .search-header h2 {
    margin: 0;
    font-size: 19px;
  }

  .search-subtitle {
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

  .meta {
    margin: 0 0 5px;
    font-size: 12px;
    line-height: 1.2;
    min-width: 0;
  }

  .sort-dropdown {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    margin-left: auto;
    margin-bottom: 5px;
  }

  .sort-dropdown-label {
    font-size: 12px;
    line-height: 1.2;
    color: #333;
    white-space: nowrap;
  }

  .sort-select {
    appearance: auto;
    margin: 0;
    padding: 2px 4px;
    border: 1px solid #999;
    border-radius: 2px;
    background: #fff;
    color: #000;
    font: inherit;
    font-size: 12px;
    line-height: 1.2;
    cursor: pointer;
  }

  .sort-select:focus {
    outline: 1px solid #03c;
    border-color: #03c;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    padding-top: 8px;
    padding-bottom: 8px;
  }

  li:not(:last-child) {
    border-bottom: 1px dotted #bbb;
  }

  .search-empty {
    padding: 1rem 0.25rem;
    font-size: 13px;
    color: #333;
    border: none !important;
  }

  .search-empty a {
    margin-left: 0.25rem;
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
