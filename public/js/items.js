(function () {

  let page = 1;
  let loading = false;
  let finished = false;
  let scrollTimeout = null;

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadItems() {

    if (loading || finished) return;

    loading = true;

    const container = document.getElementById("itemsContainer");

    try {

      const res = await fetch(`/api/items?page=${page}`, {
        credentials: "include"
      });

      const items = await res.json();

      if (!items.length) {
        finished = true;
        return;
      }

      items.forEach(item => {

        const image = item.image
          ? "/uploads/items/" + item.image
          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231e293b'/%3E%3Cstop offset='100%25' stop-color='%23334155'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='system-ui,sans-serif' font-size='22' font-weight='600'%3EНет фото%3C/text%3E%3C/svg%3E";

        const card = `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="product-card">
            <div class="product-card__media">
              <img src="${image}" class="product-card__img" alt="">
              <div class="product-card__price">${escapeHtml(item.price)} €</div>
            </div>
            <div class="product-card__body">
              <div class="product-card__title">${escapeHtml(item.title)}</div>
              <div class="product-card__desc">${escapeHtml(item.description)}</div>
            </div>
          </div>
        </div>
        `;

        container.insertAdjacentHTML("beforeend", card);

      });

      page++;

    } catch (e) {
      console.log(e);
    }

    loading = false;

  }

  loadItems();

  window.addEventListener("scroll", () => {

    if (scrollTimeout) clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {

      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.body.offsetHeight;

      if (scrollPosition > pageHeight - 400) {
        loadItems();
      }

    }, 150);

  });

})();
