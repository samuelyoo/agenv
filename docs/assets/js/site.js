const header = document.querySelector("[data-header]");
const copyButton = document.querySelector("#copy-install");
const toast = document.querySelector("#toast");

let toastTimer = 0;

function syncHeaderState() {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function showToast(message) {
  if (!toast) {
    return;
  }

  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

async function copyInstallCommand() {
  const text = copyButton?.getAttribute("data-copy-text");

  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast("Install command copied");
  } catch {
    showToast(text);
  }
}

window.addEventListener("scroll", syncHeaderState, { passive: true });
copyButton?.addEventListener("click", copyInstallCommand);
syncHeaderState();
