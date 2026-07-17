<script lang="ts">
  let {
    text,
    lines = 2,
    expanded: expandedProp,
    showToggle = true,
    onToggle,
  }: {
    text: string;
    lines?: number;
    expanded?: boolean;
    showToggle?: boolean;
    onToggle?: () => void;
  } = $props();

  let expandedInternal = $state(false);
  let isTruncatable = $state(false);
  let textEl = $state<HTMLParagraphElement | undefined>();

  const expanded = $derived(expandedProp ?? expandedInternal);
  const controlled = $derived(expandedProp !== undefined);

  const fullText = $derived(text);
  const clampedText = $derived(
    text
      .replace(/[ \t]*\n[ \t]*/g, " ")
      .replace(/[ \t]+/g, " ")
      .trim(),
  );
  const displayText = $derived(
    (expanded ? fullText : clampedText).replace(/\n+$/, ""),
  );

  function measure() {
    if (!textEl || expanded) {
      return;
    }

    isTruncatable = textEl.scrollHeight > textEl.clientHeight + 1;
  }

  $effect(() => {
    displayText;
    expanded;
    queueMicrotask(measure);
  });

  function toggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (onToggle) {
      onToggle();
      return;
    }
    if (!controlled) {
      expandedInternal = !expandedInternal;
    }
  }
</script>

{#if text}
  <div class="expandable-text">
    <p
      bind:this={textEl}
      class="body"
      class:clamped={!expanded}
      style={`--lines: ${lines};`}
    >
      {displayText}
    </p>
    {#if showToggle && (controlled || isTruncatable || expanded)}
      <p class="toggle-line">
        (<button type="button" class="toggle" onclick={toggle}
          >{expanded ? "less" : "more"}</button
        >)
      </p>
    {/if}
  </div>
{/if}

<style>
  .expandable-text {
    width: 100%;
    font-size: 12px;
    line-height: 1.35;
    text-align: left;
  }

  .body,
  .toggle-line {
    margin: 0;
    font-size: inherit;
    line-height: inherit;
  }

  .body {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .clamped {
    overflow: hidden;
    max-height: calc(
      1.35em * var(--lines)
    ); /* workaround for text-overflow: clip that doesn't exist for all browsers as of july 2026 */
  }

  .toggle {
    display: inline;
    background: none;
    border: none;
    padding: 0;
    font-family: Arial, sans-serif;
    font-size: inherit;
    line-height: inherit;
    font-weight: bold;
    color: #03c;
    cursor: pointer;
    text-decoration: dotted underline;
  }

  .toggle:hover {
    text-decoration: underline;
  }
</style>
