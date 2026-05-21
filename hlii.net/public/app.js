const summaryRoot = document.querySelector("#summary-cards");
const tableRoot = document.querySelector("#scorecard-table");

function toneClass(score) {
  if (score < 45) {
    return "risk";
  }
  if (score < 60) {
    return "warn";
  }
  return "";
}

function renderSummaryCards(scorecards) {
  const average = Math.round(scorecards.reduce((sum, item) => sum + item.hliiScore, 0) / scorecards.length);
  const pressured = scorecards.filter((item) => item.cashPressure <= 50).length;
  const improving = scorecards.filter((item) => item.directionOfTravel >= 60).length;
  const sectors = new Set(scorecards.map((item) => item.sector)).size;

  const cards = [
    {
      title: "Pilot universe",
      value: scorecards.length,
      copy: "Large public companies across rate-sensitive and capital-intensive sectors."
    },
    {
      title: "Average HLII",
      value: average,
      copy: "A rough read on how cleanly this pilot group is converting quarter-to-quarter effort into durable results."
    },
    {
      title: "Cash pressure flags",
      value: pressured,
      copy: "Companies currently showing weaker cash resilience or higher funding strain."
    },
    {
      title: "Improving direction",
      value: improving,
      copy: "Companies where the current quarter looks better than the recent operating path."
    },
    {
      title: "Sectors covered",
      value: sectors,
      copy: "A deliberately narrow spread to keep the first public release interpretable."
    }
  ];

  summaryRoot.innerHTML = cards
    .map(
      (card) => `
        <div class="col-md-6 col-xl">
          <article class="summary-card h-100">
            <h3>${card.title}</h3>
            <div class="display-metric mt-3 mb-2">${card.value}</div>
            <p class="mb-0">${card.copy}</p>
          </article>
        </div>
      `
    )
    .join("");
}

function renderTable(scorecards) {
  tableRoot.innerHTML = scorecards
    .sort((a, b) => b.hliiScore - a.hliiScore)
    .map(
      (item) => `
        <tr>
          <td>
            <div class="fw-semibold">${item.name}</div>
            <div class="ticker">${item.ticker}</div>
          </td>
          <td>${item.sector}</td>
          <td><span class="score-pill ${toneClass(item.hliiScore)}">${item.hliiScore}</span></td>
          <td>${item.cashPressure}</td>
          <td>${item.scalingFriction}</td>
          <td>${item.directionOfTravel}</td>
          <td class="text-secondary">${item.coreRead}</td>
        </tr>
      `
    )
    .join("");
}

async function boot() {
  const response = await fetch("/data/pilot-scorecards.json");
  const scorecards = await response.json();
  renderSummaryCards(scorecards);
  renderTable(scorecards);
}

boot().catch((error) => {
  summaryRoot.innerHTML = `
    <div class="col-12">
      <article class="summary-card">
        <h3>Load issue</h3>
        <p class="mb-0">The pilot scorecards did not load. ${error.message}</p>
      </article>
    </div>
  `;
});
