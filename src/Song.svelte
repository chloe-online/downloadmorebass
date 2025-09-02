<script>
  let { cover, title, description, artist, artistUrl, url, duration } =
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
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span>★</span>
    </div>
    <p><b>{duration}</b></p>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .cover {
    border: 1px solid black;
  }

  .song-info {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    padding: 1rem;
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

  .vertical-line {
    width: 1px;
    height: 100px;
    background-color: #000;
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
    border: 1px solid #fff;
  }
</style>
