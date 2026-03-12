const input = document.getElementById("avatarInput");

input.addEventListener("change", async () => {

  const formData = new FormData();

  formData.append("avatar", input.files[0]);

  const res = await fetch("/api/user/upload-avatar", {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    alert("Server error");
    return;
  }

  if (data.success) {
    document.getElementById("avatarImg").src =
      "/uploads/avatars/" + data.avatar;
  } else {
    const msg = data.details || data.error || "Upload failed";
    alert(msg);
    console.error("Upload error:", data);
  }

});
