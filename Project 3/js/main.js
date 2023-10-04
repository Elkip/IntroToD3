/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 3 - CoinStats
*/
let lineChart;
let donutChart1;
let donutChart2;
let timeline;
let coinData;
let donutData;

const parseTime = d3.timeParse("%d/%m/%Y");
const formatTime = d3.timeFormat("%d/%m/%Y");
const color = d3.scaleOrdinal(d3.schemePastel1)

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

			const dates = ui.values.map(val => new Date(val))
			const xVals = dates.map(date => timeline.x(date))
			timeline.brushComponent.call(timeline.brush.move, xVals)
		}
	});

$("#coin-select")
	.on("click", () => {
		updateCharts();
	});

$("#var-select")
	.on("click", () => {
		updateCharts();
	});

d3.json("data/coins.json").then(data => {
	coinData = {};
	donutData = [];
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
		donutData.push({
			"coin": coin,
			"data": coinData[coin].slice(-1)[0]
		});
	});

	lineChart = new LineChart("#line-area");
	donutChart1 = new DonutChart("#donut-area1", "24h_vol");
	donutChart2 = new DonutChart("#donut-area2", "market_cap");
	timeline = new Timeline("#timeline-area")
});

function brushed(event) {
	const selection = event.selection || timeline.x.range()
	const newValues = selection.map(timeline.x.invert)

	$("#date-slider")
		.slider('values', 0, newValues[0])
		.slider('values', 1, newValues[1])
	$("#dateLabel1").text(formatTime(newValues[0]))
	$("#dateLabel2").text(formatTime(newValues[1]))

	lineChart.wrangleData()
}

function arcClicked(arc) {
	$("#coin-select").val(arc.data.coin);
	updateCharts();
}

function updateCharts() {
	lineChart.wrangleData();
	donutChart1.wrangleData();
	donutChart2.wrangleData();
	timeline.wrangleData();
}
