<script lang="ts">
  import { onDestroy } from "svelte";
  import SubscribeForm from "./SubscribeForm.svelte";

  interface Props {
    artistUsername: string;
    inputId?: string;
    description?: string;
    /** When this value changes, the popup closes (e.g. route slug). */
    resetKey?: string | null;
  }

  let {
    artistUsername,
    inputId = "subscribe-email",
    description,
    resetKey = undefined,
  }: Props = $props();

  const PANEL_GAP = 6;
  const VIEW_PAD = 16;

  let open = $state(false);
  let buttonEl = $state<HTMLButtonElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);
  let placeAbove = $state(false);
  let alignEnd = $state(false);
  let positioned = $state(false);

  const titleId = $derived(`${inputId}-title`);
  const formDescription = $derived(
    description ?? `enter your email to keep up with ${artistUsername}`,
  );

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

    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(onReposition);
    resizeObserver.observe(panelEl);
    if (buttonEl) {
      resizeObserver.observe(buttonEl);
    }

    return () => {
      window.removeEventListener("resize", onReposition);
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
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = panelEl.offsetWidth;
    const height = panelEl.offsetHeight;

    const spaceBelow = vh - VIEW_PAD - btn.bottom;
    const spaceAbove = btn.top - VIEW_PAD;
    placeAbove =
      spaceBelow < height + PANEL_GAP && spaceAbove > spaceBelow;

    const fitsStart = btn.left + width <= vw - VIEW_PAD;
    const fitsEnd = btn.right - width >= VIEW_PAD;
    if (fitsStart) {
      alignEnd = false;
    } else if (fitsEnd) {
      alignEnd = true;
    } else {
      alignEnd = btn.left + btn.width / 2 > vw / 2;
    }

    positioned = true;
  }

  function openPanel() {
    open = true;
  }

  function closePanel() {
    open = false;
    positioned = false;
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
      class:place-above={placeAbove}
      class:align-end={alignEnd}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      bind:this={panelEl}
    >
      <div class="subscribe-panel-header">
        <h2 id={titleId} class="subscribe-panel-title">Subscribe</h2>
        <button
          type="button"
          class="subscribe-close"
          aria-label="Close subscribe popup"
          onclick={closePanel}
        >
          [x]
        </button>
      </div>
      <SubscribeForm
        {inputId}
        variant="popup"
        description={formDescription}
      />
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
    background: transparent
      url(https://web.archive.org/web/20080416013730im_/http://s.ytimg.com/yt/img/master-vfl37165.gif)
      no-repeat scroll 0 -137px;
    border: 1px solid #d3d3d3;
    border-radius: 3px;
    padding: 4px 10px;
    text-decoration: none;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
    cursor: pointer;
  }

  .subscribe-button:hover {
    border-color: #999;
  }

  .subscribe-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
  }

  .subscribe-panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 50;
    width: min(16.5rem, calc(100vw - 2rem));
    box-sizing: border-box;
    border: 1px solid #999;
    border-radius: 2px;
    padding: 0.65rem;
    background: #ffffe1;
    box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.15);
    visibility: hidden;
    pointer-events: none;
  }

  .subscribe-panel.place-above {
    top: auto;
    bottom: calc(100% + 6px);
  }

  .subscribe-panel.align-end {
    left: auto;
    right: 0;
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
    border-bottom: 1px solid #ddd;
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
