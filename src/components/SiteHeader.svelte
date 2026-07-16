<script lang="ts">
  import { navigate, homePath } from "../lib/router";
  import { isPlayerAudible, playerPlayback } from "../lib/playback.svelte";
  import { playBassTone } from "../lib/bass";
  import SiteNavBar from "./SiteNavBar.svelte";

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
    navigate(homePath());
  }

  const wooferSrc = $derived(
    isPlayerAudible()
      ? `/woofer.gif?play=${playerPlayback.playId}`
      : "/woofer-still.png",
  );
</script>

<header class="site-header">
  <div class="title-row">
    <button
      type="button"
      class="woofer-button woofer-button--outer"
      aria-label="Play bass tone"
      onclick={() => playBassTone(55.0)}
    >
      <img src={wooferSrc} alt="" class="woofer" />
    </button>
    <button
      type="button"
      class="woofer-button"
      aria-label="Play bass tone"
      onclick={() => playBassTone(55.0)}
    >
      <img src={wooferSrc} alt="" class="woofer" />
    </button>
    <button class="logo-button" onclick={goHome} aria-label="Go to home">
      <img src="/logo.jpg" alt="DownloadMoreBass.com" class="logo" />
    </button>
    <button
      type="button"
      class="woofer-button"
      aria-label="Play bass tone"
      onclick={() => playBassTone(55.0)}
    >
      <img src={wooferSrc} alt="" class="woofer" />
    </button>
    <button
      type="button"
      class="woofer-button woofer-button--outer"
      aria-label="Play bass tone"
      onclick={() => playBassTone(55.0)}
    >
      <img src={wooferSrc} alt="" class="woofer" />
    </button>
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
  <SiteNavBar />
</header>

<style>
  .site-header {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 1rem;
  }

  .logo {
    width: 100%;
    height: auto;
    max-width: 248px;
    max-height: 128px;
    aspect-ratio: 248 / 128;
    object-fit: cover;
    object-position: center;
    margin: 0;
    display: block;
  }

  .logo-button {
    flex: 0 1 248px;
    min-width: 0;
    background: none;
    border: none;
    box-shadow: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    line-height: 0;
  }

  .woofer-button {
    flex: 0 1 128px;
    min-width: 0;
    background: none;
    border: none;
    box-shadow: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    line-height: 0;
  }

  .woofer-button:active .woofer {
    transform: scale(0.94);
  }

  .woofer {
    width: 100%;
    height: auto;
    max-width: 128px;
    aspect-ratio: 1;
    object-fit: contain;
    object-position: center;
    display: block;
    transition: transform 0.08s ease-out;
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.25rem;
    width: 100%;
    min-width: 0;
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
    .woofer-button--outer {
      display: none;
    }

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
</style>
