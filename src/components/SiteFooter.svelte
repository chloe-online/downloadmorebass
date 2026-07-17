<footer class="site-footer">
  <p>
    <a href="https://chlo.club">Chloemusic</a> &copy; 2026
  </p>
  <p>All rights reserved bitch</p>
</footer>

<style>
  .site-footer {
    width: 100%;
    max-width: var(--layout-max);
    box-sizing: border-box;
    margin-top: auto;
    padding: 1rem;
    background-color: #f0f0f0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border: 1px solid #999;
    border-bottom: none;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    flex-shrink: 0;
  }

  .site-footer p {
    font-family: "Arial", sans-serif;
    font-size: 12px;
    color: #666;
    margin: 0;
  }

  @media (max-width: 768px) {
    .site-footer {
      flex-direction: column;
      gap: 0.5rem;
      border-left: none;
      border-right: none;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    .site-footer p {
      font-size: 11px;
    }
  }
</style>
