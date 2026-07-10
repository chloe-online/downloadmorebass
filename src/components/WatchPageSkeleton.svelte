<script lang="ts">
  import ArtistProfileBarSkeleton from "./ArtistProfileBarSkeleton.svelte";
</script>

<div class="watch-layout" aria-hidden="true">
  <section class="primary">
    <div class="skeleton player"></div>
    <div class="skeleton video-title"></div>
    <div class="skeleton meta"></div>
    <div class="skeleton channel"></div>
    <div class="action-row">
      <div class="skeleton action"></div>
      <div class="skeleton action"></div>
      <div class="skeleton action wide"></div>
    </div>
    <div class="description-box">
      <div class="skeleton box-title"></div>
      <div class="skeleton line"></div>
      <div class="skeleton line"></div>
      <div class="skeleton line short"></div>
    </div>
    <div class="comments-skeleton">
      <div class="skeleton box-title"></div>
      {#each Array(3) as _}
        <div class="comment-row">
          <div class="skeleton avatar"></div>
          <div class="comment-lines">
            <div class="skeleton line short"></div>
            <div class="skeleton line"></div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <aside class="sidebar">
    <ArtistProfileBarSkeleton />
    <div class="skeleton sidebar-title"></div>
    {#each Array(4) as _}
      <div class="related-row">
        <div class="skeleton thumb"></div>
        <div class="related-lines">
          <div class="skeleton line"></div>
          <div class="skeleton line short"></div>
        </div>
      </div>
    {/each}
  </aside>
</div>

<style>
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
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .player {
    height: 300px;
    width: 100%;
    border: 1px solid #999;
    margin-bottom: 0.75rem;
  }

  .video-title {
    height: 22px;
    width: 80%;
    margin-bottom: 0.5rem;
  }

  .meta {
    height: 12px;
    width: 55%;
    margin-bottom: 0.75rem;
  }

  .channel {
    height: 13px;
    width: 40%;
    margin-bottom: 0.75rem;
  }

  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .action {
    height: 26px;
    width: 56px;
  }

  .action.wide {
    width: 130px;
  }

  .description-box {
    border: 1px solid #ccc;
    background: #f9f9f9;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }

  .box-title {
    height: 13px;
    width: 35%;
    margin-bottom: 0.25rem;
  }

  .line {
    height: 12px;
    width: 100%;
  }

  .line.short {
    width: 65%;
  }

  .comments-skeleton {
    border-top: 1px solid #ccc;
    padding-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .comment-row,
  .related-row {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border: 1px solid #ccc;
  }

  .comment-lines,
  .related-lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding-top: 2px;
  }

  .sidebar-title {
    height: 14px;
    width: 45%;
  }

  .thumb {
    width: 80px;
    height: 60px;
    flex-shrink: 0;
    border: 1px solid #ccc;
  }

  @media (max-width: 768px) {
    .watch-layout {
      flex-direction: column;
    }

    .primary {
      max-width: 100%;
    }
  }
</style>
