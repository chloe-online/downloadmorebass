<script lang="ts">
  import { onMount } from "svelte";
  import {
    getLocation,
    homePath,
    navigate,
    subscribe,
    type Location,
  } from "../lib/router";

  let location = $state<Location>(getLocation());
  let query = $state(getLocation().q ?? "");

  onMount(() => {
    return subscribe((next) => {
      location = next;
      if (next.route === "home") {
        query = next.q ?? "";
      }
    });
  });

  function goHome(event: MouseEvent) {
    event.preventDefault();
    navigate(homePath());
  }

  function onSearch(event: Event) {
    event.preventDefault();
    navigate(homePath(query));
  }
</script>

<nav class="site-nav" aria-label="Site">
  <div class="bar-body">
    <div class="site-nav-links">
      <a class="nav-link" href="/" onclick={goHome}>Home</a>
    </div>

    <form class="search-form" onsubmit={onSearch} role="search">
      <input
        class="search-input"
        type="search"
        name="q"
        placeholder="Search bass"
        autocomplete="off"
        bind:value={query}
        aria-label="Search bass"
      />
      <button class="search-button" type="submit">Search</button>
    </form>
  </div>
</nav>

<style>
  .site-nav {
    display: flex;
    align-items: stretch;
    width: 100%;
    box-sizing: border-box;
    margin-top: 0.5rem;
    height: 37px;
  }

  .bar-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
    height: 37px;
    padding: 0 8px 0 0;
    box-sizing: border-box;
    overflow: hidden;
    background: transparent url(/ui-sprite.webp) repeat-x scroll 0 -64px;
    border-radius: 2px;
    border: 1px solid #999;
  }

  .site-nav-links {
    display: flex;
    align-items: stretch;
    flex-shrink: 0;
    height: 100%;
  }

  .nav-link {
    display: flex;
    align-items: center;
    padding: 0 10px;
    border-right: 1px solid #999;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: bolder;
    color: #03c;
    line-height: 1.2;
    text-decoration: none;
  }

  .nav-link:first-child {
    padding-left: 8px;
  }

  .nav-link:hover {
    background: rgba(0, 0, 0, 0.08);
    text-decoration: none;
  }

  .search-form {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
    max-width: 28rem;
    margin-left: auto;
  }

  .search-input {
    flex: 1;
    min-width: 0;
    height: 22px;
    margin: 0;
    padding: 2px 5px;
    border: 1px solid #999;
    border-radius: 2px;
    background: #fff;
    color: #000;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    line-height: 1.2;
    box-sizing: border-box;
  }

  .search-input:focus {
    outline: 1px solid #03c;
    border-color: #03c;
  }

  .search-button {
    flex-shrink: 0;
    height: 22px;
    margin: 0;
    padding: 0 10px;
    border: 1px solid #d3d3d3;
    border-radius: 3px;
    background: transparent url(/ui-sprite.webp) no-repeat scroll 0 -137px;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
    color: #333;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    font-weight: bold;
    line-height: 20px;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
    cursor: pointer;
  }

  .search-button:hover {
    border-color: #999;
  }

  .search-button:active {
    border-color: #666;
  }

  @media (max-width: 480px) {
    .bar-body {
      flex-wrap: wrap;
      height: auto;
      min-height: 37px;
      padding: 5px 8px 5px 0;
      gap: 0.5rem;
      border-radius: 0px;
      border-left: none;
      border-right: none;
    }

    .search-form {
      flex: 1 1 100%;
      max-width: none;
      margin-left: 0;
    }
  }
</style>
