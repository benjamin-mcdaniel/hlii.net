// PDF.js viewer for /reports.html. Reads ?file= and ?title= query params,
// renders one page to a canvas, supports prev/next + zoom.

import * as pdfjs from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.min.mjs";

const WORKER_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = WORKER_SRC;

const params = new URLSearchParams(window.location.search);
const fileParam = params.get("file");
const titleParam = params.get("title");

const canvas = document.getElementById("pdf-canvas");
const empty = document.getElementById("viewer-empty");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");
const pageInfo = document.getElementById("page-info");
const zoomInfo = document.getElementById("zoom-info");
const titleEl = document.getElementById("viewer-title");
const downloadLink = document.getElementById("download-link");

const state = {
  doc: null,
  pageNum: 1,
  scale: 1.25,
  rendering: false,
  pending: null
};

function fail(message) {
  empty.style.display = "block";
  canvas.style.display = "none";
  empty.textContent = message;
}

async function render(num) {
  if (!state.doc) return;
  if (state.rendering) {
    state.pending = num;
    return;
  }
  state.rendering = true;

  try {
    const page = await state.doc.getPage(num);
    const viewport = page.getViewport({ scale: state.scale });
    const ctx = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: ctx, viewport }).promise;
    pageInfo.textContent = `Page ${num} / ${state.doc.numPages}`;
    zoomInfo.textContent = `${Math.round(state.scale * 80)}%`;
    prevBtn.disabled = num <= 1;
    nextBtn.disabled = num >= state.doc.numPages;
  } finally {
    state.rendering = false;
    if (state.pending !== null) {
      const next = state.pending;
      state.pending = null;
      render(next);
    }
  }
}

async function load(file, title) {
  try {
    titleEl.textContent = title || file.split("/").pop();
    downloadLink.style.display = "inline-block";
    downloadLink.href = file;

    const task = pdfjs.getDocument(file);
    state.doc = await task.promise;
    state.pageNum = 1;
    empty.style.display = "none";
    canvas.style.display = "block";
    zoomInBtn.disabled = false;
    zoomOutBtn.disabled = false;
    await render(state.pageNum);
  } catch (error) {
    fail(`Could not load PDF: ${error.message}`);
  }
}

prevBtn.addEventListener("click", () => {
  if (state.pageNum > 1) {
    state.pageNum--;
    render(state.pageNum);
  }
});

nextBtn.addEventListener("click", () => {
  if (state.doc && state.pageNum < state.doc.numPages) {
    state.pageNum++;
    render(state.pageNum);
  }
});

zoomInBtn.addEventListener("click", () => {
  state.scale = Math.min(state.scale + 0.25, 3);
  render(state.pageNum);
});

zoomOutBtn.addEventListener("click", () => {
  state.scale = Math.max(state.scale - 0.25, 0.5);
  render(state.pageNum);
});

if (fileParam) {
  load(fileParam, titleParam);
}
