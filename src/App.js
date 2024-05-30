import logo from './logo.svg';
import './App.css';
import { Bar } from 'react-chartjs-2'

const options = {
  responsive: false,
  layout: {
    padding: {
      top: 24,
      left: 9,
      right: 19,
      bottom: 9
    }
  },
  plugins: {
    legend: false,
    title: 'Audit list visualization'
  },
  scales: {
    xAxes: [{
      barThickness: 48,
      stacked: true,
      gridLines: {
        display: false
      },
      ticks: {
        display: false,
        align: 'start'
      }
    }],
    yAxes: [{
      stacked: true,
      beginAtZero: true,
      gridLines: {
        display: false
      },
      ticks: {
        display: false
      }
    }]
  }
}

const barPosition = {
  id: 'barPosition',
  beforeDatasetsDraw(chart, args, plugins) {
    const { ctx, data, chartArea: { left, bottom, right } } = chart
    // console.log(chart.getDatasetMeta(0).data)
    const y = chart.scales['y-axis-0']
    // _.forEach([0,1,2], (inx) => {
    chart.getDatasetMeta(0).data.forEach((dataPoint, index) => {
      dataPoint.x = 0
      dataPoint.width = 48
    })
    // })
  }
}

const arbitraryLines = {
  id: "arbitraryLines",
  beforeDatasetsDraw(chart, args, plugins) {
    const {
      ctx,
      chartArea: { left, right },
      data: { datasets, maxCases },
    } = chart
    const y = chart.scales['y-axis-0']
    const x = chart.scales['x-axis-0']
    ctx.save()

    function drawLine(lineThickness, lineColor, yCoor) {
      ctx.beginPath()
      ctx.strokeStyle = lineColor
      ctx.lineWidth = lineThickness
      ctx.moveTo(left + 5, y.getPixelForValue(yCoor))
      ctx.lineTo(right, y.getPixelForValue(yCoor))
      ctx.stroke()
    }

    function drawRightText(text, font, style, yCoor, align = 'left', margin = 0) {
      ctx.font = font
      ctx.fillStyle = style
      ctx.textAlign = align
      ctx.maxWidth = 50
      const alginXPosition = align === 'right' ? right - margin : left + margin
      ctx.fillText(text, alginXPosition, y.getPixelForValue(yCoor))
    }

    const textBuffer = 5
    const lineBuffer = -1
    let currentCases = 0
    if (datasets) {
      //const totalCases = datasets.flatMap(d => d.data).reduce((sum, a) => sum + a, 0)
      datasets.forEach((dataset, index) => {
        const { label, data } = dataset
        currentCases = data[0] + currentCases
        if (label && label !== 'empty') {
          drawRightText(label, '14px arial', '#3F485C', currentCases + textBuffer, 'left', 70)
          drawRightText(data[0], 'bold 16px arial', '#000', currentCases + textBuffer, 'right', 35)
          drawRightText(Math.round((data[0] / maxCases) * 100) + '%', '14px arial', '#000', currentCases + textBuffer, 'right')
        }
        drawLine(1, '#A8B2CA', currentCases + lineBuffer)
      })
    }

  }
}

const labels = ['', '', '', '']
const maxCases = 500
const sizeWeights = [
  { cases: 150, label: 'Flagged' },
  { cases: 140, label: 'High risk' },
  { cases: 220, label: 'Never audit' }
]

export const data = {
  labels: labels,
  maxCases: maxCases,
  datasets: [
    {
      label: 'Flagged',
      data: [110],
      backgroundColor: '#263F7B',
      borderWidth: 1,
    },
    {
      label: 'High risk',
      data: [200],
      backgroundColor: '#3C5288',
      borderWidth: 1,
    },
    {
      label: 'Never audit',
      data: [80],
      backgroundColor: '#516595',
      borderWidth: 1,
    },
    {
      label: 'empty',
      data: [270],
      backgroundColor: 'transparent',
      borderWidth: 1,
    }
  ]
}

function renderData(sizeWeights, maxCases) {
  const datasets = sizeWeights.map(s => ({
    label: s.label,
    data: [s.cases],
    backgroundColor: 'green',
    borderWidth: 1
  }))
  const totalCases = sizeWeights.reduce((sum, cur) => sum + cur.cases, 0)

  const rest = totalCases > maxCases
    ? {
      label: 'overdata',
      data: [totalCases - maxCases],
      backgroundColor: 'red',
      borderWidth: 1
    } : {
      label: 'missing',
      data: [maxCases - totalCases],
      backgroundColor: 'blue',
      borderWidth: 1
    }

  return {
    labels: ['', '', '', ''],
    maxCases: maxCases,
    datasets: [...datasets, rest]
  }
}

function App() {
  return (
    <div className="App">
      <div className='audit-list-chart' style={{ backgroundColor: '#D4D9E5' }}>
        <Bar options={options} width={264} height={544} data={renderData(sizeWeights, maxCases)} plugins={[arbitraryLines, barPosition]} />
      </div>
    </div>
  );
}

export default App;
