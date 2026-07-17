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
    description = "Enter your email to subscribe for updates about new tracks and more!",
    inputId = "subscribe-email",
    successMessage = "Check your email to confirm",
    variant = "bar",
  }: Props = $props();

  const EMAIL_RE =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

  let email = $state("");
  let website = $state("");
  let submittedEmail = $state("");
  let turnstileToken = $state("");
  let status = $state<"idle" | "loading" | "success" | "error">("idle");
  let resendStatus = $state<"idle" | "loading" | "sent">("idle");
  let errorMessage = $state("");
  let emailInvalid = $state(false);
  let turnstileEl = $state<HTMLDivElement | null>(null);
  let widgetId = $state<string | null>(null);
  let turnstileScale = $state(1);
  let turnstileHeight = $state<number | null>(null);
  let fitObserver: ResizeObserver | null = null;

  function validateEmail(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Enter your email address";
    }
    if (trimmed.length > 254 || !EMAIL_RE.test(trimmed)) {
      return "That's not a real email address dummy";
    }
    return null;
  }

  function onEmailInput() {
    if (emailInvalid || status === "error") {
      emailInvalid = false;
      if (status === "error") {
        status = "idle";
        errorMessage = "";
      }
    }
  }

  function fitTurnstile() {
    if (!turnstileEl) {
      return;
    }
    const widget = turnstileEl.firstElementChild as HTMLElement | null;
    const naturalWidth = widget?.offsetWidth ?? 0;
    const naturalHeight = widget?.offsetHeight ?? 0;
    if (!widget || naturalWidth === 0) {
      turnstileScale = 1;
      turnstileHeight = null;
      return;
    }
    const available = turnstileEl.clientWidth;
    turnstileScale = available > 0 ? Math.min(1, available / naturalWidth) : 1;
    turnstileHeight = naturalHeight * turnstileScale;
  }

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
      // Keep always-visible while testing sizing; switch back to interaction-only later.
      appearance: "interaction-only",
      callback: (token) => {
        turnstileToken = token;
        fitTurnstile();
      },
      "error-callback": () => {
        turnstileToken = "";
      },
      "expired-callback": () => {
        turnstileToken = "";
      },
    });

    // The widget mounts asynchronously and resizes when a challenge appears,
    // so keep it scaled to fit the container.
    fitObserver?.disconnect();
    fitObserver = new ResizeObserver(() => fitTurnstile());
    fitObserver.observe(turnstileEl);
    const widget = turnstileEl.firstElementChild;
    if (widget) {
      fitObserver.observe(widget);
    }
    fitTurnstile();
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
      fitObserver?.disconnect();
      fitObserver = null;
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

    const emailError = validateEmail(email);
    if (emailError) {
      status = "error";
      emailInvalid = true;
      errorMessage = emailError;
      return;
    }

    errorMessage = "";
    emailInvalid = false;
    status = "loading";

    try {
      if (!turnstileToken) {
        throw new Error("Complete the verification check first");
      }
      await subscribeEmail(email, turnstileToken, website);
      submittedEmail = email;
      status = "success";
      resendStatus = "idle";
      email = "";
      website = "";
    } catch (error) {
      status = "error";
      emailInvalid = false;
      errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
    } finally {
      resetTurnstile();
    }
  }

  async function onResend() {
    if (resendStatus === "loading" || !submittedEmail) {
      return;
    }

    errorMessage = "";
    resendStatus = "loading";

    try {
      if (!turnstileToken) {
        throw new Error("Complete the verification check first");
      }
      await subscribeEmail(submittedEmail, turnstileToken, website);
      resendStatus = "sent";
    } catch (error) {
      resendStatus = "idle";
      emailInvalid = false;
      errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
    } finally {
      resetTurnstile();
    }
  }
</script>

<form
  class="subscribe-form"
  class:popup={variant === "popup"}
  novalidate
  onsubmit={onSubmit}
>
  {#if status === "success"}
    <p class="subscribe-message">{successMessage}</p>
    <p class="subscribe-resend">
      {#if resendStatus === "sent"}
        Sent again — check your inbox.
      {:else}
        Not seeing the email?
        <button
          type="button"
          class="subscribe-resend-button"
          onclick={onResend}
          disabled={resendStatus === "loading" || !siteKey || !turnstileToken}
        >
          {resendStatus === "loading" ? "Sending…" : "Send again"}
        </button>
      {/if}
    </p>
  {:else}
    <p class="subscribe-description">{description}</p>
    <div class="subscribe-row">
      <input
        id={inputId}
        class="subscribe-input"
        class:invalid={emailInvalid}
        type="email"
        name="email"
        autocomplete="email"
        maxlength="254"
        required
        placeholder="you@example.com"
        aria-invalid={emailInvalid}
        aria-describedby={status === "error" ? `${inputId}-error` : undefined}
        bind:value={email}
        oninput={onEmailInput}
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
  {/if}
  {#if siteKey}
    <div
      class="turnstile"
      bind:this={turnstileEl}
      style={`--turnstile-scale:${turnstileScale};${
        turnstileHeight !== null ? `height:${turnstileHeight}px;` : ""
      }`}
    ></div>
  {:else if status !== "success"}
    <p class="subscribe-error">Subscribe is unavailable right now</p>
  {/if}
  {#if status === "error"}
    <p id={`${inputId}-error`} class="subscribe-error" role="alert">
      {errorMessage}
    </p>
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

  .subscribe-resend {
    font-family: Arial, sans-serif;
    font-size: 11px;
    color: #666;
    margin: 0;
    width: 100%;
    line-height: 1.35;
    text-align: center;
  }

  .subscribe-resend-button {
    background: none;
    border: none;
    padding: 0;
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: bold;
    color: #03c;
    text-decoration: underline;
    cursor: pointer;
  }

  .subscribe-resend-button:hover:not(:disabled) {
    text-decoration: none;
  }

  .subscribe-resend-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
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

  .subscribe-input.invalid {
    border-color: #a33;
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
    align-items: flex-start;
    width: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .turnstile:empty {
    display: none;
  }

  .turnstile :global(> *) {
    flex-shrink: 0;
    transform: scale(var(--turnstile-scale, 1));
    transform-origin: top center;
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
  .popup .subscribe-error,
  .popup .subscribe-resend {
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
