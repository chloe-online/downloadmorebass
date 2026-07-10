<article class="song-card" aria-hidden="true">
  <div class="skeleton cover"></div>

  <div class="song-info">
    <div class="skeleton line title"></div>
    <div class="skeleton line text"></div>
    <div class="skeleton line text"></div>
    <div class="skeleton line short"></div>
  </div>

  <div class="artist-details">
    <div class="skeleton line from"></div>
    <div class="skeleton line listens"></div>
    <div class="stars">
      {#each Array(5) as _}
        <div class="skeleton star"></div>
      {/each}
    </div>
    <div class="skeleton line duration"></div>
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
    width: 100px;
    height: 100px;
    border: 1px solid #ccc;
    flex-shrink: 0;
  }

  .song-info {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
    min-width: 0;
    padding-top: 5px;
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

  .line {
    height: 12px;
    width: 70%;
    background-color: #f0f0f0;
  }

  .line.title {
    height: 14px;
    width: 100%;
  }

  .line.text {
    width: 100%;
    margin: 5px 0 0 5px;
  }

  .line.short {
    width: 55%;
    margin: 5px;
  }

  .artist-details .line {
    margin: 5px;
    height: 14px;
  }

  .artist-details .from {
    width: 90%;
  }

  .artist-details .listens {
    width: 70%;
  }

  .stars {
    display: flex;
    flex-direction: row;
    gap: 2px;
    margin: 5px;
    padding: 6px 0;
    height: 24px;
    box-sizing: border-box;
  }

  .star {
    width: 12px;
    height: 12px;
    background-color: #f0f0f0;
    flex-shrink: 0;
  }

  .artist-details .duration {
    width: 35%;
  }
</style>
