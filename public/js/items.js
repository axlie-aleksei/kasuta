(function () {
  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatPrice(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return escapeHtml(value);
    return n.toLocaleString("et-EE") + " €";
  }

  async function loadItems() {
    const container = document.getElementById("itemsContainer");
    if (!container) return;

    container.innerHTML = "";

    const res = await fetch("/api/items", { credentials: "include" });
    if (!res.ok) {
      container.innerHTML =
        '<div class="col-12"><div class="post-card p-4 text-center">Не удалось загрузить товары</div></div>';
      return;
    }

    const items = await res.json();

    items.forEach(function (item) {
      const image = item.image
        ? "/uploads/items/" + encodeURIComponent(item.image)
        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='40%25'%3E%3Cstop offset='0%25' stop-color='%2300ff88' stop-opacity='0.18'/%3E%3Cstop offset='60%25' stop-color='%23101014' stop-opacity='1'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='800' height='600' fill='url(%23g)'/%3E%3Cpath d='M260 390l70-80 70 70 110-130 170 200H260z' fill='%23ffffff' fill-opacity='0.16'/%3E%3Ccircle cx='310' cy='250' r='38' fill='%23ffffff' fill-opacity='0.14'/%3E%3Ctext x='50%25' y='52%25' text-anchor='middle' fill='%23ffffff' fill-opacity='0.45' font-family='system-ui,Segoe UI,Arial' font-size='28'%3Eno image%3C/text%3E%3C/svg%3E";

      const title = escapeHtml(item.title);
      const description = escapeHtml(item.description || "");

      const card = `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="tm-card">
            <div class="tm-card__img-wrap">
              <img src="${image}" class="tm-card__img" alt="${title}">
              <div class="tm-card__price">${formatPrice(item.price)}</div>
            </div>
            <div class="tm-card__body">
              <div class="tm-card__title">${title}</div>
              <div class="tm-card__desc">${description}</div>
            </div>
          </div>
        </div>
      `;

      container.insertAdjacentHTML("beforeend", card);
    });
  }

  window.addEventListener("items:reload", function () {
    loadItems().catch(function () {});
  });

  loadItems().catch(function () {});
})();

