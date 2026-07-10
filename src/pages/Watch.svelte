<script lang="ts">
  import SoundCloudPlayer from "../components/SoundCloudPlayer.svelte";
  import SiteHeader from "../components/SiteHeader.svelte";
  import SiteFooter from "../components/SiteFooter.svelte";
  import { navigate, listenPath } from "../lib/router";
  import { findTrackBySlug, getTracks, trackSlug } from "../lib/tracks";
  import type { Track } from "../../shared/types";

  let { slug }: { slug: string | null } = $props();

  let track = $state<Track | undefined>();
  let relatedTracks = $state<Track[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  function goHome(event: MouseEvent) {
    event.preventDefault();
    navigate("/");
  }

  function openTrack(event: MouseEvent, relatedSlug: string) {
    event.preventDefault();
    navigate(listenPath(relatedSlug));
  }

  $effect(() => {
    const currentSlug = slug;
    loading = true;
    error = null;
    track = undefined;
    relatedTracks = [];

    if (!currentSlug) {
      error = "No track selected.";
      loading = false;
      return;
    }

    let cancelled = false;

    getTracks()
      .then((data) => {
        if (cancelled) return;

        track = findTrackBySlug(currentSlug);
        relatedTracks = data.tracks.filter(
          (item) => trackSlug(item.url) !== currentSlug,
        );

        if (!track) {
          error = "Track not found.";
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        error = err instanceof Error ? err.message : "Failed to load track";
      })
      .finally(() => {
        if (!cancelled) {
          loading = false;
        }
      });

    return () => {
      cancelled = true;
    };
  });
</script>

<main>
  <SiteHeader />

  <div class="watch-page">
    <div class="nav-row">
      <button class="yt-button" onclick={goHome}
        >« Back to featured songs</button
      >
    </div>

    {#if loading}
      <p class="status">Loading track...</p>
    {:else if error || !track}
      <p class="status error">{error ?? "Track not found."}</p>
      <button class="yt-button" onclick={goHome}>Go home</button>
    {:else}
      <div class="watch-layout">
        <section class="primary">
          <div class="player-shell">
            <SoundCloudPlayer url={track.url} visual height={300} />
          </div>

          <h1 class="video-title">{track.title}</h1>

          <div class="meta-bar">
            <span class="views">{track.listens.toLocaleString()} listens</span>
            <span class="separator">|</span>
            <span class="duration">{track.duration}</span>
            <span class="separator">|</span>
            <span class="rating">
              {#each Array(5) as _, i}
                <span class:filled={i < track.stars}>★</span>
              {/each}
            </span>
          </div>

          <div class="uploader-box">
            <span class="label">From:</span>
            <a href={track.artistUrl} target="_blank" rel="noreferrer"
              >{track.artist}</a
            >
            {#if track.isNew}
              <span class="new-tag">NEW</span>
            {/if}
          </div>

          <div class="action-row">
            <button class="yt-button">Share</button>
            <button class="yt-button">Add to</button>
            <a
              class="yt-button"
              href={track.url}
              target="_blank"
              rel="noreferrer"
            >
              Open on SoundCloud
            </a>
          </div>

          <div class="description-box">
            <h2>Description</h2>
            <p>{track.description || "No description provided."}</p>
          </div>
        </section>

        <aside class="sidebar">
          <h2 class="sidebar-title">More bass</h2>
          <ul class="related-list">
            {#each relatedTracks as related (related.url)}
              {@const relatedSlug = trackSlug(related.url)}
              <li>
                <a
                  class="related-item"
                  href={listenPath(relatedSlug)}
                  onclick={(event) => openTrack(event, relatedSlug)}
                >
                  <img src={related.cover} alt={related.title} />
                  <div class="related-info">
                    <span class="related-title">{related.title}</span>
                    <span class="related-meta"
                      >{related.artist} · {related.listens.toLocaleString()} listens</span
                    >
                    <span class="related-duration">{related.duration}</span>
                  </div>
                </a>
              </li>
            {/each}
          </ul>
        </aside>
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
    padding-bottom: 5rem;
    min-height: 100vh;
  }

  .watch-page {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1rem 2rem;
    box-sizing: border-box;
  }

  .nav-row {
    margin-bottom: 1rem;
  }

  .status {
    font-family: Arial, sans-serif;
    font-size: 14px;
  }

  .status.error {
    color: #b00020;
  }

  .watch-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 1.5rem;
    align-items: start;
  }

  .player-shell {
    background: #000;
    border: 1px solid #999;
    padding: 0;
    margin-bottom: 0.75rem;
  }

  .video-title {
    font-family: Arial, sans-serif;
    font-size: 20px;
    font-weight: bold;
    margin: 0 0 0.5rem;
    line-height: 1.2;
    text-align: left;
  }

  .meta-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #666;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #ccc;
  }

  .separator {
    color: #ccc;
  }

  .rating {
    color: #ccc;
    letter-spacing: 1px;
  }

  .rating .filled {
    color: #c00;
  }

  .uploader-box {
    font-family: Arial, sans-serif;
    font-size: 13px;
    margin-bottom: 0.75rem;
  }

  .uploader-box .label {
    color: #666;
    margin-right: 0.25rem;
  }

  .uploader-box a {
    color: #03c;
    font-weight: bold;
    text-decoration: none;
  }

  .uploader-box a:hover {
    text-decoration: underline;
  }

  .new-tag {
    margin-left: 0.5rem;
    background: #c00;
    color: #fff;
    font-size: 10px;
    font-weight: bold;
    padding: 1px 5px;
    border-radius: 2px;
  }

  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .description-box {
    border: 1px solid #ccc;
    background: #f9f9f9;
    padding: 0.75rem;
    text-align: left;
  }

  .description-box h2 {
    font-family: Arial, sans-serif;
    font-size: 13px;
    font-weight: bold;
    margin: 0 0 0.5rem;
    color: #333;
  }

  .description-box p {
    font-family: Arial, sans-serif;
    font-size: 12px;
    margin: 0;
    line-height: 1.4;
    color: #333;
    white-space: pre-wrap;
  }

  .sidebar {
    border-left: 1px solid #ccc;
    padding-left: 1rem;
  }

  .sidebar-title {
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    margin: 0 0 0.75rem;
    text-align: left;
    color: #333;
  }

  .related-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .related-item {
    display: flex;
    gap: 0.5rem;
    text-decoration: none;
    color: inherit;
    text-align: left;
  }

  .related-item:hover .related-title {
    text-decoration: underline;
  }

  .related-item img {
    width: 80px;
    height: 60px;
    object-fit: cover;
    border: 1px solid #999;
    flex-shrink: 0;
  }

  .related-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .related-title {
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #03c;
    line-height: 1.2;
  }

  .related-meta,
  .related-duration {
    font-family: Arial, sans-serif;
    font-size: 11px;
    color: #666;
  }

  :global(.yt-button),
  .yt-button {
    font-family: Arial, sans-serif;
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
    padding: 4px 10px;
    text-decoration: none;
    display: inline-block;
  }

  @media (max-width: 900px) {
    .watch-layout {
      grid-template-columns: 1fr;
    }

    .sidebar {
      border-left: none;
      border-top: 1px solid #ccc;
      padding-left: 0;
      padding-top: 1rem;
    }
  }
</style>
