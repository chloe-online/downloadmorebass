<script lang="ts">
  import { onMount } from "svelte";
  import { subscribeEmail } from "../lib/api";

  interface Props {
    description?: string;
    inputId?: string;
    successMessage?: string;
    variant?: "bar" | "popup";
  }

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";
  const turnstileReadyEvent = "downloadmorebass:turnstile-ready";
  const turnstileScriptUrl =
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";

  let {
    description = "New songs drop on SoundCloud — get an email when they do.",
    inputId = "subscribe-email",
    successMessage = "Check your email to confirm",
    variant = "bar",
  }: Props = $props();

  let email = $state("");
  let website = $state("");
  let turnstileToken = $state("");
  let status = $state<"idle" | "loading" | "success" | "error">("idle");
  let errorMessage = $state("");
  let turnstileEl = $state<HTMLDivElement | null>(null);
  let widgetId = $state<string | null>(null);

  function resetTurnstile() {
    turnstileToken = "";
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId);
    }
  }

  function renderTurnstile() {
    if (!turnstileEl || !siteKey || !window.turnstile || widgetId) {
      return;
    }

    widgetId = window.turnstile.render(turnstileEl, {
      sitekey: siteKey,
      action: "subscribe",
      theme: "light",
      size: "flexible",
      // Keep the widget hidden unless Cloudflare needs a challenge.
      appearance: "interaction-only",
      callback: (token) => {
        turnstileToken = token;
      },
      "error-callback": () => {
        turnstileToken = "";
      },
      "expired-callback": () => {
        turnstileToken = "";
      },
    });
  }

  function loadTurnstileScript() {
    if (!siteKey) {
      return;
    }

    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    document.addEventListener(turnstileReadyEvent, renderTurnstile, {
      once: true,
    });

    window.onTurnstileLoad = () => {
      document.dispatchEvent(new Event(turnstileReadyEvent));
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile="1"]',
    );
    if (existing) {
      return;
    }

    const script = document.createElement("script");
    script.src = turnstileScriptUrl;
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "1";
    document.head.appendChild(script);
  }

  onMount(() => {
    loadTurnstileScript();
    return () => {
      document.removeEventListener(turnstileReadyEvent, renderTurnstile);
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  });

  $effect(() => {
    if (turnstileEl && siteKey) {
      loadTurnstileScript();
    }
  });

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (status === "loading") {
      return;
    }

    errorMessage = "";
    status = "loading";

    try {
      if (!turnstileToken) {
        throw new Error("Complete the verification check first");
      }
      await subscribeEmail(email, turnstileToken, website);
      status = "success";
      email = "";
      website = "";
    } catch (error) {
      status = "error";
      errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
    } finally {
      resetTurnstile();
    }
  }
</script>

<form class="subscribe-form" class:popup={variant === "popup"} onsubmit={onSubmit}>
  {#if status === "success"}
    <p class="subscribe-message">{successMessage}</p>
  {:else}
    <p class="subscribe-description">{description}</p>
    <div class="subscribe-row">
      <input
        id={inputId}
        class="subscribe-input"
        type="email"
        name="email"
        autocomplete="email"
        maxlength="254"
        required
        placeholder="you@example.com"
        bind:value={email}
        disabled={status === "loading"}
      />
      <button
        class="subscribe-button"
        type="submit"
        disabled={status === "loading" || !siteKey || !turnstileToken}
      >
        {status === "loading" ? "…" : "Subscribe"}
      </button>
    </div>
    <input
      class="subscribe-honeypot"
      type="text"
      name="website"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
      bind:value={website}
    />
    {#if siteKey}
      <div class="turnstile" bind:this={turnstileEl}></div>
    {:else}
      <p class="subscribe-error">Subscribe is unavailable right now</p>
    {/if}
    {#if status === "error"}
      <p class="subscribe-error">{errorMessage}</p>
    {/if}
  {/if}
</form>

<style>
  .subscribe-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .subscribe-description,
  .subscribe-message,
  .subscribe-error {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #666;
    margin: 0 0 0.75rem;
    width: 100%;
    line-height: 1.35;
    text-align: center;
  }

  .subscribe-message {
    color: #333;
    margin-bottom: 0;
  }

  .subscribe-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .subscribe-input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #ccc;
    background: #fff;
    color: #222;
    font-family: Arial, sans-serif;
    font-size: 12px;
    padding: 0.4rem 0.5rem;
    text-align: center;
  }

  .subscribe-button {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #999;
    background: #eee;
    color: #222;
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    padding: 0.4rem 0.55rem;
    cursor: pointer;
  }

  .subscribe-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .subscribe-honeypot {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .turnstile {
    display: flex;
    justify-content: center;
    width: 100%;
    min-height: 0;
  }

  .turnstile:empty {
    display: none;
  }

  .subscribe-error {
    color: #a33;
    margin-bottom: 0;
  }

  .popup {
    gap: 0.4rem;
    align-items: stretch;
  }

  .popup .subscribe-description,
  .popup .subscribe-message,
  .popup .subscribe-error {
    text-align: left;
    font-size: 11px;
    margin: 0;
  }

  .popup .subscribe-row {
    flex-direction: column;
    gap: 0.35rem;
  }

  .popup .subscribe-input {
    text-align: left;
    font-size: 11px;
    padding: 0.3rem 0.4rem;
  }

  .popup .subscribe-button {
    font-size: 11px;
    padding: 0.3rem 0.45rem;
  }
</style>
