<aside class="site-main-bar" aria-hidden="true">
  <div class="site-main-bar-title">
    <div class="skeleton title-line"></div>
  </div>

  <div class="site-main-bar-description">
    <div class="skeleton line"></div>
    <div class="skeleton line short"></div>
  </div>

  <div class="download-button">
    <div class="skeleton download-btn"></div>
  </div>

  <div class="site-main-bar-more-bass">
    <div class="skeleton line link"></div>
  </div>
</aside>

<style>
  .site-main-bar {
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

  .site-main-bar-title {
    margin: 0 0 0.75rem;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.35rem;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
  }

  .title-line {
    height: calc(13px * 1.5);
    width: 9.5rem;
  }

  .site-main-bar-description {
    width: 100%;
    margin: 0 0 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .line {
    height: calc(12px * 1.5);
    width: 100%;
  }

  .line.short {
    width: 72%;
  }

  .download-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    width: 100%;
    text-align: center;
  }

  .download-btn {
    font-size: 1.25rem;
    line-height: 1;
    padding: 0.375rem 2.5rem;
    border: 1px solid #d3d3d3;
    border-radius: 3px;
    height: 1em;
    width: 5.5em;
    box-sizing: content-box;
  }

  .site-main-bar-more-bass {
    margin: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .line.link {
    height: calc(12px * 1.5);
    width: 9rem;
  }

  @media (max-width: 768px) {
    .download-btn {
      font-size: 1rem;
      padding: 0.3rem 2rem;
      width: 5.5em;
    }
  }
</style>
