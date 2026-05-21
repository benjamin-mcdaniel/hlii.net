const page = document.body.dataset.page;

function toneClass(score) {
  if (score < 45) {
    return "risk";
  }
  if (score < 60) {
    return "warn";
  }
  return "";
}

function average(items, key) {
  return Math.round(items.reduce((sum, item) => sum + item[key], 0) / items.length);
}

function setActiveNav() {
  const active = document.querySelector(`[data-nav="${page}"]`);
  if (active) {
    active.classList.add("active");
  }
}

function renderOverview(scorecards) {
  const summaryRoot = document.querySelector("#overview-summary");
  const boardRoot = document.querySelector("#breadth-board");
  const signalRoot = document.querySelector("#signal-list");
  const tableRoot = document.querySelector("#overview-table");

  const positive = scorecards.filter((item) => item.hliiScore >= 60).length;
  const aligned = scorecards.filter((item) => item.priceAlignment >= 60).length;
  const strongVolume = scorecards.filter((item) => item.volumeTrend >= 60).length;
  const averageScore = average(scorecards, "hliiScore");

  const cards = [
    { title: "Universe", value: scorecards.length, copy: "Large-cap beta set" },
    { title: "Average HLII", value: averageScore, copy: "Overall market posture" },
    { title: "Positive breadth", value: `${Math.round((positive / scorecards.length) * 100)}%`, copy: "Names scoring 60+" },
    { title: "Price aligned", value: `${Math.round((aligned / scorecards.length) * 100)}%`, copy: "Price matches operating read" }
  ];

  summaryRoot.innerHTML = cards.map((card) => `
    <div class="col-md-6 col-xl-3">
      <article class="summary-card h-100">
        <h3>${card.title}</h3>
        <div class="display-metric mt-3 mb-2">${card.value}</div>
        <p class="mb-0">${card.copy}</p>
      </article>
    </div>
  `).join("");

  boardRoot.innerHTML = [
    { label: "Earnings quality avg", value: average(scorecards, "earningsQuality") },
    { label: "Cash resilience avg", value: average(scorecards, "cashResilience") },
    { label: "Direction avg", value: average(scorecards, "directionOfTravel") },
    { label: "Momentum avg", value: average(scorecards, "priceMomentum") },
    { label: "High volume names", value: `${strongVolume}/${scorecards.length}` },
    { label: "Divergence flags", value: `${scorecards.filter((item) => item.priceAlignment < 50).length}` }
  ].map((item) => `
    <article class="board-card">
      <div class="board-label">${item.label}</div>
      <div class="board-value">${item.value}</div>
    </article>
  `).join("");

  signalRoot.innerHTML = [
    "earnings quality",
    "cash resilience",
    "direction of travel",
    "price momentum",
    "relative volume",
    "price alignment"
  ].map((item) => `<div class="signal-item">${item}</div>`).join("");

  tableRoot.innerHTML = scorecards
    .slice()
    .sort((a, b) => b.hliiScore - a.hliiScore)
    .slice(0, 6)
    .map((item) => `
      <tr>
        <td><div class="fw-semibold">${item.name}</div><div class="ticker">${item.ticker}</div></td>
        <td>${item.sector}</td>
        <td><span class="score-pill ${toneClass(item.hliiScore)}">${item.hliiScore}</span></td>
        <td>${item.earningsQuality}</td>
        <td>${item.cashResilience}</td>
        <td>${item.priceMomentum}</td>
        <td>${item.volumeTrend}</td>
      </tr>
    `)
    .join("");
}

function renderMarket(scorecards) {
  const summaryRoot = document.querySelector("#market-summary");
  const readRoot = document.querySelector("#market-read");
  const sectorRoot = document.querySelector("#sector-table");

  const sectors = Object.values(
    scorecards.reduce((acc, item) => {
      if (!acc[item.sector]) {
        acc[item.sector] = { sector: item.sector, items: [] };
      }
      acc[item.sector].items.push(item);
      return acc;
    }, {})
  );

  summaryRoot.innerHTML = [
    { label: "Average HLII", value: average(scorecards, "hliiScore") },
    { label: "Earnings breadth", value: `${scorecards.filter((item) => item.earningsQuality >= 60).length}/${scorecards.length}` },
    { label: "Momentum breadth", value: `${scorecards.filter((item) => item.priceMomentum >= 60).length}/${scorecards.length}` },
    { label: "Volume support", value: `${scorecards.filter((item) => item.volumeTrend >= 60).length}/${scorecards.length}` },
    { label: "Alignment rate", value: `${Math.round((scorecards.filter((item) => item.priceAlignment >= 60).length / scorecards.length) * 100)}%` },
    { label: "Divergence rate", value: `${Math.round((scorecards.filter((item) => item.priceAlignment < 50).length / scorecards.length) * 100)}%` }
  ].map((item) => `
    <article class="board-card">
      <div class="board-label">${item.label}</div>
      <div class="board-value">${item.value}</div>
    </article>
  `).join("");

  readRoot.innerHTML = [
    "Price is not the only score.",
    "Cash matters, but it does not define the whole board.",
    "Momentum and volume help show whether the market agrees.",
    "Alignment flags are where the interesting names start."
  ].map((item) => `<div class="signal-item">${item}</div>`).join("");

  sectorRoot.innerHTML = sectors
    .map(({ sector, items }) => ({
      sector,
      hlii: average(items, "hliiScore"),
      price: average(items, "priceMomentum"),
      volume: average(items, "volumeTrend"),
      direction: average(items, "directionOfTravel")
    }))
    .sort((a, b) => b.hlii - a.hlii)
    .map((item) => `
      <tr>
        <td>${item.sector}</td>
        <td><span class="score-pill ${toneClass(item.hlii)}">${item.hlii}</span></td>
        <td>${item.price}</td>
        <td>${item.volume}</td>
        <td>${item.direction}</td>
        <td class="text-secondary">${item.hlii >= 65 ? "Broadly constructive" : item.hlii >= 50 ? "Mixed board" : "Under pressure"}</td>
      </tr>
    `)
    .join("");
}

function renderCompanies(scorecards) {
  const tableRoot = document.querySelector("#companies-table");

  tableRoot.innerHTML = scorecards
    .slice()
    .sort((a, b) => b.hliiScore - a.hliiScore)
    .map((item) => `
      <tr>
        <td><div class="fw-semibold">${item.name}</div><div class="ticker">${item.ticker}</div></td>
        <td>${item.sector}</td>
        <td><span class="score-pill ${toneClass(item.hliiScore)}">${item.hliiScore}</span></td>
        <td>${item.earningsQuality}</td>
        <td>${item.cashResilience}</td>
        <td>${item.directionOfTravel}</td>
        <td>${item.priceMomentum}</td>
        <td>${item.volumeTrend}</td>
        <td>${item.priceAlignment}</td>
        <td class="text-secondary">${item.coreRead}</td>
      </tr>
    `)
    .join("");
}

async function boot() {
  setActiveNav();
  const response = await fetch("/data/market-scorecards.json");
  const scorecards = await response.json();

  if (page === "home") {
    renderOverview(scorecards);
  }
  if (page === "market") {
    renderMarket(scorecards);
  }
  if (page === "companies") {
    renderCompanies(scorecards);
  }
}

boot().catch((error) => {
  const surfaces = document.querySelectorAll(".surface, .hero-panel");
  const target = surfaces[0];
  if (target) {
    target.innerHTML = `<p class="mb-0 text-secondary">HLII beta failed to load: ${error.message}</p>`;
  }
});
