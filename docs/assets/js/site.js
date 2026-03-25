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

async function copyTextToClipboard(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    showToast("Failed to copy");
  }
}

async function copyInstallCommand() {
  const text = copyButton?.getAttribute("data-copy-text");
  if (text) {
    await copyTextToClipboard(text, "Install command copied");
  }
}

function setupCodeBlockCopy() {
  document.querySelectorAll(".console-block").forEach((block) => {
    const pre = block.querySelector("pre");
    if (!pre) return;

    const copyBtn = document.createElement("button");
    copyBtn.className = "code-copy-btn";
    copyBtn.setAttribute("aria-label", "Copy code");
    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

    copyBtn.addEventListener("click", () => {
      // Get text, strip out any hidden elements if present, or just use innerText
      const codeText = pre.innerText.trim();
      copyTextToClipboard(codeText, "Code copied to clipboard");
    });

    block.style.position = "relative";
    block.appendChild(copyBtn);
  });
}

function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        // Optional: unobserve if you only want it to animate once
        // observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll(".section, .hero-console, .overview-card").forEach(el => {
    el.classList.add("reveal-on-scroll");
    observer.observe(el);
  });
}

window.addEventListener("scroll", syncHeaderState, { passive: true });
copyButton?.addEventListener("click", copyInstallCommand);
syncHeaderState();
setupCodeBlockCopy();
setupScrollReveal();
