<aside class="artist-bar" aria-hidden="true">
  <div class="skeleton title-bar"></div>

  <div class="artist-link">
    <div class="skeleton avatar"></div>
    <div class="skeleton username"></div>
  </div>

  <div class="stats">
    <div class="skeleton stat"></div>
    <div class="skeleton stat"></div>
  </div>

  <div class="skeleton line"></div>
  <div class="skeleton line"></div>
  <div class="skeleton line short"></div>
  <div class="skeleton button"></div>
</aside>

<style>
  .artist-bar {
    border: 1px solid #ccc;
    background: #f9f9f9;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .title-bar {
    height: 14px;
    width: 55%;
    margin-bottom: 0.25rem;
  }

  .artist-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .avatar {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border: 1px solid #ccc;
  }

  .username {
    height: 14px;
    width: 60%;
  }

  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .stat {
    height: 42px;
    border: 1px solid #ddd;
  }

  .line {
    height: 11px;
    width: 100%;
  }

  .line.short {
    width: 75%;
  }

  .button {
    height: 26px;
    width: 90px;
  }
</style>
