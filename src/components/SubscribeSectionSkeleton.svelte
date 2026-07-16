<section class="subscribe-section" aria-hidden="true">
  <div class="subscribe-title">
    <div class="skeleton title-line"></div>
  </div>

  <div class="subscribe-form">
    <div class="subscribe-description">
      <div class="skeleton line"></div>
      <div class="skeleton line short"></div>
    </div>
    <div class="subscribe-row">
      <div class="skeleton subscribe-input"></div>
      <div class="skeleton subscribe-button"></div>
    </div>
  </div>
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
    margin: 0 0 0.75rem;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.35rem;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
  }

  .title-line {
    height: calc(13px * 1.5);
    width: 6.5rem;
  }

  .subscribe-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .subscribe-description {
    margin: 0 0 0.75rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .line {
    height: calc(12px * 1.35);
    width: 100%;
  }

  .line.short {
    width: 70%;
  }

  .subscribe-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .subscribe-input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #ccc;
    font-size: 12px;
    height: calc(1em + 0.8rem + 2px);
  }

  .subscribe-button {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #999;
    font-size: 12px;
    height: calc(1em + 0.8rem + 2px);
  }
</style>
