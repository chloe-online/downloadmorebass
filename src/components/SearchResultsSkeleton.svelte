<script lang="ts">
  import SongSkeleton from "./SongSkeleton.svelte";

  const SONG_COUNT = 10;
</script>

<div class="playlist" aria-hidden="true">
  <div class="search-header">
    <div class="skeleton heading"></div>
    <div class="search-subtitle">
      <div class="search-subtitle-content">
        <div class="skeleton meta"></div>
        <div class="skeleton meta short"></div>
      </div>
      <div class="sort-dropdown">
        <div class="skeleton sort-label"></div>
        <div class="skeleton sort-select"></div>
      </div>
    </div>
  </div>

  <ul>
    {#each Array(SONG_COUNT) as _, i (i)}
      <li><SongSkeleton /></li>
    {/each}
  </ul>

  <div class="back-to-top-container">
    <div class="skeleton back-to-top"></div>
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

  .heading {
    height: calc(19px * 1.5);
    width: 8rem;
    margin: 0;
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

  .search-subtitle-content {
    min-width: 0;
  }

  .meta {
    height: calc(12px * 1.2);
    width: 11rem;
    margin: 0 0 5px;
  }

  .meta.short {
    width: 5rem;
  }

  .sort-dropdown {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    margin-left: auto;
    margin-bottom: 5px;
  }

  .sort-label {
    height: calc(12px * 1.2);
    width: 2.75rem;
  }

  .sort-select {
    margin: 0;
    padding: 2px 4px;
    border: 1px solid #999;
    border-radius: 2px;
    font-size: 12px;
    line-height: 1.2;
    height: 1.2em;
    width: 6.5rem;
    box-sizing: content-box;
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

  .back-to-top-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .back-to-top {
    height: 1.5em;
    width: 5.5em;
  }
</style>
