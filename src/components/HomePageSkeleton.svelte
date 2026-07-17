<script lang="ts">
  import FeaturedPlaylistSkeleton from "./FeaturedPlaylistSkeleton.svelte";
  import SearchResultsSkeleton from "./SearchResultsSkeleton.svelte";
  import SiteMainBarSkeleton from "./SiteMainBarSkeleton.svelte";
  import FeaturedArtistSectionSkeleton from "./FeaturedArtistSectionSkeleton.svelte";

  let { searchQuery = null }: { searchQuery?: string | null } = $props();
</script>

<div class="home-layout" aria-hidden="true">
  <div class="tracks-column">
    {#if searchQuery}
      <SearchResultsSkeleton />
    {:else}
      <FeaturedPlaylistSkeleton />
    {/if}
  </div>

  <aside class="site-sidebar">
    <SiteMainBarSkeleton />
    <FeaturedArtistSectionSkeleton />
  </aside>

  <div class="back-to-top-container">
    <div class="skeleton back-to-top"></div>
  </div>
</div>

<style>
  .home-layout {
    display: grid;
    grid-template-columns: minmax(0, var(--song-max)) minmax(0, 1fr);
    grid-template-areas:
      "tracks sidebar"
      "back .";
    column-gap: 1rem;
    row-gap: 0;
    align-items: start;
    width: 100%;
    max-width: var(--layout-max);
    margin: 0 auto;
  }

  .tracks-column {
    grid-area: tracks;
    width: 100%;
    max-width: var(--song-max);
    min-width: 0;
  }

  .site-sidebar {
    grid-area: sidebar;
    min-width: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    /* position: sticky; */
    top: 1rem;
  }

  .back-to-top-container {
    grid-area: back;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .back-to-top {
    height: 1.2em;
    width: 5.5em;
  }

  @media (max-width: 768px) {
    .home-layout {
      grid-template-columns: 1fr;
      grid-template-areas:
        "tracks"
        "sidebar"
        "back";
      row-gap: 1rem;
    }

    .tracks-column {
      max-width: 100%;
    }

    .site-sidebar {
      position: static;
      width: 100%;
    }
  }
</style>
