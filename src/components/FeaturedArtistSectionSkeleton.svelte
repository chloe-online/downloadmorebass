<section class="featured-artist" aria-hidden="true">
  <div class="featured-artist-title">
    <div class="skeleton title-line"></div>
  </div>

  <div class="artist-header">
    <div class="skeleton avatar"></div>
    <div class="artist-meta">
      <div class="skeleton username-line"></div>
      <div class="skeleton stat-line"></div>
      <div class="skeleton stat-line short"></div>
    </div>
    <div class="skeleton subscribe-button"></div>
  </div>

  <div class="bio">
    <div class="skeleton line"></div>
    <div class="skeleton line"></div>
    <div class="skeleton line short"></div>
  </div>

  <div class="socials">
    <div class="skeleton social-pill"></div>
    <div class="skeleton social-pill"></div>
    <div class="skeleton social-pill"></div>
  </div>
</section>

<style>
  .featured-artist {
    border: 1px solid #ccc;
    background: #f9f9f9;
    padding: 0.75rem;
    text-align: center;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .featured-artist-title {
    margin: 0 0 0.75rem;
    border-bottom: 1px solid var(--theme-gray);
    padding-bottom: 0.35rem;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
  }

  .title-line {
    height: calc(13px * 1.5);
    width: 7.5rem;
  }

  .artist-header {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    width: 100%;
    margin-bottom: 0.75rem;
  }

  .avatar {
    width: 72px;
    height: 72px;
    border: 1px solid #ccc;
    border-radius: 2px;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  .artist-meta {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
    min-width: 0;
    padding-top: 0.15rem;
  }

  .username-line {
    height: calc(13px * 1.3);
    width: 70%;
  }

  .stat-line {
    height: calc(12px * 1.25);
    width: 85%;
  }

  .stat-line.short {
    width: 55%;
  }

  .subscribe-button {
    width: 4.5rem;
    height: calc(11px + 8px + 2px);
    border: 1px solid #ccc;
    border-radius: 3px;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  .bio {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0 0 0.75rem;
  }

  .line {
    height: calc(12px * 1.35);
    width: 100%;
  }

  .line.short {
    width: 65%;
  }

  .socials {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    margin: 0;
  }

  .social-pill {
    height: calc(12px * 1.4);
    width: 4.5rem;
  }
</style>
