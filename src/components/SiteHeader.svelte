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
</header>

<style>
  .site-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
</style>
