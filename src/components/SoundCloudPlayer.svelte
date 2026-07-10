<script lang="ts">
  let {
    url,
    visual = false,
    height = visual ? 300 : 166,
  }: {
    url: string;
    visual?: boolean;
    height?: number;
  } = $props();

  const playerSrc = $derived(
    `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=${visual}`,
  );
</script>

<iframe
  title="SoundCloud player"
  src={playerSrc}
  width="100%"
  {height}
  scrolling="no"
  frameborder="no"
  allow="autoplay"
  loading="lazy"
></iframe>

<style>
  iframe {
    display: block;
    border: none;
  }
</style>
