//width, height, and padding for the graph. Padding ensures the axis does not overlap
const w = 500;
const h = 250;
const padding =10;
const axisPadding = 20;

//the dataset is set up with emissions pr. country from the most resent year 2021
/*
const dataset_carbon_cap = [ 
[0.987654, 27, "2023-10-30 08:22:14"],
[0.456789, 15, "2023-10-30 09:45:22"],
[0.654321, 31, "2023-10-30 10:11:05"],
[0.888888, 63, "2023-10-30 12:05:10"],
[0.754123, 42, "2023-10-30 14:30:00"],
[0.182739, 87, "2023-10-30 15:15:30"],
[0.111111, 66, "2023-10-30 16:59:03"],
[0.56789, 74, "2023-10-30 18:10:45"],
[0.123456, 99, "2023-10-30 20:40:55"],
[0.333333, 53, "2023-10-30 22:55:30"],
];
*/

let dataset_carbon_cap = [];

fetch('/api/ita4')
  .then(response => response.json())
  .then(data => {
    dataset_carbon_cap = data.map(d => [
      parseFloat(d.pr_capita_co2_emissions),  // emission som tal
      parseInt(d.area_km2),                     // areal som heltal
      d.country                                // land som tekst
    ]);
    console.log(dataset_carbon_cap);

    InitializeGraph(dataset_carbon_cap, true);  // sæt true hvis x-aksen skal vise country
  })
  .catch(error => console.error('Fejl:', error));


//const dataset_gdp = [];


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
//setting the dinamic values and makeing the standard chart
setUp(dataset_carbon_cap, isCountry);
createDefaultChart(dataset_carbon_cap);
//adding axes
addAxes ();
}

function setUp (dataset_carbon_cap, isCountry) {
  yScale = createScaleY(dataset_carbon_cap);
  xScale = createScaleX(dataset_carbon_cap);
  xAxis = createAxisX(xScale, isCountry);
  yAxis = createAxisY(yScale);
}

function createDefaultChart (dataset_carbon_cap) {
//now the barchat is build, enery coloum gets a unique key
//this is done for d3 to reginize dem
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
    .attr("fill", function (d) {
      return "rgb(0, 0, " + (256 - d[1] * 2) + ")";
    });
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