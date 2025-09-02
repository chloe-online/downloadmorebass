<script>
  let { cover, title, description, artist, artistUrl, url, duration, stars } =
    $props();
</script>

<main>
  <div class="cover">
    <a href={url}><img src={cover} alt={title} /></a>
  </div>
  <div class="song-info">
    <a href={url} download><h1>{title}</h1></a>
    <p>{description}</p>
  </div>

  <div class="artist-details">
    <p>From: <a href={artistUrl}>{artist}</a></p>
    <p>Listens: 69 <invisible>nice</invisible></p>
    <!-- stars -->
    <div class="stars">
      {#each Array(5) as _, i}
        <span style="color: {i < stars ? 'currentColor' : '#ccc'}">★</span>
      {/each}
    </div>
    <p><b>{duration}</b></p>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: row;
    align-items: top;
    justify-content: top;
    gap: 0.5rem;
  }

  .song-info {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    width: 200px;
  }

  h1 {
    font-size: 14px;
    margin: 5px;
  }

  p {
    font-size: 12px;
    margin: 5px;
    text-align: left;
  }

  p invisible {
    color: #fff;
  }

  p invisible:hover {
    color: #000;
  }

  .artist-details {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    margin-left: 5px;
    padding-left: 5px;
    border-left: 1px solid #bbb;
  }

  .artist-details p {
    margin: 5px;
    padding: 0;
    line-height: 14px;
  }

  img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 1px;
    border: 1px solid #000;
  }

  .stars {
    color: red;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    main {
      flex-direction: row;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .song-info {
      width: auto;
      flex: 1;
      text-align: left;
      align-items: flex-start;
    }

    .artist-details {
      margin-left: 0.5rem;
      padding-left: 0.5rem;
      border-left: 1px solid #bbb;
      border-top: none;
      padding-top: 0;
      align-items: flex-start;
      text-align: left;
      min-width: 120px;
    }

    img {
      width: 60px;
      height: 60px;
    }

    h1 {
      font-size: 14px;
    }

    p {
      font-size: 11px;
    }

    .artist-details p {
      line-height: 14px;
    }
  }

  @media (max-width: 480px) {
    main {
      gap: 0.25rem;
    }

    img {
      width: 50px;
      height: 50px;
    }

    h1 {
      font-size: 12px;
    }

    p {
      font-size: 10px;
    }

    .artist-details {
      min-width: 100px;
      margin-left: 0.25rem;
      padding-left: 0.25rem;
    }

    .artist-details p {
      line-height: 12px;
    }
  }
</style>
