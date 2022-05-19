
// Set up SVG grid
const svg = d3.select("#chart-area").append("svg")
    .attr("width", 400)
    .attr("height", 400)

svg.append("rect")
    .attr("x", 10)
    .attr("y", 25)
    .attr("width", 10)
    .attr("height", 40)
    .attr("fill", "blue")

svg.append("line")
    .attr("x1", 10)
    .attr("y1", 25)
    .attr("x2", 400)
    .attr("y2", 400)
    .attr("stroke", "blue")
    .attr("stroke-fill", "5")

const data = [25, 20, 15, 10, 5]

// Select all circles on screen and associate with our data
const circles = svg.selectAll("circle")
    .data(data)

// Using the enter method we can append the data,
// so we have a circle for every item in the data array
// Doing this we can also set the attributes to be
// a function of data in the array
circles.enter().append("circle")
    .attr("cx", (d, i) => {
        console.log("Item: " + d, "Index: " + i)
        return (i * 50) + 50
    })
    .attr("cy", 250)
    .attr("r", (d) => d)
    .attr("fill", "red")


