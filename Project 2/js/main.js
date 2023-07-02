/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
	.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
	.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
	.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// X Label
g.append("text")
	.attr("class", "x axis-label")
	.attr("x", WIDTH / 2)
	.attr("y", HEIGHT + 100)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("GDP Per Capita")

// Y Label
g.append("text")
	.attr("class", "y axis-label")
	.attr("x", WIDTH / 2)
	.attr("y", -100)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Avg. Life Expectancy")

d3.json("data/data.json").then(function(rawData){
//	console.log(rawData);

	const data = rawData.map(d => {
							return {
								year: d["year"],
								countries: d["countries"]
									.filter(country => (country.income && country.life_exp))
									.map(country => {
										country.income = Number(country.income)
										country.life_exp = Number(country.life_exp)
										return country
									})
							}
						})


	console.log(data)

	update(data.find(d => d.year === "1800")["countries"])

}).catch(error => {
	console.log(error)
})

function update(data) {
	console.log(data)
	// Scaling
	const x = d3.scaleBand()
		.domain(data.map(d => d.income))
		.range([0, WIDTH])
		.paddingInner(0.3)
		.paddingOuter(0.2)

	const y = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.life_exp)])
		.range([HEIGHT, 0])

	// X Axis
	const xAxisCall = d3.axisBottom(x)
	g.append("g")
		.attr("class", "x axis")
		.attr("transform", `translate(0, ${HEIGHT})`)
		.call(xAxisCall)
		// Apply transformation to make text readable
		.selectAll("text")
		.attr("y", "10")
		.attr("x", "-5")
		.attr("text-anchor", "end")
		.attr("transform", "rotate(-40)")

	// Y Axis
	const yAxisCall = d3.axisLeft(y)
		.ticks(3)
		.tickFormat(d => d + " years")
	g.append("g")
		.attr("class", "y axis")
		.call(yAxisCall)

	const dots = g.selectAll("circle")
		.data(data, d => d.country)

	dots.enter().append("rect")
		.attr("cy", d => y(d.life_exp))
		.attr("cx", d => x(d.income))
		.attr("r", 5)
		.attr("fill", "blue")
}
