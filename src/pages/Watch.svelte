<script lang="ts">
  import SoundCloudPlayer from "../components/SoundCloudPlayer.svelte";
  import Comments from "../components/Comments.svelte";
  import ExpandableText from "../components/ExpandableText.svelte";
  import SubscribeButton from "../components/SubscribeButton.svelte";
  import WatchPageSkeleton from "../components/WatchPageSkeleton.svelte";
  import SiteHeader from "../components/SiteHeader.svelte";
  import SiteFooter from "../components/SiteFooter.svelte";
  import Song from "../components/Song.svelte";
  import ErrorPanel from "../components/ErrorPanel.svelte";
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
  let sameGenreTracks = $state<Track[]>([]);
  let comments = $state<Comment[]>([]);
  let loading = $state(true);
  let commentsLoading = $state(false);
  let error = $state<string | null>(null);
  let commentsError = $state<string | null>(null);
  let moreBassExpanded = $state(false);
  let sameGenreExpanded = $state(false);
  let trackInfoExpanded = $state(false);
  let reloadToken = $state(0);

  const isNotFound = $derived(
    error === "Track not found." ||
      error === "No track selected." ||
      (!loading && !track && !error),
  );

  function applySidebarDefaults() {
    const desktop = !window.matchMedia("(max-width: 768px)").matches;
    moreBassExpanded = desktop;
    sameGenreExpanded = desktop;
  }

  $effect(() => {
    slug;
    trackInfoExpanded = false;
    applySidebarDefaults();

    const mq = window.matchMedia("(max-width: 768px)");
    const onViewportChange = () => applySidebarDefaults();
    mq.addEventListener("change", onViewportChange);
    return () => mq.removeEventListener("change", onViewportChange);
  });

  function toggleMoreBass() {
    moreBassExpanded = !moreBassExpanded;
  }

  function toggleSameGenre() {
    sameGenreExpanded = !sameGenreExpanded;
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

  function retryLoad() {
    reloadToken += 1;
  }

  $effect(() => {
    const currentSlug = slug;
    reloadToken;
    window.scrollTo({ top: 0 });
    loading = true;
    error = null;
    track = undefined;
    relatedTracks = [];
    sameGenreTracks = [];

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

        const genreKey = track?.genre.trim().toLowerCase() ?? "";
        const others = data.tracks.filter(
          (item) => trackSlug(item.url) !== currentSlug,
        );

        sameGenreTracks = genreKey
          ? others.filter(
              (item) => item.genre.trim().toLowerCase() === genreKey,
            )
          : [];
        relatedTracks = genreKey
          ? others.filter(
              (item) => item.genre.trim().toLowerCase() !== genreKey,
            )
          : others;

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
      <div class="watch-error">
        {#if isNotFound}
          <ErrorPanel
            title="Oops, track not found."
            message="This track doesn't exist (or maybe it never did). Head home to find more bass."
            contactPrompt="Think this is a bug?"
            actionLabel="Go home"
            actionHref={homePath()}
            onAction={goHome}
          />
        {:else}
          <ErrorPanel
            title="Oh uh, something went wrong."
            message="I'm sorry, but an error occurred while loading this track. Please try again in a bit."
            actionLabel="Try again"
            onAction={retryLoad}
          />
        {/if}
      </div>
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

          <h1 class="video-title">{track.title}</h1>

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

                  <SubscribeButton
                    inputId="watch-subscribe-email"
                    resetKey={slug}
                  />
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
            <a
              class="soundcloud-button"
              href={track.url}
              target="_blank"
              rel="noreferrer"
              onclick={(event) => event.stopPropagation()}
            >
              SoundCloud
            </a>
            <div class="track-info-header">
              <span class="views">{track.listens.toLocaleString()} listens</span
              >
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
              showToggle={false}
              onToggle={toggleTrackInfo}
            />
            {#if trackInfoExpanded && (track.genre || track.tags.length > 0)}
              <div class="track-meta">
                {#if track.genre}
                  <p class="track-meta-row">
                    <span class="track-meta-label">Genre:</span>
                    <a
                      class="track-tag track-tag--genre"
                      href={homePath(track.genre)}
                      onclick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        navigate(homePath(track?.genre ?? "all"));
                      }}>{track.genre}</a
                    >
                  </p>
                {/if}
                {#if track.tags.length > 0}
                  <div class="track-meta-row">
                    <span class="track-meta-label">Tags:</span>
                    {#each track.tags as tag (tag)}
                      <a
                        class="track-tag"
                        href={homePath(tag)}
                        onclick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          navigate(homePath(tag));
                        }}>{tag}</a
                      >
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
            <p class="track-info-toggle-line">
              (<button
                type="button"
                class="track-info-toggle"
                onclick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleTrackInfo();
                }}>{trackInfoExpanded ? "less" : "more"}</button
              >)
            </p>
          </div>

          <Comments
            {comments}
            trackUrl={track.url}
            loading={commentsLoading}
            error={commentsError}
          />
        </section>

        <aside class="sidebar">
          {#if sameGenreTracks.length > 0}
            <div class="sidebar-section" class:expanded={sameGenreExpanded}>
              <button
                type="button"
                class="sidebar-title sidebar-section-toggle"
                aria-expanded={sameGenreExpanded}
                onclick={toggleSameGenre}
              >
                <span>More {track?.genre ?? "genre"}</span>
                <span class="sidebar-section-hint"
                  >{sameGenreExpanded ? "less" : "more"}</span
                >
              </button>
              <div class="sidebar-section-body">
                <ul class="related-list related-list--desktop">
                  {#each sameGenreTracks as related (related.url)}
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
                          <span class="related-duration"
                            >{related.duration}</span
                          >
                        </div>
                      </a>
                    </li>
                  {/each}
                </ul>
                <ul class="related-list related-list--mobile">
                  {#each sameGenreTracks as related (related.url)}
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
                        genre={related.genre}
                        isNew={related.isNew}
                      />
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}

          {#if relatedTracks.length > 0}
            <div class="sidebar-section" class:expanded={moreBassExpanded}>
              <button
                type="button"
                class="sidebar-title sidebar-section-toggle"
                aria-expanded={moreBassExpanded}
                onclick={toggleMoreBass}
              >
                <span>More bass</span>
                <span class="sidebar-section-hint"
                  >{moreBassExpanded ? "less" : "more"}</span
                >
              </button>
              <div class="sidebar-section-body">
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
                          <span class="related-duration"
                            >{related.duration}</span
                          >
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
                        genre={related.genre}
                        isNew={related.isNew}
                      />
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
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
    position: relative;
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

  .soundcloud-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 1;
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #03c;
    text-decoration: none;
    white-space: nowrap;
  }

  .soundcloud-button:hover {
    text-decoration: underline;
  }

  .track-info-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
    min-width: 0;
    padding-right: 5.5rem;
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

  .track-meta {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }

  .track-meta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem 0.5rem;
    margin: 0;
    min-width: 0;
  }

  .track-meta-label {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #666;
    line-height: 1.25;
  }

  .track-tag {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #03c;
    text-decoration: none;
    line-height: 1.25;
  }

  .track-tag:hover {
    text-decoration: underline;
  }

  .track-tag--genre {
    font-weight: bold;
    color: #333;
  }

  .track-tag--genre:hover {
    color: #03c;
  }

  .track-info-toggle-line {
    margin: 0;
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.35;
  }

  .track-info-toggle {
    display: inline;
    background: none;
    border: none;
    padding: 0;
    font-family: Arial, sans-serif;
    font-size: inherit;
    line-height: inherit;
    font-weight: bold;
    color: #03c;
    cursor: pointer;
    text-decoration: dotted underline;
  }

  .track-info-toggle:hover {
    text-decoration: underline;
  }

  .watch-error {
    width: 100%;
    max-width: var(--song-max);
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
    font-family: Arial, sans-serif;
    font-size: 20px;
    font-weight: bold;
    line-height: 1.2;
    text-align: left;
    margin: 0 0 0.5rem;
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

  .sidebar-section-toggle {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    margin: 0;
    padding: 0.5rem 0;
    border: none;
    border-bottom: 1px solid #ccc;
    background: none;
    cursor: pointer;
  }

  .sidebar-section-hint {
    display: inline;
    font-size: 12px;
    color: #03c;
    text-decoration: none;
  }

  .sidebar-section-hint:hover,
  .sidebar-section-toggle:hover .sidebar-section-hint {
    text-decoration: underline;
  }

  .sidebar-section:not(.expanded) .sidebar-section-body {
    display: none;
  }

  .sidebar-section.expanded .sidebar-section-body {
    display: block;
    padding-top: 0.5rem;
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

    .subwoofer-footer {
      display: flex;
    }
  }
</style>
