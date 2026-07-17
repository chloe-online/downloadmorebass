<script lang="ts">
  import { homePath, navigate } from "../lib/router";
  import { popularTags } from "../lib/tracks";
  import type { Track } from "../../shared/types";

  const MIN_SIZE_PX = 12;
  const MAX_SIZE_PX = 22;

  let { tracks }: { tracks: Track[] } = $props();

  const tags = $derived.by(() => {
    const ranked = popularTags(tracks);
    if (ranked.length === 0) {
      return [];
    }

    const counts = ranked.map((entry) => entry.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const range = maxCount - minCount;

    return ranked
      .map((entry) => ({
        tag: entry.tag,
        isGenre: entry.isGenre,
        sizePx:
          range === 0
            ? (MIN_SIZE_PX + MAX_SIZE_PX) / 2
            : MIN_SIZE_PX +
              ((entry.count - minCount) / range) * (MAX_SIZE_PX - MIN_SIZE_PX),
      }))
      .sort(
        (a, b) =>
          hashTag(a.tag) - hashTag(b.tag) ||
          a.tag.localeCompare(b.tag, undefined, { sensitivity: "base" }),
      );
  });

  /** Deterministic FNV-1a hash so tag order is stable across loads. */
  function hashTag(tag: string): number {
    let hash = 3166136261;
    const key = tag.toLowerCase();
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function openTag(event: MouseEvent, tag: string) {
    event.preventDefault();
    navigate(homePath(tag));
    window.scrollTo(0, 0);
  }
</script>

{#if tags.length > 0}
  <div class="popular-tags-container">
    <h2>Popular tags</h2>
    <section class="popular-tags">
      <div class="tag-cloud">
        {#each tags as { tag, sizePx, isGenre } (tag)}
          <a
            class="tag-link"
            class:genre={isGenre}
            href={homePath(tag)}
            style="font-size: {sizePx}px"
            onclick={(event) => openTag(event, tag)}>{tag}</a
          >
        {/each}
      </div>
    </section>
  </div>
{/if}

<style>
  .popular-tags-container {
    width: 100%;
    min-width: 0;
  }

  h2 {
    margin: 0;
    font-size: 19px;
    font-weight: bold;
    color: #333;
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

  .tag-link {
    font-family: Arial, sans-serif;
    line-height: 1.3;
    color: #03c;
    text-decoration: none;
  }

  .tag-link.genre {
    color: #000;
  }

  .tag-link:hover {
    text-decoration: underline;
  }
</style>
