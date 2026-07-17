<div class="featured-artist-container" aria-hidden="true">
  <div class="skeleton heading"></div>
  <section class="featured-artist">
    <div class="artist-header">
      <div class="skeleton avatar"></div>

      <div class="artist-details">
        <div class="artist-meta">
          <div class="skeleton username-line"></div>
          <div class="skeleton stat-line"></div>
          <div class="skeleton stat-line short"></div>
        </div>

        <div class="subscribe-socials-container">
          <div class="skeleton subscribe-button"></div>
          <div class="socials">
            <div class="skeleton social-icon"></div>
            <div class="skeleton social-icon"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="bio">
      <div class="skeleton line"></div>
      <div class="skeleton line"></div>
      <div class="skeleton line short"></div>
    </div>
  </section>
</div>

<style>
  .featured-artist-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }

  .heading {
    height: calc(19px * 1.5);
    width: 8rem;
    margin: 0;
  }

  .featured-artist {
    border: 1px solid #ccc;
    background: #f9f9f9;
    padding: 0.5rem;
    text-align: center;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .artist-header {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    width: 100%;
    text-align: left;
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

  .artist-details {
    display: flex;
    align-items: stretch;
    gap: 0.65rem;
    flex: 1;
    min-width: 0;
  }

  .artist-meta {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
    padding-top: 0.1rem;
    flex: 1;
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

  .subscribe-socials-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .subscribe-button {
    width: 4.5rem;
    height: calc(11px + 8px + 2px);
    border: 1px solid #ccc;
    border-radius: 3px;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  .socials {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .social-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .bio {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0;
  }

  .line {
    height: calc(12px * 1.35);
    width: 100%;
  }

  .line.short {
    width: 65%;
  }

  @media (max-width: 768px) {
    .featured-artist-container {
      gap: 0.25rem;
    }

    .artist-header {
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .avatar {
      width: 56px;
      height: 56px;
    }

    .artist-details {
      flex-direction: column;
      align-items: center;
      gap: 0.45rem;
      width: 100%;
    }

    .artist-meta {
      align-items: center;
      width: 100%;
    }

    .username-line,
    .stat-line,
    .stat-line.short {
      margin-inline: auto;
    }

    .subscribe-socials-container {
      align-items: center;
      gap: 0.45rem;
    }
  }
</style>
