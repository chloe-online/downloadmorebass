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
</div>

<style>
  .home-layout {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    width: 100%;
    max-width: var(--layout-max);
    margin: 0 auto;
  }

  .tracks-column {
    width: 100%;
    max-width: var(--song-max);
    flex-shrink: 0;
    min-width: 0;
  }

  .site-sidebar {
    flex: 1;
    min-width: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    /* position: sticky; */
    top: 1rem;
  }

  @media (max-width: 768px) {
    .home-layout {
      flex-direction: column;
    }

    .tracks-column {
      max-width: 100%;
    }

    .site-sidebar {
      position: static;
      width: 100%;
      flex: 1 1 100%;
    }
  }
</style>
