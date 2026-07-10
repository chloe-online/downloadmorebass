<script lang="ts">
  import { onMount } from "svelte";
  import Home from "./pages/Home.svelte";
  import Watch from "./pages/Watch.svelte";
  import WooferRail from "./components/WooferRail.svelte";
  import { getLocation, initRouter, subscribe } from "./lib/router";
  import type { Location } from "./lib/router";
  import {
    isPlayerAudible,
    playerPlayback,
    resetPlayerPlayback,
  } from "./lib/playback.svelte";

  let location = $state<Location>(getLocation());
  let mainEl = $state<HTMLElement | null>(null);
  /** Natural content height for rail tile counts — never includes stretch-to-rails space. */
  let contentHeight = $state(0);
  /** Rail column height; main column min-height matches so the footer sits at the bottom. */
  let railHeight = $state(0);

  onMount(() => {
    const cleanupRouter = initRouter();
    const unsubscribe = subscribe((next) => {
      location = next;
    });

    return () => {
      unsubscribe();
      cleanupRouter();
    };
  });

  $effect(() => {
    if (location.route !== "listen") {
      resetPlayerPlayback();
    }
  });

  /** Height of an element's contents, ignoring flex-grow stretch on the element itself. */
  function contentBoxHeight(el: HTMLElement): number {
    const style = getComputedStyle(el);
    const paddingY =
      (parseFloat(style.paddingTop) || 0) +
      (parseFloat(style.paddingBottom) || 0);

    if (el.children.length === 0) {
      return el.scrollHeight;
    }

    let total = paddingY;
    for (const child of el.children) {
      const childEl = child as HTMLElement;
      const childStyle = getComputedStyle(childEl);
      const mt =
        childStyle.marginTop === "auto"
          ? 0
          : parseFloat(childStyle.marginTop) || 0;
      const mb =
        childStyle.marginBottom === "auto"
          ? 0
          : parseFloat(childStyle.marginBottom) || 0;
      total += childEl.offsetHeight + mt + mb;
    }
    return total;
  }

  /**
   * Page height from real content only. Flex-grow / margin-top:auto spacers are
   * ignored so stretching the column to match the rails cannot feed back.
   */
  function measureIntrinsicHeight(pageMain: HTMLElement): number {
    const page = pageMain.firstElementChild as HTMLElement | null;
    if (!page) {
      return 0;
    }

    let total = 0;
    for (const child of page.children) {
      const el = child as HTMLElement;
      const style = getComputedStyle(el);
      const mt =
        style.marginTop === "auto" ? 0 : parseFloat(style.marginTop) || 0;
      const mb =
        style.marginBottom === "auto" ? 0 : parseFloat(style.marginBottom) || 0;
      const flexGrow = parseFloat(style.flexGrow) || 0;

      const h =
        flexGrow > 0 || style.marginTop === "auto"
          ? contentBoxHeight(el)
          : el.offsetHeight;

      total += h + mt + mb;
    }

    const mainStyle = getComputedStyle(pageMain);
    total +=
      (parseFloat(mainStyle.paddingTop) || 0) +
      (parseFloat(mainStyle.paddingBottom) || 0);

    return total;
  }

  $effect(() => {
    const el = mainEl;
    if (!el) {
      return;
    }

    const update = () => {
      const next = Math.max(measureIntrinsicHeight(el), window.innerHeight);
      if (Math.abs(next - contentHeight) > 0.5) {
        contentHeight = next;
      }
    };

    const observer = new ResizeObserver(update);
    observer.observe(el);
    const page = el.firstElementChild;
    if (page) {
      observer.observe(page);
      for (const child of page.children) {
        observer.observe(child);
      }
    }
    update();

    return () => observer.disconnect();
  });

  function onRailHeight(height: number) {
    if (Math.abs(height - railHeight) > 0.5) {
      railHeight = height;
    }
  }

  const railImage = $derived(
    isPlayerAudible()
      ? `/woofer.gif?play=${playerPlayback.playId}`
      : "/woofer-still.png",
  );

  const pageMinHeight = $derived(
    railHeight > 0 ? `max(100vh, ${railHeight}px)` : "100vh",
  );
</script>

<div class="page-shell">
  <WooferRail
    src={railImage}
    height={contentHeight}
    onHeightChange={onRailHeight}
  />
  <div class="page-main" bind:this={mainEl} style:min-height={pageMinHeight}>
    {#if location.route === "listen"}
      <Watch slug={location.slug} />
    {:else}
      <Home />
    {/if}
  </div>
  <WooferRail
    src={railImage}
    height={contentHeight}
    onHeightChange={onRailHeight}
  />
</div>

<style>
  .page-shell {
    display: grid;
    grid-template-columns: 1fr minmax(0, var(--layout-max)) 1fr;
    align-items: start;
    min-height: 100vh;
    width: 100%;
  }

  .page-main {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .page-shell :global(.woofer-rail) {
    min-width: 0;
  }

  @media (max-width: 1023px) {
    .page-shell {
      display: block;
    }

    .page-shell :global(.woofer-rail) {
      display: none;
    }
  }
</style>
