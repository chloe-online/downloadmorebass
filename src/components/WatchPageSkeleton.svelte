<div class="watch-layout" aria-hidden="true">
  <section class="primary">
    <div class="skeleton player"></div>
    <div class="skeleton video-title"></div>

    <div class="song-info">
      <div class="artist-row">
        <div class="skeleton avatar"></div>
        <div class="artist-info">
          <div class="skeleton username"></div>
          <div class="skeleton followers"></div>
        </div>
        <div class="skeleton subscribe"></div>
      </div>
      <div class="skeleton rating"></div>
    </div>

    <div class="track-info">
      <div class="track-info-header">
        <div class="skeleton meta-chip"></div>
        <div class="skeleton meta-chip wide"></div>
      </div>
      <div class="skeleton line"></div>
      <div class="skeleton line"></div>
      <div class="skeleton line short"></div>
    </div>

    <div class="comments-skeleton">
      <div class="skeleton box-title"></div>
      {#each Array(3) as _}
        <div class="comment-row">
          <div class="skeleton comment-avatar"></div>
          <div class="comment-lines">
            <div class="skeleton line short"></div>
            <div class="skeleton line"></div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <aside class="sidebar">
    <div class="skeleton sidebar-title"></div>
    {#each Array(4) as _}
      <div class="related-row">
        <div class="skeleton thumb"></div>
        <div class="related-lines">
          <div class="skeleton line"></div>
          <div class="skeleton line short"></div>
          <div class="skeleton line tiny"></div>
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

  .song-info {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    min-width: 0;
    width: 100%;
    margin-bottom: 0.75rem;
  }

  .artist-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0.6rem;
    min-width: 0;
    flex: 1;
  }

  .avatar {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border: 1px solid #999;
    border-radius: 2px;
  }

  .artist-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    min-width: 0;
  }

  .username {
    height: 14px;
    width: 7rem;
  }

  .followers {
    height: 12px;
    width: 5.5rem;
  }

  .subscribe {
    height: 24px;
    width: 4.5rem;
    flex-shrink: 0;
    border: 1px solid #d3d3d3;
    border-radius: 3px;
  }

  .rating {
    height: 16px;
    width: 5.5rem;
    flex-shrink: 0;
  }

  .track-info {
    border: 1px solid #ccc;
    background: #f9f9f9;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }

  .track-info-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.15rem;
  }

  .meta-chip {
    height: 12px;
    width: 5.5rem;
  }

  .meta-chip.wide {
    width: 8rem;
  }

  .line {
    height: 12px;
    width: 100%;
  }

  .line.short {
    width: 65%;
  }

  .line.tiny {
    width: 35%;
  }

  .comments-skeleton {
    border-top: 1px solid #ccc;
    padding-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .box-title {
    height: 13px;
    width: 35%;
    margin-bottom: 0.25rem;
  }

  .comment-row,
  .related-row {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .comment-avatar {
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
    height: 80px;
    flex-shrink: 0;
    border: 1px solid #999;
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
