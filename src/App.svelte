<script lang="ts">
  import { onMount } from "svelte";
  import Song from "./Song.svelte";

  let audioContext: AudioContext | null = null;
  let isPlaying = false;
  let userInteracted = false;
  let soundEnabled = true;
  let currentOscillator: OscillatorNode | null = null;

  // Create a bass tone using Web Audio API
  function createBassTone() {
    if (!audioContext || !soundEnabled) {
      return;
    }

    // Stop any existing oscillator
    if (currentOscillator) {
      currentOscillator.stop();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Set up bass frequency (around 60-80 Hz for deep bass)
    oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
    oscillator.type = "triangle"; // Sine wave for smooth bass tone

    // Set up volume envelope
    // Create pumping effect by oscillating the gain
    const pumpFrequency = 2; // 2Hz = pump twice per second
    const now = audioContext.currentTime;

    // Start at 0 gain
    gainNode.gain.setValueAtTime(0, now);

    // Create repeating ramp up/down pattern
    for (let i = 0; i < 100; i++) {
      // Arbitrary number of repeats
      const startTime = now + i / pumpFrequency;
      const peakTime = startTime + 0.25 / pumpFrequency;
      const endTime = startTime + 1 / pumpFrequency;

      gainNode.gain.linearRampToValueAtTime(1, peakTime);
      gainNode.gain.linearRampToValueAtTime(0, endTime);
    }

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Store reference to current oscillator
    currentOscillator = oscillator;

    // Play the tone
    oscillator.start(audioContext.currentTime);

    isPlaying = true;
  }

  // Toggle sound on/off
  function toggleSound() {
    soundEnabled = !soundEnabled;

    if (!soundEnabled && currentOscillator) {
      // Stop the current oscillator
      currentOscillator.stop();
      currentOscillator = null;
      isPlaying = false;
    } else if (soundEnabled && audioContext) {
      // Start the bass tone
      createBassTone();
    }
  }

  // download a random bass file
  async function handleUserInteraction() {
    const randomBassFile = Math.floor(Math.random() * 3) + 1;
    const bassFile = await fetch(`/bass/${randomBassFile}.wav`);
    const bassFileBlob = await bassFile.blob();
    const bassFileUrl = URL.createObjectURL(bassFileBlob);
    const a = document.createElement("a");
    a.href = bassFileUrl;
    a.download = `bass${randomBassFile}.wav`;
    a.click();
  }

  onMount(() => {
    try {
      audioContext = new AudioContext();

      // Attempt to play immediately (may be blocked by browser)
      createBassTone();
    } catch (error) {
      console.log("Audio context creation failed:", error);
    }
  });
</script>

<main>
  <div class="header">
    <div class="title-row">
      <h1>Download more bass</h1>
      <button
        class="sound-toggle"
        on:click={toggleSound}
        class:sound-enabled={soundEnabled}
      >
        {soundEnabled ? "(on)" : "(off)"}
      </button>
    </div>
    <div class="download-button">
      <button on:click={handleUserInteraction}>DOWNLOAD</button>
      <p>Click the button to download bass to your computer.</p>
    </div>
  </div>
  <div class="container">
    <div class="playlist">
      <div class="featured-songs">
        <h2>Featured songs</h2>
        <p>Featured songs selected by chloemusic</p>
      </div>
      <ul>
        <li>
          <Song
            cover="/covers/tearyouapart_cover.png"
            title="Tear you apart"
            description="A song about me ripping your head off, eating your guts, your brain, your intestines, and spreading your sanguine fluid over my nudile body."
            duration="02:23"
            artist="chloemusic"
            artistUrl="https://soundcloud.com/chloemusic8008"
            url="https://soundcloud.com/chloemusic8008/tear-you-apart"
            stars={3}
          />
        </li>
        <li>
          <p>...more coming soon...</p>
        </li>
      </ul>
    </div>
  </div>
  <div class="footer">
    <p>
      Copyright 2025 <a href="https://chlo.club/">chloemusic</a> dm me your bass
      <a href="https://instagram.com/chloemusic8008">here</a>
    </p>
    <p>All rights reserved bitch</p>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
  }

  .header {
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
    margin-bottom: 1rem;
  }

  .header h1 {
    font-size: 4rem;
    font-weight: 900;
    color: #000;
    margin: 0;
  }

  .sound-toggle {
    background: none;
    border: none;
    box-shadow: none;
    font-family: "Arial", sans-serif;
    font-size: 4rem;
    font-weight: 900;
    color: #000;
    cursor: pointer;
    outline: none;
    transition: opacity 0.2s ease;
    padding: 0;
    margin: 0;
  }

  .sound-toggle:hover {
    opacity: 0.7;
  }

  .sound-toggle:not(.sound-enabled) {
    color: #666;
  }

  .download-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    text-align: center;
    flex-direction: row;
    justify-content: space-between;
    background-color: #f0f0f0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .playlist {
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: left;
  }

  .featured-songs {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    justify-content: flex-start;
    border-top: 1px solid #bbb;
    border-bottom: 1px solid #bbb;
    margin-bottom: 20px;
  }

  .featured-songs h2 {
    margin: 0;
    font-size: 19px;
  }

  .featured-songs p {
    margin: 0;
    font-size: 12px;
  }

  .playlist ul {
    list-style: none;
    margin: 0;
  }

  .playlist ul li {
    padding: 8px;
  }

  .playlist ul li:not(:last-child) {
    border-bottom: 1px dotted #bbb;
  }

  .playlist ul li:not(:first-child) {
    border-top: 1px dotted #bbb;
  }

  h1 {
    font-family: "Arial", sans-serif;
    font-size: 4rem;
    font-weight: 900;
    color: #000;
  }

  .footer p {
    font-family: "Arial", sans-serif;
    font-size: 12px;
    color: #666;
  }

  button {
    font-family: "Arial", sans-serif;
    font-size: 12px;
    font-weight: bold;
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
    position: relative;
    outline: none;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .header h1 {
      font-size: 2.5rem;
    }

    .sound-toggle {
      font-size: 2.5rem;
    }

    .title-row {
      flex-direction: column;
      gap: 0.25rem;
    }

    .download-button {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }

    .download-button p {
      font-size: 14px;
      margin: 0;
    }

    .container {
      padding: 0.5rem;
    }

    .footer {
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.75rem;
    }

    .footer p {
      font-size: 11px;
      margin: 0;
    }

    .playlist {
      width: 100%;
    }

    .featured-songs {
      padding: 0.5rem 0;
    }

    .featured-songs h2 {
      font-size: 16px;
    }

    .featured-songs p {
      font-size: 11px;
    }
  }

  @media (max-width: 480px) {
    .header {
      padding: 0.5rem;
    }

    .header h1 {
      font-size: 2rem;
    }

    .sound-toggle {
      font-size: 2rem;
    }

    .container {
      padding: 0.25rem;
    }

    .footer {
      padding: 0.5rem;
    }
  }
</style>
