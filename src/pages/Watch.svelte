<script lang="ts">
  import SoundCloudPlayer from "../components/SoundCloudPlayer.svelte";
  import Comments from "../components/Comments.svelte";
  import ExpandableText from "../components/ExpandableText.svelte";
  import SubscribeForm from "../components/SubscribeForm.svelte";
  import WatchPageSkeleton from "../components/WatchPageSkeleton.svelte";
  import SiteHeader from "../components/SiteHeader.svelte";
  import SiteFooter from "../components/SiteFooter.svelte";
  import Song from "../components/Song.svelte";
  import { fetchComments } from "../lib/api";
  import { navigate, listenPath, homePath } from "../lib/router";
  import { findTrackBySlug, getTracks, trackSlug } from "../lib/tracks";
  import { playBassTone } from "../lib/bass";
  import { formatFullDate, formatRelativeDate } from "../lib/dates";
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
  let moreBassExpanded = $state(false);
  let subscribeOpen = $state(false);
  let trackInfoExpanded = $state(false);

  $effect(() => {
    slug;
    moreBassExpanded = false;
    subscribeOpen = false;
    trackInfoExpanded = false;
  });

  function toggleMoreBass() {
    moreBassExpanded = !moreBassExpanded;
  }

  function openSubscribe() {
    subscribeOpen = true;
  }

  function closeSubscribe() {
    subscribeOpen = false;
  }

  function toggleTrackInfo() {
    trackInfoExpanded = !trackInfoExpanded;
  }

  function handleTrackInfoKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleTrackInfo();
    }
  }

  function goHome(event: MouseEvent) {
    event.preventDefault();
    navigate(homePath());
  }

  function openTrack(event: MouseEvent, relatedSlug: string) {
    event.preventDefault();
    navigate(listenPath(relatedSlug));
  }

  $effect(() => {
    const currentSlug = slug;
    window.scrollTo({ top: 0 });
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
              {track.title}
            </span>
          </h1>

          <div class="song-info">
            <div class="uploader-box">
              {#if artistProfile}
                <div class="artist-row">
                  {#if artistProfile.avatarUrl}
                    <a
                      class="artist-avatar-link"
                      href={artistProfile.permalinkUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        class="artist-avatar"
                        src={artistProfile.avatarUrl}
                        alt={artistProfile.username}
                      />
                    </a>
                  {:else}
                    <span class="artist-avatar-fallback"
                      >{artistProfile.username.slice(0, 1).toUpperCase()}</span
                    >
                  {/if}

                  <div class="artist-info">
                    <a
                      href={artistProfile.permalinkUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span class="username">{artistProfile.username}</span>
                    </a>
                    <span class="followers">
                      Followers: {artistProfile.followersCount.toLocaleString()}
                    </span>
                  </div>

                  <div class="subscribe-wrap">
                    <button
                      type="button"
                      class="subscribe-button"
                      onclick={openSubscribe}
                    >
                      Subscribe
                    </button>

                    {#if subscribeOpen}
                      <!-- svelte-ignore a11y_no_static_element_interactions -->
                      <div
                        class="subscribe-backdrop"
                        onclick={closeSubscribe}
                      ></div>
                      <div
                        class="subscribe-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="watch-subscribe-title"
                      >
                        <div class="subscribe-panel-header">
                          <h2
                            id="watch-subscribe-title"
                            class="subscribe-panel-title"
                          >
                            Subscribe
                          </h2>
                          <button
                            type="button"
                            class="subscribe-close"
                            aria-label="Close subscribe popup"
                            onclick={closeSubscribe}
                          >
                            [x]
                          </button>
                        </div>
                        <SubscribeForm
                          inputId="watch-subscribe-email"
                          variant="popup"
                          description={`enter your email to keep up with ${artistProfile.username}`}
                        />
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>

            <div class="rating-wrap">
              <span class="rating">
                {#each Array(5) as _, i}
                  <span class:filled={i < track.stars}>★</span>
                {/each}
              </span>
              <!-- removing the likes label for now -->
              <!-- <span class="rating-label"
                >Likes: {track.likes.toLocaleString()}</span
              > -->
            </div>
          </div>

          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <div
            class="track-info"
            class:expanded={trackInfoExpanded}
            role="button"
            tabindex="0"
            aria-expanded={trackInfoExpanded}
            onclick={toggleTrackInfo}
            onkeydown={handleTrackInfoKeydown}
          >
            <div class="track-info-header">
              <span class="views">{track.listens.toLocaleString()} listens</span>
              {#if track.publishedAt}
                <span class="published">
                  {#if trackInfoExpanded}
                    Released on {formatFullDate(track.publishedAt)}
                  {:else}
                    {formatRelativeDate(track.publishedAt)}
                  {/if}
                </span>
              {/if}
            </div>
            <ExpandableText
              text={track.description || "No description provided."}
              lines={3}
              expanded={trackInfoExpanded}
              onToggle={toggleTrackInfo}
            />
          </div>

          <Comments
            {comments}
            trackUrl={track.url}
            loading={commentsLoading}
            error={commentsError}
          />
        </section>

        <aside class="sidebar">
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
                          >{related.artist} · {related.listens.toLocaleString()}
                          listens</span
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

  .track-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0.5rem;
    min-width: 0;
    margin-top: 0.5rem;
    background: #ddd;
    border: 1px solid #999;
    padding: 0.5rem;
    cursor: pointer;
    text-align: left;
  }

  .track-info:focus-visible {
    outline: 2px solid #03c;
    outline-offset: 1px;
  }

  .track-info-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
    min-width: 0;
  }
  .views {
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
  }

  .published {
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
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

  .song-info {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    min-width: 0;
    width: 100%;
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

  .subscribe-wrap {
    position: relative;
    flex-shrink: 0;
    align-self: flex-start;
  }

  .artist-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0.6rem;
    min-width: 0;
    width: 100%;
  }

  .artist-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0.25rem;
    min-width: 0;
  }

  .artist-info a {
    text-decoration: none;
    line-height: 1;
  }

  .username {
    display: block;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    color: #03c;
    line-height: 1;
  }

  .artist-info a:hover .username {
    text-decoration: underline;
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
    display: inline-flex;
    align-items: flex-start;
    gap: 0;
    margin: 0;
    padding: 0;
    color: #ccc;
    letter-spacing: 0;
    font-size: 24px;
    line-height: 0.7;
    height: 0.7em;
    overflow: hidden;
  }

  .rating span {
    display: block;
    margin: 0;
    padding: 0;
    line-height: 0.7;
    height: 0.7em;
    overflow: hidden;
  }

  .rating .filled {
    color: #c00;
  }

  .rating-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    margin: 0;
    padding: 0;
    min-width: 0;
    line-height: 1;
  }

  .rating-label {
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1;
    margin: 0;
    padding: 0;
  }

  .uploader-box {
    font-family: Arial, sans-serif;
    font-size: 13px;
    margin: 0;
    padding: 0;
  }

  .artist-avatar-link {
    display: block;
    flex-shrink: 0;
    line-height: 0;
  }

  .artist-avatar,
  .artist-avatar-fallback {
    width: 40px;
    height: 40px;
    border: 1px solid #999;
    border-radius: 2px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .artist-avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ddd;
    font-family: Arial, sans-serif;
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }

  .followers {
    min-width: 0;
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.2;
    color: #666;
  }

  .subscribe-button {
    display: inline-block;
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: bold;
    color: #333;
    background: transparent
      url(https://web.archive.org/web/20080416013730im_/http://s.ytimg.com/yt/img/master-vfl37165.gif)
      no-repeat scroll 0 -137px;
    border: 1px solid #d3d3d3;
    border-radius: 3px;
    padding: 4px 10px;
    text-decoration: none;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
    cursor: pointer;
  }

  .subscribe-button:hover {
    border-color: #999;
  }

  .subscribe-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
  }

  .subscribe-panel {
    position: absolute;
    top: calc(100% + 0.35rem);
    left: 0;
    right: auto;
    z-index: 50;
    width: min(16.5rem, calc(100vw - 2rem));
    box-sizing: border-box;
    border: 1px solid #999;
    border-radius: 2px;
    padding: 0.65rem;
    background: #ffffe1;
    box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.15);
  }

  .subscribe-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.45rem;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid #ddd;
  }

  .subscribe-panel-title {
    margin: 0;
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #333;
  }

  .subscribe-close {
    border: none;
    background: transparent;
    color: #03c;
    font-family: Arial, sans-serif;
    font-size: 11px;
    line-height: 1;
    padding: 0;
    cursor: pointer;
    text-decoration: underline;
  }

  .subscribe-close:hover {
    text-decoration: none;
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
