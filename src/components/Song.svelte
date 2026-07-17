<script lang="ts">
  import { navigate, listenPath, homePath } from "../lib/router";
  import { trackSlug } from "../lib/tracks";
  import ExpandableText from "./ExpandableText.svelte";

  let {
    cover,
    title,
    description,
    artist,
    artistUrl,
    url,
    duration,
    stars,
    listens,
    genre = "",
    isNew = false,
  }: {
    cover: string;
    title: string;
    description: string;
    artist: string;
    artistUrl: string;
    url: string;
    duration: string;
    stars: number;
    listens: number;
    genre?: string;
    isNew?: boolean;
  } = $props();

  const slug = $derived(trackSlug(url));
  const genreLabel = $derived(genre.trim());

  function openTrack(event: MouseEvent) {
    event.preventDefault();
    navigate(listenPath(slug));
  }

  function openGenre(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    navigate(homePath(genreLabel));
    window.scrollTo(0, 0);
  }
</script>

<article class="song-card">
  <a class="cover" href={listenPath(slug)} onclick={openTrack}>
    <img src={cover} alt={title} />
    {#if isNew}
      <span class="new-badge">NEW</span>
    {/if}
  </a>

  <div class="song-info">
    <div class="song-info-content">
      <a class="title-link" href={listenPath(slug)} onclick={openTrack}>
        <h2 class="song-title">
          {title}
        </h2>
      </a>
      <ExpandableText text={description} />
    </div>
    <p class="time">
      <span class="header">Time:</span> <b>{duration}</b>
    </p>
  </div>

  <div class="song-details">
    <p>
      <span class="header">From:</span>
      <a href={artistUrl} target="_blank" rel="noreferrer">{artist}</a>
      <span class="header">Listens:</span>
      {listens}
      <span class="stars">
        {#each Array(5) as _, i}
          <span style="color: {i < stars ? 'currentColor' : '#ccc'}">★</span>
        {/each}
      </span>
    </p>
    {#if genreLabel}
      <p class="genre">
        More in
        <a class="genre-link" href={homePath(genreLabel)} onclick={openGenre}
          >{genreLabel}</a
        >
      </p>
    {/if}
  </div>
</article>

<style>
  .song-card {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 8px;
  }

  .cover {
    position: relative;
    flex-shrink: 0;
  }

  .new-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: #ff0000;
    color: #ffffff;
    padding: 2px 6px;
    border-radius: 2px;
    font-size: 10px;
    font-weight: bold;
    z-index: 10;
    pointer-events: none;
  }

  .song-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .song-info {
    display: flex;
    flex-direction: column;
    align-items: start;
    flex: 1;
    min-width: 0;
    gap: 0px;
  }

  .song-info-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0px;
    width: 100%;
  }

  .header {
    color: grey;
  }

  .time {
    margin-top: auto;
    margin-bottom: 2px;
  }

  .title-link {
    display: block;
    max-width: 100%;
    min-width: 0;
    text-decoration: none;
    color: #03c;
  }

  .title-link:hover h2 {
    text-decoration: underline;
  }

  h2 {
    font-size: 14px;
    margin: 0;
  }

  p {
    font-size: 12px;
    text-align: left;
  }

  .song-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 120px;
    margin-left: 5px;
    padding-left: 5px;
    gap: 0px;
  }
  .song-details p {
    margin: 0px;
    padding: 0px;
  }

  .song-details .genre {
    margin-top: auto;
    margin-bottom: 2px;
    align-self: stretch;
    text-align: left;
  }

  .genre-link {
    font-family: Arial, sans-serif;
    font-size: 11px;
    color: #03c;
    text-decoration: underline;
  }

  .genre-link:hover {
    text-decoration: underline;
  }

  .stars {
    color: red;
    font-size: 18px;
    line-height: 16px;
  }

  img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 1px;
    border: 1px solid #000;
  }
</style>
