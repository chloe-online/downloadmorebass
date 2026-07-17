<script lang="ts">
  let {
    stars,
    likes,
    size = "default",
  }: {
    stars: number;
    likes: number;
    size?: "default" | "large";
  } = $props();

  let open = $state(false);
  let rootEl: HTMLButtonElement | undefined = $state();

  const likesLabel = $derived(`Likes: ${likes.toLocaleString()}`);
  const tooltipId = `likes-tooltip-${crypto.randomUUID()}`;

  function isTouchUi() {
    return window.matchMedia("(hover: none), (pointer: coarse)").matches;
  }

  function handleClick(event: MouseEvent) {
    if (!isTouchUi()) return;
    event.preventDefault();
    event.stopPropagation();
    open = !open;
  }

  $effect(() => {
    if (!open) return;

    function onDocPointerDown(event: PointerEvent) {
      if (rootEl && !rootEl.contains(event.target as Node)) {
        open = false;
      }
    }

    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  });
</script>

<button
  bind:this={rootEl}
  type="button"
  class="stars-rating"
  class:large={size === "large"}
  class:open
  aria-label={likesLabel}
  aria-describedby={tooltipId}
  onclick={handleClick}
>
  <span class="stars" aria-hidden="true">
    {#each Array(5) as _, i}
      <span class:filled={i < stars}>★</span>
    {/each}
  </span>
  <span id={tooltipId} class="likes-tooltip" role="tooltip">
    {likesLabel}
  </span>
</button>

<style>
  .stars-rating {
    position: relative;
    display: inline-flex;
    align-items: center;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    font: inherit;
    font-size: 18px;
    line-height: 1;
    vertical-align: text-bottom;
    cursor: default;
    outline: none;
  }

  .stars-rating.large {
    font-size: 24px;
    line-height: 0.7;
  }

  @media (hover: none), (pointer: coarse) {
    .stars-rating {
      cursor: pointer;
    }
  }

  .stars {
    display: inline-flex;
    align-items: flex-start;
    gap: 0;
    color: #ccc;
    letter-spacing: 0;
  }

  .stars span {
    display: block;
    margin: 0;
    padding: 0;
    line-height: inherit;
  }

  .stars .filled {
    color: #c00;
  }

  .likes-tooltip {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 0.35rem);
    transform: translateX(-50%);
    width: max-content;
    max-width: 10rem;
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
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.1s ease;
    z-index: 20;
  }

  @media (hover: hover) and (pointer: fine) {
    .stars-rating:hover .likes-tooltip,
    .stars-rating:focus-visible .likes-tooltip {
      opacity: 1;
      visibility: visible;
    }
  }

  .stars-rating.open .likes-tooltip {
    opacity: 1;
    visibility: visible;
  }
</style>
