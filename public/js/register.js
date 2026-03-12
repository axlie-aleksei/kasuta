const form = document.getElementById("registerForm");

function togglePassword(btn) {
  const selector = btn.getAttribute("data-target");
  const input = selector ? document.querySelector(selector) : null;
  if (!input) return;
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";

  btn.setAttribute("aria-pressed", String(isPassword));
  const showIcon = btn.querySelector(".tm-pass__icon--show");
  const hideIcon = btn.querySelector(".tm-pass__icon--hide");
  if (showIcon && hideIcon) {
    showIcon.style.display = isPassword ? "none" : "";
    hideIcon.style.display = isPassword ? "" : "none";
  }
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (!t) return;
  const btn = t.closest && t.closest("[data-action='toggle-password']");
  if (!btn) return;
  e.preventDefault();
  togglePassword(btn);
});

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const fullname = form.querySelector("input[name='fullname']").value.trim();
  const email = form.querySelector("input[name='email']").value.trim();
  const password = form.querySelector("input[name='password']").value;
  const confirm = form.querySelector("input[name='confirm']").value;
  const linn = form.querySelector("input[name='linn']").value.trim();

  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fullname,
      email,
      pass: password,
      linn
    }),
    credentials: "include"
  });

  const data = await res.json();

  if (data.success) {
    window.location.href = "/login.html";
  } else {
    alert(data.error || data.message || "Registration failed");
    console.error("Register error:", data);
  }

});
