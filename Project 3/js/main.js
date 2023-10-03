/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 3 - CoinStats
*/
let lineChart;
let coinData;

// time parser for x-scale
const parseTime = d3.timeParse("%d/%m/%Y");
const formatTime = d3.timeFormat("%d/%m/%Y");

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
			lineChart.wrangleData();
		}
	});

$("#coin-select")
	.on("click", () => {
		lineChart.wrangleData();
	});

$("#var-select")
	.on("click", () => {
		lineChart.wrangleData();
	});

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
	lineChart = new LineChart("#chart-area");
});


