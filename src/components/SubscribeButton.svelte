<script lang="ts">
  import { onDestroy } from "svelte";
  import SubscribeForm from "./SubscribeForm.svelte";

  interface Props {
    inputId?: string;
    description?: string;
    /** When this value changes, the popup closes (e.g. route slug). */
    resetKey?: string | null;
  }

  let {
    inputId = "subscribe-email",
    description,
    resetKey = undefined,
  }: Props = $props();

  const PANEL_GAP = 6;
  const VIEW_PAD = 16;

  let open = $state(false);
  let buttonEl = $state<HTMLButtonElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);
  let positioned = $state(false);
  let panelStyle = $state("");

  const titleId = $derived(`${inputId}-title`);
  const formDescription = $derived(description);

  let resizeObserver: ResizeObserver | null = null;

  $effect(() => {
    resetKey;
    open = false;
  });

  $effect(() => {
    if (!open || !panelEl) {
      positioned = false;
      return;
    }

    positionPanel();

    const onReposition = () => positionPanel();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    window.visualViewport?.addEventListener("resize", onReposition);
    window.visualViewport?.addEventListener("scroll", onReposition);

    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(onReposition);
    resizeObserver.observe(panelEl);
    if (buttonEl) {
      resizeObserver.observe(buttonEl);
    }

    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
      window.visualViewport?.removeEventListener("resize", onReposition);
      window.visualViewport?.removeEventListener("scroll", onReposition);
      resizeObserver?.disconnect();
      resizeObserver = null;
    };
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
  });

  function positionPanel() {
    if (!buttonEl || !panelEl) {
      return;
    }

    const btn = buttonEl.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    const vw = viewport?.width ?? window.innerWidth;
    const vh = viewport?.height ?? window.innerHeight;
    const viewportRight = viewportLeft + vw;
    const viewportBottom = viewportTop + vh;
    const width = panelEl.offsetWidth;
    const height = panelEl.offsetHeight;
    const maxHeight = Math.max(0, vh - VIEW_PAD * 2);
    const panelHeight = Math.min(height, maxHeight);

    // Prefer opening under the button; flip above only when needed.
    const spaceBelow = viewportBottom - VIEW_PAD - btn.bottom;
    const spaceAbove = btn.top - viewportTop - VIEW_PAD;
    const placeAbove =
      spaceBelow < panelHeight + PANEL_GAP && spaceAbove > spaceBelow;

    // Start left-aligned with the button, then nudge left/right just enough
    // to stay fully on screen (not locked to left/right/center).
    const minLeft = viewportLeft + VIEW_PAD;
    const maxLeft = viewportRight - VIEW_PAD - width;
    const left = Math.min(Math.max(btn.left, minLeft), Math.max(minLeft, maxLeft));

    const desiredTop = placeAbove
      ? btn.top - panelHeight - PANEL_GAP
      : btn.bottom + PANEL_GAP;
    const top = Math.min(
      Math.max(desiredTop, viewportTop + VIEW_PAD),
      viewportBottom - VIEW_PAD - panelHeight,
    );

    panelStyle = `left:${left}px;top:${top}px;max-height:${maxHeight}px;`;
    positioned = true;
  }

  function openPanel() {
    open = true;
  }

  function closePanel() {
    open = false;
    positioned = false;
    panelStyle = "";
  }
</script>

<div class="subscribe-wrap">
  <button
    type="button"
    class="subscribe-button"
    bind:this={buttonEl}
    onclick={openPanel}
  >
    Subscribe
  </button>

  {#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="subscribe-backdrop" onclick={closePanel}></div>
    <div
      class="subscribe-panel"
      class:is-positioned={positioned}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      bind:this={panelEl}
      style={panelStyle}
    >
      <div class="subscribe-panel-header">
        <h2 id={titleId} class="subscribe-panel-title">Like what you hear?</h2>
        <button
          type="button"
          class="subscribe-close"
          aria-label="Close subscribe popup"
          onclick={closePanel}
        >
          [x]
        </button>
      </div>
      <SubscribeForm {inputId} variant="popup" description={formDescription} />
    </div>
  {/if}
</div>

<style>
  .subscribe-wrap {
    position: relative;
    flex-shrink: 0;
    align-self: flex-start;
  }

  .subscribe-button {
    display: inline-block;
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: bold;
    color: #333;
    background: transparent url(/ui-sprite.webp) no-repeat scroll 0 -175px;
    border: 1px solid #c6b070;
    border-radius: 3px;
    padding: 4px 10px;
    text-decoration: none;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
    cursor: pointer;
  }

  .subscribe-button:hover {
    border-color: #9e864a;
  }

  .subscribe-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
  }

  .subscribe-panel {
    position: fixed;
    z-index: 50;
    width: min(16.5rem, calc(100vw - 2rem));
    box-sizing: border-box;
    border: 1px solid #999;
    border-radius: 2px;
    padding: 0.65rem;
    background: #ffffe1;
    box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.15);
    overflow-y: auto;
    visibility: hidden;
    pointer-events: none;
  }

  .subscribe-panel.is-positioned {
    visibility: visible;
    pointer-events: auto;
  }

  .subscribe-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.45rem;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid var(--theme-gray);
  }

  .subscribe-panel-title {
    margin: 0;
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #333;
  }

  .subscribe-close {
    border: none;
    background: transparent;
    color: #03c;
    font-family: Arial, sans-serif;
    font-size: 11px;
    line-height: 1;
    padding: 0;
    cursor: pointer;
    text-decoration: underline;
  }

  .subscribe-close:hover {
    text-decoration: none;
  }
</style>
