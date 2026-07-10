<script lang="ts">
  import { playBassTone } from "../lib/bass";

  const MIN_TILES = 3;
  const MAX_TILES = 6;
  /** Fixed gap between tiles — must match CSS `gap` on `.woofer-rail`. */
  const TILE_GAP_PX = 8;

  let {
    src,
    height = 0,
    onHeightChange,
  }: {
    src: string;
    height?: number;
    onHeightChange?: (height: number) => void;
  } = $props();

  let railEl = $state<HTMLElement | null>(null);
  let tileCount = $state(MIN_TILES);

  $effect(() => {
    const el = railEl;
    const targetHeight = height;

    if (!el || targetHeight <= 0) {
      return;
    }

    const update = () => {
      const width = el.getBoundingClientRect().width;
      if (width <= 0) {
        return;
      }

      // Square tiles sized to rail width; one extra so the stack fills past
      // the column height (rail grows via min-height so nothing is clipped).
      const tileSize = width;
      const fit = Math.floor(
        (targetHeight + TILE_GAP_PX) / (tileSize + TILE_GAP_PX),
      );
      const next = Math.min(MAX_TILES, Math.max(MIN_TILES, fit + 1));

      if (next !== tileCount) {
        tileCount = next;
      }
    };

    const observer = new ResizeObserver(update);
    observer.observe(el);
    update();

    return () => observer.disconnect();
  });

  $effect(() => {
    const el = railEl;
    if (!el) {
      return;
    }

    const report = () => {
      // Border-box only — margins must not feed into page-main min-height or
      // contentHeight will ratchet upward forever.
      onHeightChange?.(el.getBoundingClientRect().height);
    };

    const observer = new ResizeObserver(report);
    observer.observe(el);
    report();

    return () => observer.disconnect();
  });
</script>

<div
  class="woofer-rail"
  bind:this={railEl}
  style:min-height={height > 0 ? `${height}px` : undefined}
>
  {#each Array(tileCount) as _, i (i)}
    <button
      type="button"
      class="woofer-button"
      aria-label="Play bass tone"
      onclick={() => playBassTone(30.0, 1)}
    >
      <img {src} alt="" class="woofer" />
    </button>
  {/each}
</div>

<style>
  .woofer-rail {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 8px;
    margin-top: 1rem;
    box-sizing: border-box;
    min-height: 0;
    overflow: visible;
  }

  .woofer-button {
    flex: 0 0 auto;
    width: 100%;
    aspect-ratio: 1;
    background: none;
    border: none;
    box-shadow: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    line-height: 0;
    overflow: hidden;
  }

  .woofer-button:active .woofer {
    transform: scale(0.94);
  }

  .woofer {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    transition: transform 0.08s ease-out;
  }
</style>
