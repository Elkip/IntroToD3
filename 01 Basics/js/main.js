const svg = d3.select("#chart-area").append("svg")
    .attr("width", 400)
    .attr("height", 400)

/*
svg.append("circle")
    .attr("cx", 100)
    .attr("cy", 250)
    .attr("r", 70)
    .attr("fill", "red")
*/

/*svg.append("rect")
    .attr("x", 10)
    .attr("y", 25)
    .attr("width", 400)
    .attr("height", 400)
    .attr("fill", "blue")*/


svg.append("line")
    .attr("x1", 10)
    .attr("y1", 25)
    .attr("x2", 400)
    .attr("y2", 400)
    .attr("stroke", "blue")
    .attr("stroke-fill", "5")
