<script lang="ts">
  import type { Comment } from "../../shared/types";

  let {
    comments,
    trackUrl,
    loading = false,
    error = null,
  }: {
    comments: Comment[];
    trackUrl: string;
    loading?: boolean;
    error?: string | null;
  } = $props();

  function formatTimestamp(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
</script>

<section class="comments-section">
  <div class="comments-header">
    <h2 class="comments-title">
      {loading ? "Comments" : `All Comments (${comments.length})`}
    </h2>
    {#if trackUrl}
      <a
        class="comments-button"
        href={trackUrl}
        target="_blank"
        rel="noreferrer">Post a comment on SoundCloud</a
      >
    {/if}
  </div>

  {#if loading}
    <ul class="comments-list" aria-hidden="true">
      {#each Array(3) as _, i (i)}
        <li class="comment">
          <div class="skeleton avatar"></div>
          <div class="comment-body">
            <div class="skeleton line short"></div>
            <div class="skeleton line"></div>
          </div>
        </li>
      {/each}
    </ul>
  {:else if error}
    <p class="comments-status error">{error}</p>
  {:else if comments.length === 0}
    <p class="comments-status">No comments yet. Be the first on SoundCloud.</p>
  {:else}
    <ul class="comments-list">
      {#each comments as comment (comment.id)}
        <li class="comment">
          <a
            class="avatar-link"
            href={comment.user.profileUrl}
            target="_blank"
            rel="noreferrer"
            draggable="false"
          >
            {#if comment.user.avatarUrl}
              <img
                src={comment.user.avatarUrl}
                alt={comment.user.username}
                draggable="false"
              />
            {:else}
              <span class="avatar-fallback">
                {comment.user.username.slice(0, 1).toUpperCase()}
              </span>
            {/if}
          </a>

          <div class="comment-body">
            <div class="comment-meta">
              <a
                class="username"
                href={comment.user.profileUrl}
                target="_blank"
                rel="noreferrer"
              >
                {comment.user.username}
              </a>
              {#if comment.timestamp != null}
                <span class="at-time"
                  >at {formatTimestamp(comment.timestamp)}</span
                >
              {/if}
              <span class="posted-on">({formatDate(comment.createdAt)})</span>
            </div>
            <p class="comment-text">{comment.body}</p>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .comments-section {
    margin-top: 1rem;
    border-top: 1px solid #ccc;
    padding-top: 0.75rem;
    text-align: left;
  }

  .comments-title {
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }

  .comments-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .comments-button {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #03c;
    text-decoration: none;
    margin: 0;
  }

  .comments-button:hover {
    text-decoration: underline;
  }
  .comments-button:active {
    text-decoration: underline;
  }

  .comments-status {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #666;
    margin: 0;
  }

  .comments-status.error {
    color: #b00020;
  }

  .avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border: 1px solid #ccc;
  }

  .line {
    height: 12px;
    width: 100%;
    margin-bottom: 0.25rem;
  }

  .line.short {
    width: 45%;
  }

  .comments-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .comment {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .avatar-link {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: block;
  }

  .avatar-link img,
  .avatar-fallback {
    width: 36px;
    height: 36px;
    border: 1px solid #999;
    border-radius: 2px;
    object-fit: cover;
    display: block;
  }

  .avatar-link img {
    -webkit-user-drag: none;
    user-select: none;
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-gray);
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    color: #333;
    text-decoration: none;
  }

  .comment-body {
    min-width: 0;
    flex: 1;
  }

  .comment-meta {
    font-family: Arial, sans-serif;
    font-size: 11px;
    margin-bottom: 0.25rem;
    line-height: 1.3;
  }

  .username {
    color: #03c;
    font-weight: bold;
    text-decoration: none;
    margin-right: 0.35rem;
  }

  .username:hover {
    text-decoration: underline;
  }

  .at-time {
    color: #666;
    margin-right: 0.35rem;
  }

  .posted-on {
    color: #999;
  }

  .comment-text {
    font-family: Arial, sans-serif;
    font-size: 12px;
    margin: 0;
    line-height: 1.4;
    color: #333;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>
