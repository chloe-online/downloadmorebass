<article class="song-card" aria-hidden="true">
  <div class="skeleton cover"></div>

  <div class="song-info">
    <div class="song-info-content">
      <div class="skeleton line title"></div>
      <div class="skeleton line text"></div>
      <div class="skeleton line text"></div>
      <div class="skeleton line short"></div>
    </div>
    <div class="skeleton line time"></div>
  </div>

  <div class="song-details">
    <div class="skeleton line from"></div>
    <div class="skeleton line listens"></div>
    <div class="stars">
      {#each Array(5) as _}
        <div class="skeleton star"></div>
      {/each}
    </div>
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
    width: 100px;
    height: 100px;
    border: 1px solid #000;
    border-radius: 1px;
    flex-shrink: 0;
  }

  .song-info {
    display: flex;
    flex-direction: column;
    align-items: start;
    flex: 1;
    min-width: 0;
    gap: 0;
  }

  .song-info-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0;
    width: 100%;
  }

  .song-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 120px;
    height: 100%;
    margin-left: 5px;
    padding-left: 5px;
    flex-shrink: 0;
    gap: 0;
  }

  .line.title {
    height: calc(14px * 1.5);
    width: 100%;
    margin: 0;
  }

  .line.text {
    height: calc(12px * 1.5);
    width: 100%;
    margin: 0;
  }

  .line.short {
    height: calc(12px * 1.5);
    width: 55%;
    margin: 0;
  }

  .line.time {
    height: calc(12px * 1.5);
    width: 4.5rem;
    margin-top: auto;
  }

  .line.from {
    height: calc(12px * 1.5);
    width: 90%;
    margin: 0;
  }

  .line.listens {
    height: calc(12px * 1.5);
    width: 70%;
    margin: 0;
  }

  .stars {
    display: flex;
    flex-direction: row;
    gap: 2px;
    font-size: 18px;
    line-height: 16px;
    height: 16px;
    align-items: center;
  }

  .star {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }
</style>
