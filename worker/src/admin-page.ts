export function adminPageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AIhance Admin</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1.5rem; background: #f5f5f5; color: #111; }
    h1 { margin-top: 0; }
    .card { background: #fff; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    label { display: block; margin-bottom: .35rem; font-weight: 600; }
    input[type="password"], input[type="text"], input[type="file"], textarea, select { width: 100%; padding: .5rem; margin-bottom: .75rem; border: 1px solid #ccc; border-radius: 4px; }
    textarea { min-height: 4rem; resize: vertical; }
    button { padding: .5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
    .primary { background: #111; color: #fff; }
    .danger { background: #c0392b; color: #fff; }
    .muted { color: #666; font-size: .875rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: .6rem; border-bottom: 1px solid #eee; vertical-align: top; }
    th { font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; color: #666; }
    .thumb { width: 72px; height: 72px; object-fit: cover; border-radius: 4px; background: #eee; }
    .tags { display: flex; flex-wrap: wrap; gap: .25rem; }
    .tag { background: #eee; padding: .15rem .45rem; border-radius: 999px; font-size: .75rem; }
    .hidden { display: none; }
    .error { color: #c0392b; margin-top: .5rem; }
    .actions { display: flex; gap: .5rem; align-items: center; }
    select[multiple] { min-height: 8rem; }
  </style>
</head>
<body>
  <div id="login-view" class="card">
    <h1>AIhance Admin</h1>
    <p class="muted">Enter the admin password to manage Posts.</p>
    <label for="password">Password</label>
    <input id="password" type="password" autocomplete="current-password">
    <button id="login-btn" class="primary">Log in</button>
    <p id="login-error" class="error hidden"></p>
  </div>

  <div id="admin-view" class="hidden">
    <div class="card">
      <div class="actions">
        <h1 style="flex:1;margin:0">Posts</h1>
        <button id="logout-btn" class="muted" style="background:#eee">Log out</button>
      </div>
    </div>

    <div class="card">
      <h2>Create Post</h2>
      <form id="create-form">
        <label for="image">Image</label>
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" required>

        <label for="prompt">Prompt (optional)</label>
        <textarea id="prompt" name="prompt" placeholder="Style description for Consumers"></textarea>

        <label for="tagSlugs">Tags</label>
        <select id="tagSlugs" name="tagSlugs" multiple required></select>
        <p class="muted">Hold Cmd/Ctrl to select multiple tags.</p>

        <button type="submit" class="primary">Create Post</button>
        <p id="create-error" class="error hidden"></p>
      </form>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Prompt</th>
            <th>Tags</th>
            <th>Reports</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="posts-body"></tbody>
      </table>
    </div>
  </div>

  <script>
    const TOKEN_KEY = "aihance-admin-token";

    function token() {
      return localStorage.getItem(TOKEN_KEY);
    }

    function setToken(value) {
      if (value) localStorage.setItem(TOKEN_KEY, value);
      else localStorage.removeItem(TOKEN_KEY);
    }

    function authHeaders(extra = {}) {
      return { Authorization: "Bearer " + token(), ...extra };
    }

    function show(el) { el.classList.remove("hidden"); }
    function hide(el) { el.classList.add("hidden"); }

    const loginView = document.getElementById("login-view");
    const adminView = document.getElementById("admin-view");
    const loginError = document.getElementById("login-error");
    const createError = document.getElementById("create-error");
    const postsBody = document.getElementById("posts-body");
    const tagSelect = document.getElementById("tagSlugs");

    function showLogin() {
      hide(adminView);
      show(loginView);
    }

    function showAdmin() {
      hide(loginView);
      show(adminView);
    }

    async function api(path, init = {}) {
      const response = await fetch(path, init);
      if (response.status === 401) {
        setToken(null);
        showLogin();
        throw new Error("Session expired");
      }
      return response;
    }

    function promptPreview(prompt) {
      if (!prompt) return "—";
      return prompt.length > 80 ? prompt.slice(0, 80) + "…" : prompt;
    }

    async function loadTags() {
      const response = await api("/tags");
      const tags = await response.json();
      tagSelect.innerHTML = tags.map((tag) =>
        '<option value="' + tag.slug + '">' + tag.displayName + "</option>"
      ).join("");
    }

    async function loadPosts() {
      const response = await api("/posts?admin=1", { headers: authHeaders() });
      const posts = await response.json();
      postsBody.innerHTML = posts.map((post) => {
        const tags = post.tagSlugs.map((slug) => '<span class="tag">' + slug + "</span>").join("");
        return '<tr>' +
          '<td><img class="thumb" src="' + post.imageUrl + '" alt=""></td>' +
          '<td>' + promptPreview(post.prompt) + '</td>' +
          '<td><div class="tags">' + tags + '</div></td>' +
          '<td>' + post.reportCount + '</td>' +
          '<td><button class="danger" data-delete="' + post.id + '">Delete</button></td>' +
          '</tr>';
      }).join("");
    }

    document.getElementById("login-btn").addEventListener("click", async () => {
      hide(loginError);
      const password = document.getElementById("password").value;
      const response = await fetch("/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        show(loginError);
        loginError.textContent = "Invalid password";
        return;
      }
      const body = await response.json();
      setToken(body.token);
      showAdmin();
      await loadTags();
      await loadPosts();
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
      setToken(null);
      showLogin();
    });

    document.getElementById("create-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      hide(createError);
      const formData = new FormData();
      const imageInput = document.getElementById("image");
      formData.append("image", imageInput.files[0]);
      const prompt = document.getElementById("prompt").value.trim();
      if (prompt) formData.append("prompt", prompt);
      for (const option of tagSelect.selectedOptions) {
        formData.append("tagSlugs", option.value);
      }
      const response = await api("/posts", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!response.ok) {
        show(createError);
        const body = await response.json().catch(() => ({}));
        createError.textContent = body.error || "Failed to create post";
        return;
      }
      event.target.reset();
      await loadPosts();
    });

    postsBody.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-delete]");
      if (!button) return;
      if (!confirm("Delete this post?")) return;
      const id = button.getAttribute("data-delete");
      const response = await api("/posts/" + encodeURIComponent(id), {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (response.ok) await loadPosts();
    });

    if (token()) {
      showAdmin();
      loadTags().then(loadPosts).catch(showLogin);
    } else {
      showLogin();
    }
  </script>
</body>
</html>`;
}
