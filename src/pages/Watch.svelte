<script lang="ts">
  import SoundCloudPlayer from "../components/SoundCloudPlayer.svelte";
  import Comments from "../components/Comments.svelte";
  import ArtistProfileBar from "../components/ArtistProfileBar.svelte";
  import ExpandableText from "../components/ExpandableText.svelte";
  import WatchPageSkeleton from "../components/WatchPageSkeleton.svelte";
  import SiteHeader from "../components/SiteHeader.svelte";
  import SiteFooter from "../components/SiteFooter.svelte";
  import Song from "../components/Song.svelte";
  import { fetchComments } from "../lib/api";
  import { navigate, listenPath } from "../lib/router";
  import { findTrackBySlug, getTracks, trackSlug } from "../lib/tracks";
  import { playBassTone } from "../lib/bass";
  import type { ArtistProfile, Comment, Track } from "../../shared/types";

  let { slug }: { slug: string | null } = $props();

  let track = $state<Track | undefined>();
  let artistProfile = $state<ArtistProfile | undefined>();
  let relatedTracks = $state<Track[]>([]);
  let comments = $state<Comment[]>([]);
  let loading = $state(true);
  let commentsLoading = $state(false);
  let error = $state<string | null>(null);
  let commentsError = $state<string | null>(null);
  let shareCopied = $state(false);
  let shareResetTimeout: ReturnType<typeof setTimeout> | null = null;
  let moreBassExpanded = $state(false);

  $effect(() => {
    slug;
    moreBassExpanded = false;
  });

  function toggleMoreBass() {
    moreBassExpanded = !moreBassExpanded;
  }

  function goHome(event: MouseEvent) {
    event.preventDefault();
    navigate("/");
  }

  function openTrack(event: MouseEvent, relatedSlug: string) {
    event.preventDefault();
    navigate(listenPath(relatedSlug));
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  async function shareTrack() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      shareCopied = true;

      if (shareResetTimeout) {
        clearTimeout(shareResetTimeout);
      }

      shareResetTimeout = setTimeout(() => {
        shareCopied = false;
        shareResetTimeout = null;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy share URL:", err);
    }
  }

  $effect(() => {
    const currentSlug = slug;
    window.scrollTo({ top: 0 });
    loading = true;
    error = null;
    track = undefined;
    relatedTracks = [];
    shareCopied = false;

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
        artistProfile = data.user;
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

  $effect(() => {
    const currentTrack = track;

    comments = [];
    commentsError = null;

    if (!currentTrack) {
      commentsLoading = false;
      return;
    }

    let cancelled = false;
    commentsLoading = true;

    fetchComments(currentTrack.id)
      .then((data) => {
        if (cancelled) return;
        comments = data.comments;
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        commentsError =
          err instanceof Error ? err.message : "Failed to load comments";
      })
      .finally(() => {
        if (!cancelled) {
          commentsLoading = false;
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
    {#if loading}
      <WatchPageSkeleton />
    {:else if error || !track}
      <p class="status error">{error ?? "Track not found."}</p>
      <button class="yt-button" onclick={goHome}>Go home</button>
    {:else}
      <div class="watch-layout">
        <section class="primary">
          <div class="player-shell">
            <SoundCloudPlayer
              trackId={track.id}
              cover={track.cover}
              title={track.title}
              height={300}
            />
          </div>

          <h1 class="video-title">
            <span class="title-text">
              {track.title} -
              <a href={track.artistUrl} target="_blank" rel="noreferrer"
                >{track.artist}</a
              >
            </span>
            <span class="views">{track.listens.toLocaleString()} listens</span>
          </h1>

          <div class="meta-bar">
            <span class="rating">
              {#each Array(5) as _, i}
                <span class:filled={i < track.stars}>★</span>
              {/each}
            </span>
            <span class="separator">|</span>
            <span class="likes">{track.likes.toLocaleString()} likes</span>
            {#if track.publishedAt}
              <span class="separator">|</span>
              <span class="published"
                >Released on {formatDate(track.publishedAt)}</span
              >
            {/if}
          </div>

          <div class="uploader-box"></div>

          <ExpandableText
            text={track.description || "No description provided."}
            lines={3}
          />

          <Comments
            {comments}
            trackUrl={track.url}
            loading={commentsLoading}
            error={commentsError}
          />
        </section>

        <aside class="sidebar">
          {#if artistProfile}
            <ArtistProfileBar profile={artistProfile} />
          {/if}
          <div class="more-bass" class:expanded={moreBassExpanded}>
            <button
              type="button"
              class="sidebar-title more-bass-toggle"
              aria-expanded={moreBassExpanded}
              onclick={toggleMoreBass}
            >
              <span>More bass</span>
              <span class="more-bass-hint"
                >{moreBassExpanded ? "less" : "more"}</span
              >
            </button>
            <div class="more-bass-body">
              <ul class="related-list related-list--desktop">
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
              <ul class="related-list related-list--mobile">
                {#each relatedTracks as related (related.url)}
                  <li>
                    <Song
                      cover={related.cover}
                      title={related.title}
                      description={related.description}
                      duration={related.duration}
                      artist={related.artist}
                      listens={related.listens}
                      artistUrl={related.artistUrl}
                      url={related.url}
                      stars={related.stars}
                      isNew={related.isNew}
                    />
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        </aside>
        <div class="subwoofer-footer">
          {#each Array(3) as _, i (i)}
            <button
              type="button"
              class="woofer-button"
              aria-label="Play bass tone"
              onclick={() => playBassTone(55.0, 0.5)}
            >
              <img src="/woofer-still.png" alt="" class="woofer" />
            </button>
          {/each}
        </div>
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
    max-width: var(--layout-max);
  }

  .watch-page {
    width: 100%;
    margin: 0 auto;
    flex: 1 0 auto;
    box-sizing: border-box;
    padding: 1rem;
  }

  .nav-row {
    margin-bottom: 8px;
  }

  .status {
    font-family: Arial, sans-serif;
    font-size: 14px;
  }

  .status.error {
    color: #b00020;
  }

  .watch-layout {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    width: 100%;
    max-width: var(--layout-max);
  }

  .primary {
    width: 100%;
    max-width: var(--song-max);
    flex-shrink: 0;
    min-width: 0;
  }

  .sidebar {
    flex: 1;
    min-width: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar-title {
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    margin: 0;
    text-align: left;
    color: #333;
  }

  .player-shell {
    margin-bottom: 0.75rem;
  }

  .video-title {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    font-family: Arial, sans-serif;
    font-size: 20px;
    font-weight: bold;
    margin: 0 0 0.5rem;
    line-height: 1.2;
    text-align: left;
  }

  .video-title .title-text {
    min-width: 0;
  }

  .video-title .views {
    flex-shrink: 0;
    font-weight: normal;
    white-space: nowrap;
  }

  .video-title a {
    font-weight: semibold;
  }

  .meta-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
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
    /* font-size: 24px; */
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

  .description-box :global(.expandable-text p) {
    margin: 0;
  }

  .sidebar-title {
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    text-align: left;
    color: #333;
  }

  .more-bass-toggle {
    display: flex;
    align-items: baseline;
    justify-content: flex-start;
    gap: 0.5rem;
    width: 100%;
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    cursor: default;
    pointer-events: none;
  }

  .more-bass-hint {
    display: none;
    font-size: 12px;
    color: #03c;
    text-decoration: none;
  }

  .more-bass-body {
    display: block;
  }

  .related-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .related-list--mobile {
    display: none;
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
    height: 80px;
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

  .subwoofer-footer {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    display: none;
  }

  .woofer-button {
    flex: 0 1 128px;
    min-width: 0;
    background: none;
    border: none;
    box-shadow: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    line-height: 0;
  }

  .woofer-button:active .woofer {
    transform: scale(0.94);
  }

  .woofer {
    width: 100%;
    height: auto;
    max-width: 128px;
    aspect-ratio: 1;
    object-fit: contain;
    object-position: center;
    display: block;
    transition: transform 0.08s ease-out;
  }

  @media (max-width: 768px) {
    .watch-layout {
      flex-direction: column;
      max-width: 100%;
    }

    .primary {
      max-width: 100%;
    }

    .sidebar {
      flex: 1 1 100%;
      width: 100%;
    }

    .related-list--desktop {
      display: none;
    }

    .related-list--mobile {
      display: flex;
      gap: 0;
    }

    .related-list--mobile li {
      padding: 8px;
    }

    .related-list--mobile li:not(:last-child) {
      border-bottom: 1px dotted #bbb;
    }

    .related-list--mobile li:not(:first-child) {
      border-top: 1px dotted #bbb;
    }

    .more-bass-toggle {
      cursor: pointer;
      pointer-events: auto;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #ccc;
    }

    .more-bass-hint {
      display: inline;
    }

    .more-bass-hint:hover,
    .more-bass-toggle:hover .more-bass-hint {
      text-decoration: underline;
    }

    .more-bass:not(.expanded) .more-bass-body {
      display: none;
    }

    .more-bass.expanded .more-bass-body {
      display: block;
      padding-top: 0.5rem;
    }

    .subwoofer-footer {
      display: flex;
    }
  }
</style>
