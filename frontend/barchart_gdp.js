//width, height, and padding for the graph. Padding ensures the axis does not overlap
const w = 500;
const h = 250;
const padding =10;
const axisPadding = 30;

//the dataset is set up with emissions pr. country from the most resent year 2021

let dataset_gdp = [];

fetch('/api/gdp')
  .then(response => response.json())
  .then(data => {
    dataset_gdp = data.map(d => [
      parseFloat(d.gdp_pr_capital),  // gdp as ,numbers
      parseInt(d.area_km2),                     // area as wholenumbers
      d.country                                // Country as text
    ]);
    console.log(dataset_gdp);

    InitializeGraph(dataset_gdp, true);  // to show country on the x axis (true)
  })

//adding svg elements to the body
const svg = d3.select("body").append("svg").attr("width", w).attr("height", h);

let yScale = null;
let xScale = null;
let xAxis = null;
let yAxis = null;

//shows the graph when the webserver loads
InitializeGraph(dataset_gdp, false);

//sorting buttons
d3.selectAll("#sortByemission, #sortByContinent, #sortByCountry").on(
  "click",
  function (e) {
//tracks witch button is pressed
let id = e.target.id;
console.log(id);
let isGdp = false;
if (id === "sortByCountry") {
    isGdp = true;
}
//sorting the data, when done the soring is logged
sortData(id);
 console.log("Sorted data by " + id + " : ", dataset_gdp);

 //sorting animation
 animateData(dataset_gdp, isGdp);
  }
);

function InitializeGraph(dataset_gdp, isGdp) {
//the function calls supfuctions -  this function is what creates the chart (scales, bars and axis)
setUp(dataset_gdp, isGdp);
createDefaultChart(dataset_gdp);
//adding axes with a <g> element
addAxes ();
}

function setUp (dataset_gdp, isGdp) {
  //sets up the graph by creating a linear skala, that converts the values from the dataset tp the y-and x-positions
  yScale = createScaleY(dataset_gdp);
  xScale = createScaleX(dataset_gdp);
  //making the actual lines 
  xAxis = createAxisX(xScale, isGdp);
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

function createDefaultChart (dataset_gdp) {
  // finding the bigest value to add color
const maxArea =d3.max(dataset_gdp, d => d[1]);

//now the barchat is build, enery coloum gets a unique key
//this is done for d3 to reginize dem and bind the data to the bars
svg
.selectAll ("rect")
.data(dataset_gdp, function (d) {
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
      w / dataset_gdp.length - 2 * padding - (2 * axisPadding) / dataset_gdp.length
    )
    .attr("height", function (d) {
      console.log("height: " + (yScale(d[1]) - axisPadding));
      return h - padding - axisPadding - yScale(d[1]);
    })
    .attr("fill", d => getColor(d[1], maxArea));
}

//making the xscale based on the data
function createScaleX(dataset_gdp) {
  return (
    d3
    .scaleBand()
    //defining the area (range)
      .range([padding + axisPadding, w - padding - axisPadding])
      //defining the domain as a index for each country
      .domain(
              dataset_gdp.map(function (d, i) {

          return i; //used to place the bars
        })
      )
  );
}
//same but with yscale based on the data
function createScaleY(dataset_gdp) {
  return d3
    .scaleLinear()
    //the domain starts with 0 until max.
    .domain([
      0,
      d3.max(dataset_gdp, function (d) {
        return d[1];
      }),
    ])
    //the area for the yscale, from buttom (h) and to the top (0)
    .range([h - padding - axisPadding, padding + axisPadding])
    .nice(); //used to make the ticks more round
}

//makeing the yaxis and using the 
function createAxisY(yScale) {
  return d3
.axisLeft()
.scale(yScale)
.ticks(5); //shows 5 "ticks" along the y-axis
}

function createAxisX(xScale, isGdp) {
  return (
    d3
    //isGdp desides which value is chosen
      .axisBottom()
      .scale(xScale)
      .tickFormat(function (d) {
        //when sorting by country (isGdp ==true), show name
        if (isGdp) {
          return dataset_gdp[d][0]; // countrys
        } else {
          return dataset_gdp[d][2]; //alternative value
        }
      })
  );
}

//adding axis to the svg element
function addAxes() {
  //xaxis
  svg
    .append("g")
    .attr("transform", "translate(0," + (h - padding - axisPadding) + ")")
    .attr("id", "xAxis");

//yaxis
  svg
    .append("g")
    .attr("transform", "translate(" + (padding + axisPadding) + ",0)")
    .attr("id", "yAxis")
    .call(yAxis);

  //to insure the lable sits correct (fx rotating lables)
  formatAxisX();
}

function formatAxisX() {
  svg
    .select("#xAxis")
    .call(xAxis) //updates the axis
    .call(xAxis.tickSize(0)) //remove small "ticks" along the axis
    .selectAll("text")
    .attr("transform", "translate(-10,5)rotate(-45)") //rotate the lables at 45deg
    .style("text-anchor", "end"); //make the text rightsided (for better readability)
}

//amimate the changes in the data
function animateData(data, isGdp) {
  setUp(data, isGdp); // updating the scales and axis
  formatAxisX();
  svg
    .selectAll("rect")
    .data(data, function (d) {
      return d[2]; // binds the data to the country
    })
 
    //starting the animation
    .transition()
    .duration(2000)

    //updating the x-position for each bar
    .attr("x", function (d, i) {
      return xScale(i) + padding;
    });
}
// function for the bar to sort with a button click
function sortData(by) {
  if (by === "sortByemission") {
    //sort after emission (largest to smallest)
    dataset_gdp.sort(function (a, b) {
      return b[1] - a[1];
    });
  } else if (by === "sortByContinent") {
    dataset_gdp.sort(function (a, b) {

      return new Date(a[2]) - new Date(b[2]);
    });
  } else {
    //sorting after country alphabetically
    dataset_gdp.sort(function (a, b) {
      return a[0] - b[0];
    });
  }
}
//insures the script is read
console.log("graph is loaded");