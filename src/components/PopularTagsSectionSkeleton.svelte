<script lang="ts">
  /** Varied widths/heights to mimic the tag cloud size range (12–22px). */
  const TAG_PLACEHOLDERS = [
    { width: "4.5rem", height: 14 },
    { width: "3.2rem", height: 18 },
    { width: "5.5rem", height: 12 },
    { width: "2.8rem", height: 16 },
    { width: "6rem", height: 20 },
    { width: "3.8rem", height: 13 },
    { width: "4.2rem", height: 17 },
    { width: "5rem", height: 15 },
    { width: "3.5rem", height: 22 },
    { width: "4.8rem", height: 14 },
    { width: "2.5rem", height: 12 },
    { width: "5.2rem", height: 19 },
    { width: "3rem", height: 16 },
    { width: "4rem", height: 13 },
    { width: "6.5rem", height: 18 },
    { width: "3.6rem", height: 15 },
  ] as const;
</script>

<div class="popular-tags-container" aria-hidden="true">
  <div class="skeleton heading"></div>
  <section class="popular-tags">
    <div class="tag-cloud">
      {#each TAG_PLACEHOLDERS as tag, i (i)}
        <div
          class="skeleton tag"
          style="width: {tag.width}; height: {tag.height}px"
        ></div>
      {/each}
    </div>
  </section>
</div>

<style>
  .popular-tags-container {
    width: 100%;
    min-width: 0;
  }

  .heading {
    height: calc(19px * 1.5);
    width: 7.5rem;
    margin: 0;
  }

  .popular-tags {
    border: 1px solid #ccc;
    background: #f9f9f9;
    padding: 0.5rem;
    text-align: left;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem 0.65rem;
  }

  .tag {
    flex-shrink: 0;
    max-width: min(100%, 14ch);
  }

  @media (max-width: 768px) {
    .tag-cloud {
      gap: 0.25rem 0.45rem;
    }
  }
</style>
