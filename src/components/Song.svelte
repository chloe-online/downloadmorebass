<script lang="ts">
  import { navigate, listenPath } from "../lib/router";
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
    isNew?: boolean;
  } = $props();

  const slug = $derived(trackSlug(url));

  function openTrack(event: MouseEvent) {
    event.preventDefault();
    navigate(listenPath(slug));
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
    <a class="title-link" href={listenPath(slug)} onclick={openTrack}>
      <h2 class="song-title">
        {title}
      </h2>
    </a>
    <ExpandableText text={description} />
  </div>

  <div class="artist-details">
    <p>
      From: <a href={artistUrl} target="_blank" rel="noreferrer">{artist}</a>
    </p>
    <p>
      Listens: {listens}
      {#if listens == 69}<invisible>nice</invisible>{/if}
    </p>
    <div class="stars">
      {#each Array(5) as _, i}
        <span style="color: {i < stars ? 'currentColor' : '#ccc'}">★</span>
      {/each}
    </div>
    <p><b>{duration}</b></p>
  </div>
</article>

<style>
  .song-card {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0.5rem;
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
    margin: 5px;
  }

  p {
    font-size: 12px;
    margin: 5px;
    text-align: left;
  }

  p invisible {
    color: #fff;
  }

  p invisible:hover {
    color: #000;
  }

  .artist-details {
    display: flex;
    flex-direction: column;
    align-items: start;
    margin-left: 5px;
    padding-left: 5px;
    border-left: 1px solid #bbb;
    flex-shrink: 0;
    width: 120px;
  }

  .artist-details p {
    margin: 5px;
    padding: 0;
    line-height: 14px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 1px;
    border: 1px solid #000;
  }

  .stars {
    color: red;
    margin: 5px;
  }
</style>
