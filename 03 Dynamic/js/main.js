/*
*    main.js
*    Mastering Data Visualization with D3.js
*    5.2 - Looping with intervals
*/

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// Create a flag to switch between profit/revenue
let flag = true

// X label
const xLabel = g.append("text")
  .attr("class", "x axis-label")
  .attr("x", WIDTH / 2)
  .attr("y", HEIGHT + 60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Month")

// Y label
const yLabel = g.append("text")
  .attr("class", "y axis-label")
  .attr("x", - (HEIGHT / 2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")


const x = d3.scaleBand()
    .range([0, WIDTH])
    .paddingInner(0.3)
    .paddingOuter(0.2)

const y = d3.scaleLinear()
    .range([HEIGHT, 0])

 const xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${HEIGHT})`)

const yAxisGroup = g.append("g")
    .attr("class", "y axis")

d3.csv("data/revenues.csv").then(data => {
  data.forEach(d => {
    d.revenue = Number(d.revenue)
    d.profit = Number(d.profit)
  })

  console.log(data)

  d3.interval(() => {
    flag = !flag
    const newData = flag ? data : data.slice(1)
    update(newData)
  }, 1000) // run update every second
  update(data) // initial call when page loads
})

function update(data) {
  // Switch between profit and revenue data
  const value = flag ? "profit" : "revenue"
  // Transition effect
  const t = d3.transition().duration(750)

  // update axes
  x.domain(data.map(d => d.month))
  y.domain([0, d3.max(data, d => d[value])])

  const xAxisCall = d3.axisBottom(x)

  xAxisGroup.transition(t).call(xAxisCall)
      .selectAll("text")
      .attr("y", "10")
      .attr("x", "-5")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-40)")

  const yAxisCall = d3.axisLeft(y)
      .ticks(3)
      .tickFormat(d => d + "m")
  yAxisGroup.transition(t).call(yAxisCall)

  // JOIN new data with old elements
  const rects = g.selectAll("circle")
      .data(data, d => d.month)

  // EXIT remove old elements
  rects.exit()
      .attr("fill", "red")
      .transition(t)
        .attr("cy", y(0))
        .remove()

  // ENTER new elements present in the new data
  rects.enter().append("circle") // rect = bar chart, circle = scatterplot
      .attr("fill", "grey")
      .attr("cy", y(0))
      .attr("r", 5)
      // UPDATE is now part of transition
      .merge(rects)
      .transition(t) // gradually apply over 500ms
        .attr("cx", (d) => x(d.month) + (x.bandwidth() / 2))
        .attr("cy", d => y(d[value]))

  // Dynamic yLabel
  const text = flag ? "Profit ($)" : "Revenue ($)"
  yLabel.text(text)
}