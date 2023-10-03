class LineChart {
    constructor(_parentElement) {
        this.parentElement = _parentElement;
        this.initVis();
    }

    // Set up static parts of visualization
    initVis() {
        const vis = this;

        vis.MARGIN = { LEFT: 70, RIGHT: 100, TOP: 50, BOTTOM: 100 };
        vis.WIDTH = 800 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT;
        vis.HEIGHT = 500 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM;
        // create svg area
        vis.svg = d3.select(vis.parentElement).append("svg")
            .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
            .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM);
        vis.g = vis.svg.append("g")
            .attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`);

        // for tooltip, an object to return where a point would fall in the data
        vis.bisectDate = d3.bisector(d => d.date).left;
        // scales
        vis.x = d3.scaleTime().range([0, vis.WIDTH]);
        vis.y = d3.scaleLinear().range([vis.HEIGHT, 0]);
        // axis generators
        vis.xAxisCall = d3.axisBottom()
            .ticks(6);
        // .tickFormat((d) => d.getFullYear());
        vis.yAxisCall = d3.axisLeft()
            .ticks(6)
            .tickFormat(d => `${parseInt(d / 1000)}k`);
        // axis groups
        vis.xAxis = vis.g.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${vis.HEIGHT})`);
        vis.yAxis = vis.g.append("g")
            .attr("class", "y axis");
        // y-axis label
        vis.yLabel = vis.yAxis.append("text")
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
        vis.xLabel = vis.g.append("text")
            .attr("x", vis.WIDTH / 2)
            .attr("y", vis.HEIGHT + 80)
            .attr("font-size", "20px")
            .attr("text-anchor", "middle")
            .text("Year");
        // add line to chart
        vis.g.append("path")
            .attr("class", "line")

        vis.wrangleData();
    }

    // selecting/filtering data to use
    wrangleData() {
        const vis = this;

        vis.coinFilter = $("#coin-select").val();
        vis.varFilter = $("#var-select").val();
        vis.sliderFilters = $("#date-slider").slider("values");
        console.log(vis.sliderFilters)
        vis.fnlCoinData = coinData[vis.coinFilter]
            .filter(d => {
                return (d.date >= vis.sliderFilters[0] && d.date <= vis.sliderFilters[1]);
            });
        console.log(vis.fnlCoinData);

        vis.updateVis();
    }

    // updating elements to match new data
    updateVis() {
        const vis = this;

        vis.t = d3.transition().duration(1000);

        // set scale domains
        vis.x.domain(d3.extent(vis.fnlCoinData, d => d.date));
        vis.y.domain([0, d3.max(vis.fnlCoinData, d => d[vis.varFilter]) * 1.005]);
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
            .x(d => vis.x(d.date))
            .y(d => vis.y(d[vis.varFilter]));
        // add line to chart
        vis.g.select(".line")
            .transition(vis.t)
            .attr("d", line(vis.fnlCoinData));
        // y axis label
        const yText = (vis.varFilter === "price_usd") ? "Price($)" :
            (vis.varFilter === "market_cap") ? "Market Capitalization ($)" :
                "24 Hour Trading Volume ($)";
        vis.yLabel.text(yText);
        // generate axes once scales have been set
        vis.xAxisCall.scale(vis.x);
        vis.xAxis.transition(vis.t).call(vis.xAxisCall);
        vis.yAxisCall.scale(vis.y);
        vis.yAxis.transition(vis.t).call(vis.yAxisCall.tickFormat(formatAbbreviation))
        // remove current elements
        d3.select(".focus").remove();
        d3.select(".overlay").remove();
        /******************************** Tooltip Code ********************************/
        vis.focus = vis.g.append("g")
            .attr("class", "focus")
            .style("display", "none");
        // vertical line
        vis.focus.append("line")
            .attr("class", "x-hover-line hover-line")
            .attr("y1", 0)
            .attr("y2", vis.HEIGHT);
        // horizontal line
        vis.focus.append("line")
            .attr("class", "y-hover-line hover-line")
            .attr("x1", 0)
            .attr("x2", vis.WIDTH);
        // circle on graph
        vis.focus.append("circle")
            .attr("r", 7.5);
        // display value
        vis.focus.append("text")
            .attr("x", 15)
            .attr("dy", ".31em");
        // add object to canvas
        vis.g.append("rect")
            .attr("class", "overlay")
            .attr("width", vis.WIDTH)
            .attr("height", vis.HEIGHT)
            .on("mouseover", () => vis.focus.style("display", null))
            .on("mouseout", () => vis.focus.style("display", "none"))
            .on("mousemove", function(event) {
                // Find time value that matches coordinate position of mouse
                const x0 = vis.x.invert(d3.pointer(event)[0]);
                // index of array where time value would belong if it was a data point
                const i = vis.bisectDate(vis.fnlCoinData, x0, 1);
                const d0 = vis.fnlCoinData[i - 1];
                const d1 = vis.fnlCoinData[i];
                // Compare the data our mouse is over to the two closest values
                // in the array and return the closest
                const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                vis.focus.attr("transform", `translate(${vis.x(d.date)}, ${vis.y(d[vis.varFilter])})`);
                vis.focus.select("text").text(d[vis.varFilter]);
                vis.focus.select(".x-hover-line").attr("y2", vis.HEIGHT - vis.y(d[vis.varFilter]));
                vis.focus.select(".y-hover-line").attr("x2", - vis.x(d.date));
            });
    }
}
