var currentUser = null;

async function loadProfile() {

  const res = await fetch("/api/user/profile", { credentials: "include" });

  if (res.status === 401) {
    window.location.href = "/login.html";
    return;
  }

  const user = await res.json();
  currentUser = user;

  document.getElementById("profileName").textContent = user.fullname || "";
  var fullnameEl = document.getElementById("profileFullname");
  if (fullnameEl) fullnameEl.textContent = user.fullname || "";
  document.getElementById("profileEmail").textContent = user.email || "";
  document.getElementById("profileCity").textContent = user.city || "";

  var avatarImg = document.getElementById("avatarImg");
  if (user.avatar && avatarImg) {
    avatarImg.src = "/uploads/avatars/" + user.avatar;
  }

  showProfileView();
}

function showProfileView() {
  var view = document.getElementById("profileView");
  var form = document.getElementById("profileEditForm");
  if (view) view.style.display = "";
  if (form) form.style.display = "none";
}

function showProfileEdit() {
  var view = document.getElementById("profileView");
  var form = document.getElementById("profileEditForm");
  if (!currentUser) return;
  if (view) view.style.display = "none";
  if (form) {
    form.style.display = "block";
    document.getElementById("editFullname").value = currentUser.fullname || "";
    document.getElementById("editEmail").value = currentUser.email || "";
    document.getElementById("editCity").value = currentUser.city || "";
  }
}

async function saveProfile() {
  var fullname = document.getElementById("editFullname").value.trim();
  var email = document.getElementById("editEmail").value.trim();
  var city = document.getElementById("editCity").value.trim();

  var res = await fetch("/api/user/profile/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ fullname: fullname, email: email, city: city })
  });

  var data = await res.json().catch(function () { return {}; });

  if (res.ok && data.success) {
    currentUser = { fullname: fullname, email: email, city: city };
    await loadProfile();
  } else {
    alert(data.error || "Viga salvestamisel");
  }
}

async function checkAuth() {
  var res = await fetch("/api/user/profile", { credentials: "include" });
  if (res.status === 401) {
    window.location.href = "/login.html";
  }
}

checkAuth();
loadProfile();

var muudaBtn = document.getElementById("muudaProfiiliBtn");
if (muudaBtn) {
  muudaBtn.addEventListener("click", showProfileEdit);
}

var form = document.getElementById("profileEditForm");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    saveProfile();
  });
}

var cancelBtn = document.getElementById("profileEditCancel");
if (cancelBtn) {
  cancelBtn.addEventListener("click", showProfileView);
}
