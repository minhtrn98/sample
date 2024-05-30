import logo from "./logo.svg";
import "./App.css";
import { Bar } from "react-chartjs-2";

const options = {
  responsive: false,
  layout: {
    padding: {
      top: 24,
      left: 24,
      right: 24,
      bottom: 24,
    },
  },
  plugins: {
    legend: false,
    title: "Audit list visualization",
  },
  scales: {
    xAxes: [
      {
        barThickness: 48,
        stacked: true,
        gridLines: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    ],
    yAxes: [
      {
        stacked: true,
        beginAtZero: true,
        gridLines: {
          display: false,
        },
        ticks: {
          display: false,
          beginAtZero: true,
        },
      },
    ],
  },
};

const config = {
  gapLineText: 5,
  minSpaceBetweenTwoLine: 25,
  gapBarText: 60,
  lineColor: "#A8B2CA",
  borderColor: "#263F7B",
  outOfCaseColor: "#CF1322",
  notAssignBackgroundColor: "transparent",
  labelWeight: {
    font: "14px arial",
    color: "#3F485C",
  },
  labelCase: {
    font: "bold 16px arial",
    color: "#000",
  },
  labelPercent: {
    font: "12px arial",
    color: "#000",
  },
  barColors: ["#263F7B", "#3C5288", "#516595"],
};

const barPosition = {
  id: "barPosition",
  beforeDatasetsDraw(chart, args, plugins) {
    const {
      ctx,
      data,
      chartArea: { left, bottom, right },
    } = chart;
    // console.log(chart.getDatasetMeta(0).data)
    const y = chart.scales["y-axis-0"];
    // _.forEach([0,1,2], (inx) => {
    chart.getDatasetMeta(0).data.forEach((dataPoint, index) => {
      dataPoint.x = 0;
      dataPoint.width = 48;
    });
    // })
  },
};

const arbitraryLines = {
  id: "arbitraryLines",
  beforeDatasetsDraw(chart, args, plugins) {
    const {
      ctx,
      chartArea: { left, right },
      data: { datasets, maxCases },
    } = chart;
    const y = chart.scales["y-axis-0"];
    ctx.save();

    function drawLine(lineThickness, lineColor, yCoor) {
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineThickness;
      ctx.moveTo(left + 5, y.getPixelForValue(yCoor));
      ctx.lineTo(right, y.getPixelForValue(yCoor));
      ctx.stroke();
    }

    function drawText(text, font, style, yCoor, align = "left", margin = 0) {
      ctx.font = font;
      ctx.fillStyle = style;
      ctx.textAlign = align;
      const xCoor = align === "right" ? right - margin : left + margin;
      ctx.fillText(text, xCoor, y.getPixelForValue(yCoor) - config.gapLineText);
    }

    let aggregateBarCases = 0;
    let zeroCasesStack = 0;
    if (datasets) {
      datasets.forEach((dataset, index) => {
        const { label, data, isNotAssign } = dataset;
        if (isNotAssign || !data?.length || !label) return;

        const currentBarCases = data?.[0] || 0;
        if (!currentBarCases) zeroCasesStack++;
        aggregateBarCases = currentBarCases + aggregateBarCases;

        const lineYCoor =
          currentBarCases === 0
            ? aggregateBarCases + zeroCasesStack * config.minSpaceBetweenTwoLine
            : aggregateBarCases;

        drawText(
          label,
          config.labelWeight.font,
          config.labelWeight.color,
          lineYCoor,
          "left",
          config.gapBarText
        );
        drawText(
          currentBarCases,
          config.labelCase.font,
          config.labelCase.color,
          lineYCoor,
          "right",
          35
        );
        drawText(
          Math.round((currentBarCases / maxCases) * 100) + "%",
          config.labelPercent.font,
          config.labelPercent.color,
          lineYCoor,
          "right"
        );
        drawLine(1, config.lineColor, lineYCoor);
      });
    }
  },
};

function comparerDesc(a, b) {
  if (a.cases < b.cases) {
    return 1;
  }
  if (a.cases > b.cases) {
    return -1;
  }
  return 0;
}

const labels = ["", "", "", ""];
const maxCases = 500;
const sizeWeights = [
  { cases: 150, label: "Flagged" },
  { cases: 150, label: "High risk" },
  { cases: 190, label: "Never audit" },
];

function renderData(sizeWeights, maxCases) {
  if (!maxCases || !sizeWeights.length) return {};
  sizeWeights = sizeWeights.sort(comparerDesc);

  let outOfCasesIndex;
  const totalCases = sizeWeights.reduce((sum, cur, index) => {
    const res = sum + cur.cases;
    if (!outOfCasesIndex && res > maxCases) outOfCasesIndex = index;
    return res;
  }, 0);
  const notAssignCases = maxCases - totalCases;

  const datasets = sizeWeights.map((s, index) => {
    const cases = s?.cases || 0;

    return {
      label: s.label,
      data: [cases],
      backgroundColor:
        index >= outOfCasesIndex
          ? config.outOfCaseColor
          : config.barColors[index],
      borderWidth: 1,
      borderColor: config.borderColor,
      minBarLength: cases > 0 ? 25 : undefined,
    };
  });

  const rest =
    notAssignCases > 0
      ? {
          label: "Not assign yet",
          data: [notAssignCases],
          backgroundColor: config.notAssignBackgroundColor,
          borderWidth: 1,
          borderColor: config.borderColor,
          isNotAssign: true,
        }
      : null;

  if (rest) datasets.push(rest);

  return {
    labels: labels,
    maxCases: maxCases,
    datasets: datasets,
  };
}

function App() {
  return (
    <div className="App">
      <div
        className="audit-list-chart"
        style={{ backgroundColor: "#D4D9E5", marginTop: 100 }}
      >
        <Bar
          options={options}
          height={544}
          width={264}
          // height={1100}
          data={renderData(sizeWeights, maxCases)}
          plugins={[arbitraryLines, barPosition]}
        />
      </div>
    </div>
  );
}

export default App;
