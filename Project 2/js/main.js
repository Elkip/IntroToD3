	/*
    *    main.js
    *    Mastering Data Visualization with D3.js
    *    Project 2 - Gapminder Clone
    */

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
	.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
	.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
	.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// X Label
const xLabel = g.append("text")
	.attr("x", WIDTH / 2)
	.attr("y", HEIGHT + 100)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("GDP Per Capita")

// Y Label
const yLabel = g.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", -70)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Avg. Life Expectancy")

// Time Label
const timeLabel = g.append("text")
	.attr("y", HEIGHT - 10)
	.attr("x", WIDTH - 40)
	.text("1800")

// Tooltip
const tip = d3.tip()
	.attr('class', 'd3-tip')
	.html(d => {
		return `<strong>Country:</strong> <span style='color:red;text-transform:capitalize'>${d.country}</span><br>`
				+ `<strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>${d.continent}</span><br>`
				+ `<strong>Life Expectancy:</strong> <span style='color:red'>${d3.format(".2f")(d.life_exp)}</span><br>`
				+ `<strong>GDP Per Capita:</strong> <span style='color:red'>${d3.format("$,.0f")(d.income)}</span><br>`
				+ `<strong>Population:</strong> <span style='color:red'>${d3.format(",.0f")(d.population)}</span><br>`
	})
g.call(tip)

// Scaling
const x = d3.scaleLog()
	.domain([142, 150000])
	.range([0, WIDTH])

const y = d3.scaleLinear()
	.domain([0, 100])
	.range([HEIGHT, 0])

const area = d3.scaleLinear()
	.range([25*Math.PI, 1500*Math.PI])
	.domain([2000, 1400000000])

const contientColor = d3.scaleOrdinal(d3.schemePastel1)

// X Axis
const xAxisCall = d3.axisBottom(x)
	.tickValues([400, 4000, 40000])
	.tickFormat(d => '$' + d)
g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
	.call(xAxisCall)
	.selectAll("text")
	.attr("y", "10")
	.attr("x", "-5")
	.attr("text-anchor", "end")
	.attr("transform", "rotate(-40)")

// Y Axis
const yAxisCall = d3.axisLeft(y)
	.ticks(5)
	.tickFormat(d => d + " years")
g.append("g")
	.attr("class", "y axis")
	.call(yAxisCall)

// Legend
const cont = ["europe", "asia", "americas", "africa"]
const legend = g.append("g")
	.attr("transform", `translate(${WIDTH - 10}, ${HEIGHT - 125})`)
cont.forEach((cont, i) => {
	const legendRow = legend.append("g")
		.attr("transform", `translate(0, ${i*20})`)

	legendRow.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.attr("fill", contientColor(cont))

	legendRow.append("text")
		.attr("x", -10)
		.attr("y", 10)
		.attr("text-anchor", "end")
		.style("text-transform", "capitalize")
		.text(cont)
})

d3.json("data/data.json").then(function(rawData){
//	console.log(rawData);
	const data = rawData.map(d => {
							return {
								year: d["year"],
								countries: d["countries"]
									.filter(country => (country.income &&
														country.life_exp &&
														country.population))
									.map(country => {
										country.income = Number(country.income)
										country.life_exp = Number(country.life_exp)
										country.population = Number(country.population)
										return country
									})
							}
						})


	console.log(data)

	let currentYear = 1800
	d3.interval(() => {
		currentYear = (currentYear > 2013) ?  1800 : currentYear += 1
		console.log("current year: " + currentYear)
		update(data.find(d => d.year === currentYear.toString())["countries"], currentYear)
	}, 100)

	update(data.find(d => d.year === currentYear.toString())["countries"], currentYear)

}).catch(error => {
	console.log(error)
})

function update(data, year) {
	console.log(data)
	const t = d3.transition().duration(100)

	const dots = g.selectAll("circle")
		.data(data, d => d.country)

	dots.exit().remove()

	dots.enter().append("circle")
		.attr("fill", d => contientColor(d.continent))
		.merge(dots)
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.transition(t)
			.attr("cx", d => x(d.income))
			.attr("cy", d => y(d.life_exp))
			.attr("r", d => Math.sqrt((area(d.population)/Math.PI)))

	timeLabel.text(String(year))
}
