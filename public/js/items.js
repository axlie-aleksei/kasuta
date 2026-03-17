(function () {

  let page = 1
  let loading = false
  let finished = false
  let scrollTimeout = null

  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;")
  }

  async function loadItems(){

    if(loading || finished) return

    loading = true

    const container = document.getElementById("itemsContainer")

    try{

      const res = await fetch(`/api/items?page=${page}`,{
        credentials:"include"
      })

      const items = await res.json()

      if(!items.length){
        finished = true
        return
      }

      items.forEach(item => {

        const image = item.image
          ? "/uploads/items/" + item.image
          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23101014'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23ffffff' font-size='28'%3Eno image%3C/text%3E%3C/svg%3E"

        const card = `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="tm-card">
            <div class="tm-card__img-wrap">
              <img src="${image}" class="tm-card__img">
              <div class="tm-card__price">${escapeHtml(item.price)} €</div>
            </div>
            <div class="tm-card__body">
              <div class="tm-card__title">${escapeHtml(item.title)}</div>
              <div class="tm-card__desc">${escapeHtml(item.description)}</div>
            </div>
          </div>
        </div>
        `

        container.insertAdjacentHTML("beforeend",card)

      })

      page++

    }catch(e){
      console.log(e)
    }

    loading = false

  }

  // первая загрузка
  loadItems()

  // debounce scroll
  window.addEventListener("scroll",()=>{

    if(scrollTimeout) clearTimeout(scrollTimeout)

    scrollTimeout = setTimeout(()=>{

      const scrollPosition = window.innerHeight + window.scrollY
      const pageHeight = document.body.offsetHeight

      if(scrollPosition > pageHeight - 400){
        loadItems()
      }

    },150)

  })

})()
