<script lang="ts">
  import type { ArtistProfile } from "../../shared/types";

  let { profile }: { profile: ArtistProfile } = $props();

  const location = $derived(
    [profile.city, profile.country].filter(Boolean).join(", "),
  );
</script>

<aside class="artist-bar">
  <h3 class="artist-bar-title">About the artist</h3>

  <a class="artist-link" href={profile.permalinkUrl} target="_blank" rel="noreferrer">
    {#if profile.avatarUrl}
      <img class="avatar" src={profile.avatarUrl} alt={profile.username} />
    {:else}
      <span class="avatar-fallback">{profile.username.slice(0, 1).toUpperCase()}</span>
    {/if}
    <span class="username">{profile.username}</span>
  </a>

  <dl class="stats">
    <div>
      <dt>Tracks</dt>
      <dd>{profile.trackCount}</dd>
    </div>
    <div>
      <dt>Followers</dt>
      <dd>{profile.followersCount.toLocaleString()}</dd>
    </div>
  </dl>

  {#if location}
    <p class="location">{location}</p>
  {/if}

  {#if profile.description}
    <p class="bio">{profile.description}</p>
  {/if}

  <a class="profile-button" href={profile.permalinkUrl} target="_blank" rel="noreferrer">
    View profile
  </a>
</aside>

<style>
  .artist-bar {
    border: 1px solid #ccc;
    background: #f9f9f9;
    padding: 0.75rem;
    text-align: left;
    min-width: 0;
    flex: 1;
  }

  .artist-bar-title {
    font-family: Arial, sans-serif;
    font-size: 13px;
    font-weight: bold;
    margin: 0 0 0.75rem;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.35rem;
  }

  .artist-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    margin-bottom: 0.75rem;
  }

  .avatar,
  .avatar-fallback {
    width: 48px;
    height: 48px;
    border: 1px solid #999;
    border-radius: 2px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ddd;
    font-family: Arial, sans-serif;
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  .username {
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    color: #03c;
    line-height: 1.2;
  }

  .artist-link:hover .username {
    text-decoration: underline;
  }

  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin: 0 0 0.75rem;
  }

  .stats div {
    border: 1px solid #ddd;
    background: #fff;
    padding: 0.35rem 0.5rem;
  }

  .stats dt {
    font-family: Arial, sans-serif;
    font-size: 10px;
    color: #666;
    margin: 0;
    text-transform: uppercase;
  }

  .stats dd {
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    margin: 0.15rem 0 0;
    color: #333;
  }

  .location,
  .bio {
    font-family: Arial, sans-serif;
    font-size: 11px;
    line-height: 1.4;
    color: #444;
    margin: 0 0 0.75rem;
    white-space: pre-wrap;
  }

  .profile-button {
    display: inline-block;
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: bold;
    color: #333;
    background: transparent
      url(https://web.archive.org/web/20080416013730im_/http://s.ytimg.com/yt/img/master-vfl37165.gif)
      no-repeat scroll 0 -137px;
    border: 1px solid #d3d3d3;
    border-radius: 3px;
    padding: 4px 10px;
    text-decoration: none;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  @media (max-width: 768px) {
    .artist-bar {
      width: 100%;
    }
  }
</style>
