//width, height, and padding for the graph. Padding ensures the axis does not overlap
const w = 500;
const h = 250;
const padding =10;
const axisPadding = 30;

//the dataset is set up with emissions pr. country from the most resent year 2021

let dataset_carbon_cap = [];

fetch('/api/top20')
  .then(response => response.json())
  .then(data => {
    dataset_carbon_cap = data.map(d => [
      parseFloat(d.pr_capita_co2_emissions),  // emission as numbers
      parseInt(d.area_km2),                     // area as wholenumbers
      d.country                                // Country as text
    ]);
    console.log(dataset_carbon_cap);

    InitializeGraph(dataset_carbon_cap, true);  // to show country on the x axis (true)
  })

//adding svg elements to the body
const svg = d3.select("body").append("svg").attr("width", w).attr("height", h);

let yScale = null;
let xScale = null;
let xAxis = null;
let yAxis = null;

//shows the graph when the webserver loads
InitializeGraph(dataset_carbon_cap, false);

//sorting buttons
d3.selectAll("#sortByemission, #sortByContinent, #sortByCountry").on(
  "click",
  function (e) {
//tracks witch button is pressed
let id = e.target.id;
console.log(id);
let isCountry = false;
if (id === "sortByCountry") {
    isCountry = true;
}
//sorting the data, when done the soring is logged
sortData(id);
 console.log("Sorted data by " + id + " : ", dataset_carbon_cap);

 //sorting animation
 animateData(dataset_carbon_cap, isCountry);
  }
);

function InitializeGraph(dataset_carbon_cap, isCountry) {
//the function calls supfuctions -  this function is what creates the chart (scales, bars and axis)
setUp(dataset_carbon_cap, isCountry);
createDefaultChart(dataset_carbon_cap);
//adding axes with a <g> element
addAxes ();
}

function setUp (dataset_carbon_cap, isCountry) {
  //sets up the graph by creating a linear skala, that converts the values from the dataset tp the y-and x-positions
  yScale = createScaleY(dataset_carbon_cap);
  xScale = createScaleX(dataset_carbon_cap);
  //making the actual lines 
  xAxis = createAxisX(xScale, isCountry);
  yAxis = createAxisY(yScale);
}


//defining the colors for the barchart
const colors = ["#CCDBDC", "#80CED7", "#297045", "#63C7B2", "#485696"];

//for each bar the fucktion getcolor is udes to mach the color with a value (high numers = light colors) dark colors = high values.
function getColor(value, maxValue) {
  const ratio = value / maxValue;
  const index = Math.floor(ratio * (colors.length - 1));
  return colors[index];
}

function createDefaultChart (dataset_carbon_cap) {
  // finding the bigest value to add color
const maxArea =d3.max(dataset_carbon_cap, d => d[1]);

//now the barchat is build, enery coloum gets a unique key
//this is done for d3 to reginize dem and bind the data to the bars
svg
.selectAll ("rect")
.data(dataset_carbon_cap, function (d) {
    return d[2];
})
.enter()
.append("rect")
.attr("x", function (d, i) {
    return xScale (i) + padding;
})
.attr("y", function (d) {
      return yScale(d[1]);
    })
    .attr(
      "width",
      w / dataset_carbon_cap.length - 2 * padding - (2 * axisPadding) / dataset_carbon_cap.length
    )
    .attr("height", function (d) {
      console.log("height: " + (yScale(d[1]) - axisPadding));
      return h - padding - axisPadding - yScale(d[1]);
    })
    .attr("fill", d => getColor(d[1], maxArea));
}

function createScaleX(dataset_carbon_cap) {
  return (
    d3
    .scaleBand()
      .range([padding + axisPadding, w - padding - axisPadding])
      .domain(
              dataset_carbon_cap.map(function (d, i) {

          return i;
        })
      )
  );
}
function createScaleY(dataset_carbon_cap) {
  return d3
    .scaleLinear()
    .domain([
      0,
      d3.max(dataset_carbon_cap, function (d) {
        return d[1];
      }),
    ])
    .range([h - padding - axisPadding, padding + axisPadding])
    .nice();
}

function createAxisY(yScale) {
  return d3.axisLeft().scale(yScale).ticks(5);
}

function createAxisX(xScale, isCountry) {
  return (
    d3
    //isCountry desides which value is chosen
      .axisBottom()
      .scale(xScale)
      .tickFormat(function (d) {
        if (isCountry) {
          return dataset_carbon_cap[d][0];
        } else {
          return dataset_carbon_cap[d][2];
        }
      })
  );
}

function addAxes() {
  svg
    .append("g")
    .attr("transform", "translate(0," + (h - padding - axisPadding) + ")")
    .attr("id", "xAxis");

  svg
    .append("g")
    .attr("transform", "translate(" + (padding + axisPadding) + ",0)")
    .attr("id", "yAxis")
    .call(yAxis);

  //to insure the lable sits correct
  formatAxisX();
}

function formatAxisX() {
  svg
    .select("#xAxis")
    .call(xAxis)
    .call(xAxis.tickSize(0))
    .selectAll("text")
    .attr("transform", "translate(-10,5)rotate(-45)")
    .style("text-anchor", "end");
}

function animateData(data, isCountry) {
  setUp(data, isCountry);
  formatAxisX();
  svg
    .selectAll("rect")
    .data(data, function (d) {
      return d[2];
    })
 
    //starting the animation
    .transition()
    .duration(2000)

    .attr("x", function (d, i) {
      return xScale(i) + padding;
    });
}

function sortData(by) {

  if (by === "sortByemission") {
    dataset_carbon_cap.sort(function (a, b) {
      return b[1] - a[1];
    });
  } else if (by === "sortByContinent") {
    dataset_carbon_cap.sort(function (a, b) {

      return new Date(a[2]) - new Date(b[2]);
    });
  } else {
    dataset_carbon_cap.sort(function (a, b) {
      return a[0] - b[0];
    });
  }
}
console.log("graph is loaded");