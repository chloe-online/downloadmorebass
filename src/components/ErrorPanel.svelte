<script lang="ts">
  let {
    title,
    message,
    contactPrompt = "Still broken?",
    actionLabel,
    actionHref = null,
    onAction,
  }: {
    title: string;
    message: string;
    contactPrompt?: string;
    actionLabel: string;
    actionHref?: string | null;
    onAction?: (event: MouseEvent) => void;
  } = $props();
</script>

<div class="error-panel" role="alert">
  <h2 class="error-panel-title">{title}</h2>
  <p class="error-panel-message">{message}</p>
  <div class="error-panel-actions">
    {#if actionHref}
      <a href={actionHref} class="error-panel-action" onclick={onAction}>
        {actionLabel}
      </a>
    {:else}
      <button type="button" class="error-panel-action" onclick={onAction}>
        {actionLabel}
      </button>
    {/if}
    <p class="error-panel-contact">
      {contactPrompt}
      <a
        href="https://instagram.com/chloemusic8008"
        target="_blank"
        rel="noreferrer">Tell Chloe to fix it</a
      >
    </p>
  </div>
</div>

<style>
  .error-panel {
    border: 1px solid #999;
    background: #f9f9f9;
    padding: 1.25rem 1rem;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
  }

  .error-panel-title {
    margin: 0 0 0.75rem;
    font-size: 19px;
    font-weight: bold;
    color: #333;
  }

  .error-panel-message {
    margin: 0 0 0.5rem;
    font-size: 13px;
    line-height: 1.4;
    color: #333;
  }

  .error-panel-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #ddd;
  }

  .error-panel-action {
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #03c;
    text-decoration: underline;
    cursor: pointer;
    background: #eee;
    border: 1px solid #999;
    border-radius: 3px;
    padding: 6px 14px;
    line-height: 1.2;
  }

  .error-panel-action:hover {
    background: #f5f5f5;
    text-decoration: none;
  }

  .error-panel-contact {
    margin: 0;
    font-size: 12px;
    color: #666;
  }
</style>
