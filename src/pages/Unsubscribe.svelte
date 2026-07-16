<script lang="ts">
  import { onMount } from "svelte";
  import { unsubscribeEmail } from "../lib/api";
  import { homePath, navigate } from "../lib/router";

  interface Props {
    token: string | null;
  }

  let { token }: Props = $props();

  let status = $state<"loading" | "success" | "error">("loading");
  let message = $state("Unsubscribing…");

  onMount(async () => {
    if (!token) {
      status = "error";
      message = "This unsubscribe link is invalid";
      return;
    }

    try {
      await unsubscribeEmail(token);
      status = "success";
      message = "You're unsubscribed";
    } catch {
      status = "error";
      message = "This unsubscribe link is invalid";
    }
  });
</script>

<main class="unsubscribe-page">
  <h1>{status === "loading" ? "One moment" : message}</h1>
  {#if status !== "loading"}
    <p>
      <a
        href={homePath()}
        onclick={(event) => {
          event.preventDefault();
          navigate(homePath());
        }}>Back home</a
      >
    </p>
  {/if}
</main>

<style>
  .unsubscribe-page {
    box-sizing: border-box;
    width: 100%;
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: 4rem 1rem;
    font-family: Arial, Helvetica, sans-serif;
  }

  h1 {
    margin: 0 0 1rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #222;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
  }
</style>
