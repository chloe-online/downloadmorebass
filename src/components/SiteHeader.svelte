<script lang="ts">
  import { navigate } from "../lib/router";

  let {
    showSoundToggle = false,
    soundEnabled = false,
    onToggleSound = () => {},
  }: {
    showSoundToggle?: boolean;
    soundEnabled?: boolean;
    onToggleSound?: () => void;
  } = $props();

  function goHome(event: MouseEvent) {
    event.preventDefault();
    navigate("/");
  }

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

<header class="site-header">
  <div class="title-row">
    <a class="site-title" href="/" onclick={goHome}>Download more bass</a>
    {#if showSoundToggle}
      <button
        class="sound-toggle"
        onclick={onToggleSound}
        class:sound-enabled={soundEnabled}
      >
        {soundEnabled ? "(on)" : "(off)"}
      </button>
    {/if}
  </div>

  <div class="download-button">
    <button class="download-btn" onclick={handleDownload}>DOWNLOAD</button>
    <p>&larr; Click the button to download bass to your computer.</p>
  </div>
</header>

<style>
  .site-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    padding: 1rem;
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .site-title {
    font-family: "Arial", sans-serif;
    font-size: 4rem;
    font-weight: 900;
    color: #000;
    margin: 0;
    text-decoration: none;
    cursor: pointer;
  }

  .site-title:hover {
    text-decoration: underline;
  }

  .sound-toggle {
    background: none;
    border: none;
    box-shadow: none;
    font-family: "Arial", sans-serif;
    font-size: 4rem;
    font-weight: 900;
    color: #666;
    cursor: pointer;
    outline: none;
    padding: 0;
    margin: 0;
  }

  .sound-toggle.sound-enabled {
    color: #000;
  }

  @media (max-width: 768px) {
    .site-title {
      font-size: 2.5rem;
    }

    .sound-toggle {
      font-size: 2.5rem;
    }
  }

  @media (max-width: 480px) {
    .site-title {
      font-size: 2rem;
    }

    .sound-toggle {
      font-size: 2rem;
    }
  }

  .download-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
    width: 100%;
  }

  .download-button p {
    font-family: Arial, sans-serif;
    font-size: 14px;
    margin: 0;
    color: #333;
  }

  .download-btn {
    font-family: Arial, sans-serif;
    font-size: 1.5rem;
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

  @media (max-width: 768px) {
    .download-button {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }

    .download-btn {
      font-size: 1rem;
      padding: 0.3rem 2rem;
    }
  }
</style>
