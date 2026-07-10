<script lang="ts">
  async function handleDownload() {
    const randomBassFile = Math.floor(Math.random() * 3) + 1;
    const bassFile = await fetch(`/bass/${randomBassFile}.wav`);
    const bassFileBlob = await bassFile.blob();
    const bassFileUrl = URL.createObjectURL(bassFileBlob);
    const a = document.createElement("a");
    a.href = bassFileUrl;
    a.download = `bass${randomBassFile}.wav`;
    a.click();
  }
</script>

<aside class="site-main-bar">
  <h3 class="site-main-bar-title">Download More Bass</h3>

  <p class="site-main-bar-description">
    Welcome to downloadmorebass.com, the ultimate destination for those with a
    deep carnal desire for bass.
  </p>

  <div class="download-button">
    <button
      class="download-btn"
      onclick={handleDownload}
      aria-describedby="download-tooltip"
    >
      DOWNLOAD
      <span id="download-tooltip" class="download-tooltip" role="tooltip">
        Click to download bass to your computer.
      </span>
    </button>
  </div>

  <p class="site-main-bar-more-bass">
    Need more bass? <a
      href="https://www.youtube.com/playlist?list=PLBuMJdSkXuzk">click here</a
    >
  </p>
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
    font-family: Arial, sans-serif;
    font-size: 13px;
    font-weight: bold;
    margin: 0 0 0.75rem;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.35rem;
    width: 100%;
    box-sizing: border-box;
  }

  .site-main-bar-description {
    font-size: 12px;
    width: 100%;
    margin: 0 0 1rem;
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
    position: relative;
    font-family: Arial, sans-serif;
    font-size: 1.25rem;
    font-weight: 900;
    color: #333;
    background: transparent
      url(https://web.archive.org/web/20080416013730im_/http://s.ytimg.com/yt/img/master-vfl37165.gif)
      no-repeat scroll 0 -137px;
    border: 1px solid #d3d3d3;
    border-radius: 3px;
    cursor: pointer;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
    transition: all 0.1s ease;
    outline: none;
    padding: 0.375rem 2.5rem;
    line-height: 1;
  }

  .download-btn:hover {
    border-color: #999;
  }

  .download-tooltip {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 0.4rem);
    transform: translateX(-50%);
    width: max-content;
    max-width: 14rem;
    padding: 0.35rem 0.5rem;
    border: 1px solid #999;
    border-radius: 2px;
    background: #ffffe1;
    box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.15);
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: normal;
    line-height: 1.3;
    color: #333;
    text-shadow: none;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.1s ease;
  }

  .download-btn:hover .download-tooltip,
  .download-btn:focus-visible .download-tooltip {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 768px) {
    .download-btn {
      font-size: 1rem;
      padding: 0.3rem 2rem;
    }
  }

  .site-main-bar-more-bass {
    font-size: 12px;
    margin: 0;
    color: #666;
    width: 100%;
  }

  .site-main-bar-more-bass a {
    color: #03c;
    text-decoration: none;
  }

  .site-main-bar-more-bass a:hover {
    text-decoration: underline;
  }
</style>
