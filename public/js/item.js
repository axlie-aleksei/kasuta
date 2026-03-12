async function loadItems(){

  const res = await fetch("/api/items");

  const items = await res.json();

  const container =
    document.getElementById("itemsContainer");

  items.forEach(item=>{

    container.innerHTML += `
      <div class="card">

        <img src="/uploads/items/${item.image}">

        <h3>${item.title}</h3>

        <p>${item.price} €</p>

      </div>
    `;

  });

}

async function loadItems(){

  const res = await fetch("/api/items")

  const items = await res.json()

  const container =
    document.getElementById("itemsContainer")

  container.innerHTML=""

  items.forEach(item=>{

    const image =
      item.image
        ? `/uploads/items/${item.image}`
        : "/img/noimage.png"

    const card = `

  <div class="col-md-4">

   <div class="card post-card shadow h-100">

    <img src="${image}" class="card-img-top">

    <div class="card-body text-center">

     <h5 class="card-title mb-3">
      ${item.title}
     </h5>

     <p class="card-text">
      ${item.description}
     </p>

     <p>
      <b>${item.price} €</b>
     </p>

     <p class="text-muted">
      ${item.city}
     </p>

    </div>

   </div>

  </div>

  `

    container.innerHTML += card

  })

}

loadItems()

loadItems();
