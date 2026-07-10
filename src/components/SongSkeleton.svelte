<article class="song-card" aria-hidden="true">
  <div class="skeleton cover"></div>

  <div class="song-info">
    <div class="skeleton line title"></div>
    <div class="skeleton line"></div>
    <div class="skeleton line"></div>
    <div class="skeleton line short"></div>
  </div>

  <div class="artist-details">
    <div class="skeleton line"></div>
    <div class="skeleton line short"></div>
    <div class="skeleton line stars"></div>
    <div class="skeleton line short"></div>
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
    flex-shrink: 0;
    border: 1px solid #ccc;
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
    gap: 0.35rem;
    margin-left: 5px;
    padding-left: 5px;
    border-left: 1px solid #bbb;
    flex-shrink: 0;
    padding-top: 5px;
  }

  .line {
    height: 12px;
    width: 100%;
  }

  .line.title {
    height: 14px;
    width: 70%;
  }

  .line.short {
    width: 55%;
  }

  .line.stars {
    width: 40%;
  }
</style>
