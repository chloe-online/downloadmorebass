<script lang="ts">
  import SongSkeleton from "./SongSkeleton.svelte";

  const SONG_COUNT = 10;
</script>

<div class="playlist" aria-hidden="true">
  <div class="featured-songs">
    <div class="skeleton heading"></div>
    <div class="featured-subtitle">
      <div class="featured-subtitle-content">
        <div class="skeleton curator"></div>
        <div class="skeleton curator short"></div>
      </div>
      <div class="sort-tabs">
        <div class="skeleton sort-tab"></div>
        <div class="skeleton sort-tab mid"></div>
        <div class="skeleton sort-tab wide"></div>
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
    align-items: left;
    justify-content: left;
    width: 100%;
  }

  .featured-songs {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .heading {
    height: calc(19px * 1.5);
    width: 8.5rem;
    margin: 0;
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

  .featured-subtitle-content {
    min-width: 0;
  }

  .curator {
    height: calc(12px * 1.2);
    width: 12rem;
    margin: 0 0 5px;
  }

  .curator.short {
    width: 7.5rem;
  }

  .sort-tabs {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    flex-shrink: 0;
    margin-left: auto;
  }

  .sort-tab {
    padding: 4px 10px 5px;
    border: 1px solid #999;
    border-bottom: none;
    border-radius: 3px 3px 0 0;
    font-size: 12px;
    line-height: 1.2;
    height: 1.2em;
    width: 3.25rem;
    box-sizing: content-box;
    position: relative;
    bottom: -1px;
  }

  .sort-tab.mid {
    width: 2.85rem;
  }

  .sort-tab.wide {
    width: 5.1rem;
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
