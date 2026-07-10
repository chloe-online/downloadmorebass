<script lang="ts">
  let {
    text,
    lines = 2,
  }: {
    text: string;
    lines?: number;
  } = $props();

  let expanded = $state(false);
  let isTruncatable = $state(false);
  let textEl = $state<HTMLParagraphElement | undefined>();

  function measure() {
    if (!textEl || expanded) {
      return;
    }

    isTruncatable = textEl.scrollHeight > textEl.clientHeight + 1;
  }

  $effect(() => {
    text;
    expanded;
    queueMicrotask(measure);
  });

  function toggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    expanded = !expanded;
  }
</script>

{#if text}
  <div class="expandable-text">
    <p bind:this={textEl} class:clamped={!expanded} style={`--lines: ${lines}`}>
      {text}
    </p>
    {#if isTruncatable || expanded}
      <button type="button" class="toggle" onclick={toggle}>
        {expanded ? "less" : "more"}
      </button>
    {/if}
  </div>
{/if}

<style>
  .expandable-text {
    width: 100%;
  }

  p {
    font-size: 12px;
    margin: 5px 0 0 5px;
    text-align: left;
    line-height: 1.35;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .clamped {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--lines);
    overflow: hidden;
  }

  .toggle {
    display: inline;
    background: none;
    border: none;
    padding: 0;
    margin: 0 0 0 5px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #03c;
    cursor: pointer;
    text-decoration: none;
  }

  .toggle:hover {
    text-decoration: underline;
  }
</style>
