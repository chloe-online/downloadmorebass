<script lang="ts">
  import { onMount } from "svelte";
  import Home from "./pages/Home.svelte";
  import Watch from "./pages/Watch.svelte";
  import { getLocation, initRouter, subscribe } from "./lib/router";
  import type { Location } from "./lib/router";

  let location = $state<Location>(getLocation());

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
</script>

{#if location.route === "listen"}
  <Watch slug={location.slug} />
{:else}
  <Home />
{/if}
