// Shared site script — nav highlighting + reports list rendering.

function setActiveNav() {
  const path = window.location.pathname;
  const navKey =
    path === "/" || path === "/index.html"
      ? "home"
      : path.includes("reports")
      ? "reports"
      : path.includes("method")
      ? "method"
      : null;
  if (!navKey) return;
  const active = document.querySelector(`[data-nav="${navKey}"]`);
  if (active) active.classList.add("active");
}

async function loadReportCatalog() {
  const root = document.querySelector("#report-list");
  if (!root) return;

  try {
    const response = await fetch("/reports/index.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
    const catalog = await response.json();
    const items = Array.isArray(catalog.reports) ? catalog.reports : [];

    if (!items.length) {
      root.innerHTML = `<div class="signal-item">No reports published yet. Check back soon.</div>`;
      return;
    }

    items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    root.innerHTML = items
      .map(
        (item) => `
          <article class="report-row">
            <div>
              <div class="report-meta">${item.date || "Undated"} · ${item.topic || "General"}</div>
              <h3>${item.title}</h3>
              <p class="card-copy" style="margin:0.35rem 0 0">${item.summary || ""}</p>
            </div>
            <div class="report-actions">
              <a class="btn btn-accent" href="/reports.html?file=${encodeURIComponent(item.file)}&title=${encodeURIComponent(item.title)}">View</a>
              <a class="btn btn-outline" href="${item.file}" download>Download</a>
            </div>
          </article>
        `
      )
      .join("");
  } catch (error) {
    root.innerHTML = `<div class="signal-item">Could not load report catalog: ${error.message}</div>`;
  }
}

setActiveNav();
loadReportCatalog();
