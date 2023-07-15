/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 3 - CoinStats
*/
let coinData;
// chart margins
const MARGIN = { LEFT: 70, RIGHT: 100, TOP: 50, BOTTOM: 100 };
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;
// create svg area
const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);
const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);
// time parser for x-scale
const parseTime = d3.timeParse("%d/%m/%Y");
const formatTime = d3.timeFormat("%d/%m/%Y");
// for tooltip, an object to return where a point would fall in the data
const bisectDate = d3.bisector(d => d.date).left;
// scales
const x = d3.scaleTime().range([0, WIDTH]);
const y = d3.scaleLinear().range([HEIGHT, 0]);
// axis generators
const xAxisCall = d3.axisBottom()
	.ticks(6);
	// .tickFormat((d) => d.getFullYear());
const yAxisCall = d3.axisLeft()
	.ticks(6)
	.tickFormat(d => `${parseInt(d / 1000)}k`);
// axis groups
const xAxis = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`);
const yAxis = g.append("g")
	.attr("class", "y axis");
// y-axis label
const yLabel = yAxis.append("text")
	.attr("class", "axis-title")
	.attr("transform", "rotate(-90)")
	.attr("y", -55)
	.attr("x", -100)
	.attr("font-size", "20px")
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.attr("fill", "#000000")
	.text("Coin Price");
// x-axis Label
const xLabel = g.append("text")
	.attr("x", WIDTH / 2)
	.attr("y", HEIGHT + 80)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Year");
// add line to chart
g.append("path")
	.attr("class", "line")

d3.json("data/coins.json").then(data => {
	coinData = {};
	Object.keys(data).forEach(coin => {
		coinData[coin] = data[coin]
			.filter(d => {
				return (d.date && d.price_usd)
			}).map(d => {
				d.price_usd = Number(d.price_usd);
				d["24h_vol"] = Number(d["24h_vol"]);
				d.market_cap = Number(d.market_cap);
				d.date = parseTime(d.date);
				return d;
			});
	});
	update();
});

function update() {
	const t = d3.transition().duration(1000);
	const coinFilter = $("#coin-select").val();
	const varFilter = $("#var-select").val();
	const sliderFilters = $("#date-slider").slider("values");
	console.log(sliderFilters)
	let fnlCoinData = coinData[coinFilter]
		.filter(d => {
			return (d.date >= sliderFilters[0] && d.date <= sliderFilters[1]);
		});
	console.log(fnlCoinData);
	// set scale domains
	x.domain(d3.extent(fnlCoinData, d => d.date));
	y.domain([0, d3.max(fnlCoinData, d => d[varFilter]) * 1.005]);
	// add scientific notation
	const formatSi = d3.format(".2s")
	function formatAbbreviation(x) {
		// format tick mark to 2 sig figs
		const s = formatSi(x)
		switch (s[s.length - 1]) {
			case "G": return s.slice(0, -1) + "B" // billions
			case "k": return s.slice(0, -1) + "K" // thousands
		}
		return s
	}
	// line path generator
	const line = d3.line()
		.x(d => x(d.date))
		.y(d => y(d[varFilter]));
	// add line to chart
	g.select(".line")
		.transition(t)
		.attr("d", line(fnlCoinData));
	// y axis label
	let yText = (varFilter === "price_usd") ? "Price($)" :
		(varFilter === "market_cap") ? "Market Capitalization ($)" :
			"24 Hour Trading Volume ($)";
	yLabel.text(yText);
	// generate axes once scales have been set
	xAxisCall.scale(x);
	xAxis.transition(t).call(xAxisCall);
	yAxisCall.scale(y);
	yAxis.transition(t).call(yAxisCall.tickFormat(formatAbbreviation))
	// remove current elements
	d3.select(".focus").remove();
	d3.select(".overlay").remove();
	/******************************** Tooltip Code ********************************/
	const focus = g.append("g")
		.attr("class", "focus")
		.style("display", "none");
	// vertical line
	focus.append("line")
		.attr("class", "x-hover-line hover-line")
		.attr("y1", 0)
		.attr("y2", HEIGHT);
	// horizontal line
	focus.append("line")
		.attr("class", "y-hover-line hover-line")
		.attr("x1", 0)
		.attr("x2", WIDTH);
	// circle on graph
	focus.append("circle")
		.attr("r", 7.5);
	// display value
	focus.append("text")
		.attr("x", 15)
		.attr("dy", ".31em");
	// add object to canvas
	g.append("rect")
		.attr("class", "overlay")
		.attr("width", WIDTH)
		.attr("height", HEIGHT)
		.on("mouseover", () => focus.style("display", null))
		.on("mouseout", () => focus.style("display", "none"))
		.on("mousemove", function() {
			// Find time value that matches coordinate position of mouse
			const x0 = x.invert(d3.mouse(this)[0]);
			// index of array where time value would belong if it was a data point
			const i = bisectDate(fnlCoinData, x0, 1);
			const d0 = fnlCoinData[i - 1];
			const d1 = fnlCoinData[i];
			// Compare the data our mouse is over to the two closest values
			// in the array and return the closest
			const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
			focus.attr("transform", `translate(${x(d.date)}, ${y(d[varFilter])})`);
			focus.select("text").text(d[varFilter]);
			focus.select(".x-hover-line").attr("y2", HEIGHT - y(d[varFilter]));
			focus.select(".y-hover-line").attr("x2", -x(d.date));
		});
}

$("#date-slider")
	.slider({
		range: true,
		min: parseTime("12/05/2013").getTime(),
		max: parseTime("31/10/2017").getTime(),
		step: 86400000, // one day
		values: [
			parseTime("12/05/2013").getTime(),
			parseTime("31/10/2017").getTime()
		],
		slide: (event, ui) => {
			$("#dateLabel1").text(formatTime(new Date(ui.values[0])));
			$("#dateLabel2").text(formatTime(new Date(ui.values[1])));
			update();
		}
	});

$("#coin-select")
	.on("click", () => {
		update();
	});

$("#var-select")
	.on("click", () => {
		update();
	});
