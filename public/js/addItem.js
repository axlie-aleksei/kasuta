const form = document.getElementById("itemForm");
const modal = document.getElementById("addItemModal");
const imagesInput = document.getElementById("imagesInput");
const previews = document.getElementById("imagePreviews");
let previewUrls = [];

function openAddItem() {
  if (modal) {
    modal.style.display = "grid";
  } else {
    window.location.href = "/addItem.html";
  }
}

function closeAddItem() {
  if (modal) {
    modal.style.display = "none";
  } else {
    window.location.href = "/index.html";
  }
}

function clearPreviews() {
  previewUrls.forEach((u) => URL.revokeObjectURL(u));
  previewUrls = [];
  if (previews) {
    previews.innerHTML = "";
    previews.style.display = "none";
  }
}

function renderPreviews(files) {
  if (!previews) return;
  clearPreviews();
  if (!files || files.length === 0) return;

  previews.style.display = "grid";
  Array.from(files).slice(0, 10).forEach((file) => {
    const url = URL.createObjectURL(file);
    previewUrls.push(url);
    const div = document.createElement("div");
    div.className = "km-preview";
    const img = document.createElement("img");
    img.src = url;
    img.alt = "preview";
    div.appendChild(img);
    previews.appendChild(div);
  });
}

document.addEventListener("click", (e) => {
  const target = e.target;
  if (!target) return;

  const opener = target.closest && target.closest("[data-action='open-add-item']");
  if (opener) {
    e.preventDefault();
    openAddItem();
    return;
  }

  const closer = target.closest && target.closest("[data-action='close-add-item']");
  if (closer) {
    e.preventDefault();
    closeAddItem();
  }

  const picker = target.closest && target.closest("[data-action='pick-images']");
  if (picker) {
    e.preventDefault();
    if (imagesInput) imagesInput.click();
  }
});

if (imagesInput) {
  imagesInput.addEventListener("change", function () {
    renderPreviews(imagesInput.files);
  });
}

if (form) form.addEventListener("submit", async (e)=>{

  e.preventDefault();

  const formData = new FormData(form);

  const res = await fetch("/api/items/add",{
    method:"POST",
    body:formData,
    credentials: "include"
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { error: "Server returned non-JSON response" };

  if (res.ok && data.success) {
    alert("Item added");
    form.reset();
    clearPreviews();
    closeAddItem();

    // обновить список на главной, если есть
    if (window && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new Event("items:reload"));
    }
  } else {
    alert(data.error || "Failed to add item");
  }
});
