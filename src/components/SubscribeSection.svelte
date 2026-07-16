<script lang="ts">
  import SubscribeForm from "./SubscribeForm.svelte";
</script>

<section class="subscribe-section" aria-labelledby="subscribe-title">
  <h3 id="subscribe-title" class="subscribe-title">Get notified</h3>
  <SubscribeForm inputId="subscribe-email" />
</section>

<style>
  .subscribe-section {
    border: 1px solid #ccc;
    background: #f9f9f9;
    padding: 0.75rem;
    text-align: center;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .subscribe-title {
    font-family: Arial, sans-serif;
    font-size: 13px;
    font-weight: bold;
    margin: 0 0 0.75rem;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.35rem;
    width: 100%;
    box-sizing: border-box;
  }

</style>
