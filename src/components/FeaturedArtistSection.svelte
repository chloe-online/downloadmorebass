<script lang="ts">
  import SubscribeButton from "./SubscribeButton.svelte";
  import type { ArtistProfile, WebProfile } from "../../shared/types";

  let { artist }: { artist: ArtistProfile } = $props();

  const locationLabel = $derived(
    [artist.city, artist.country].filter(Boolean).join(", "),
  );

  function socialIcon(profile: WebProfile): string | null {
    const service = profile.service.toLowerCase();
    if (service === "instagram") {
      return "/icons/instagram.png";
    }
    if (service === "twitter" || service === "x") {
      return "/icons/twitter.png";
    }

    try {
      const host = new URL(profile.url).hostname
        .toLowerCase()
        .replace(/^www\./, "");
      if (host === "instagram.com") {
        return "/icons/instagram.png";
      }
      if (host === "twitter.com" || host === "x.com") {
        return "/icons/twitter.png";
      }
    } catch {
      // ignore invalid urls
    }

    return null;
  }

  function socialLabel(profile: WebProfile): string {
    if (profile.title) {
      return profile.title;
    }
    if (profile.username) {
      return `@${profile.username.replace(/^@/, "")}`;
    }
    const service = profile.service.trim();
    if (!service) {
      return "Link";
    }
    return service.charAt(0).toUpperCase() + service.slice(1);
  }
</script>

<section class="featured-artist">
  <div class="artist-header">
    {#if artist.avatarUrl}
      <a
        class="avatar-link"
        href={artist.permalinkUrl}
        target="_blank"
        rel="noreferrer"
      >
        <img
          class="avatar"
          src={artist.avatarUrl}
          alt={artist.username}
          width="72"
          height="72"
        />
      </a>
    {:else}
      <span class="avatar-fallback"
        >{artist.username.slice(0, 1).toUpperCase()}</span
      >
    {/if}

    <div class="artist-details">
      <div class="artist-meta">
        <a
          class="username"
          href={artist.permalinkUrl}
          target="_blank"
          rel="noreferrer"
        >
          {artist.username}
        </a>
        <span class="stat"
          >Followers: {artist.followersCount.toLocaleString()}</span
        >
        {#if locationLabel}
          <span class="stat location">{locationLabel}</span>
        {/if}
      </div>

      <div class="subscribe-socials-container">
        <SubscribeButton inputId="featured-artist-subscribe-email" />

        <div class="socials">
          {#each artist.webProfiles as profile (profile.url)}
            {@const icon = socialIcon(profile)}
            {@const label = socialLabel(profile)}
            <a
              class="social-link"
              href={profile.url}
              target="_blank"
              rel="noreferrer"
              title={label}
            >
              {#if icon}
                <img
                  class="social-icon"
                  src={icon}
                  alt=""
                  width="16"
                  height="16"
                />
              {/if}
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>

  {#if artist.description}
    <p class="bio">{artist.description}</p>
  {/if}
</section>

<style>
  .featured-artist {
    border: 1px solid #ccc;
    background: #f9f9f9;
    padding: 0.5rem;
    text-align: center;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .artist-header {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    width: 100%;
    text-align: left;
    margin-bottom: 0.75rem;
  }

  .avatar-link {
    display: block;
    flex-shrink: 0;
    line-height: 0;
    align-self: flex-start;
  }

  .avatar,
  .avatar-fallback {
    width: 72px;
    height: 72px;
    border: 1px solid #999;
    border-radius: 2px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-gray);
    font-family: Arial, sans-serif;
    font-size: 28px;
    font-weight: bold;
    color: #333;
    align-self: flex-start;
  }

  .artist-details {
    display: flex;
    align-items: stretch;
    gap: 0.65rem;
    flex: 1;
    min-width: 0;
  }

  .subscribe-socials-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .artist-meta {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
    padding-top: 0.1rem;
    flex: 1;
  }

  .username {
    font-family: Arial, sans-serif;
    font-size: 13px;
    font-weight: bold;
    color: #03c;
    text-decoration: none;
    word-break: break-word;
  }

  .username:hover {
    text-decoration: underline;
  }

  .stat {
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.25;
    color: #666;
  }

  .bio {
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.4;
    color: #333;
    margin: 0 0 0.75rem;
    width: 100%;
    text-align: left;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .socials {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .social-link {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #03c;
    text-decoration: none;
  }

  .social-link:hover {
    text-decoration: underline;
  }

  .social-icon {
    width: 16px;
    height: 16px;
    object-fit: contain;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .featured-artist {
      padding: 0.5rem;
    }

    .artist-header {
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .avatar-link {
      align-self: center;
    }

    .avatar,
    .avatar-fallback {
      width: 56px;
      height: 56px;
    }

    .artist-details {
      flex-direction: column;
      align-items: center;
      gap: 0.45rem;
      width: 100%;
    }

    .artist-meta {
      align-items: center;
    }

    .subscribe-socials-container {
      align-items: center;
      gap: 0.45rem;
    }

    .bio {
      margin-bottom: 0;
      text-align: center;
    }
  }
</style>
