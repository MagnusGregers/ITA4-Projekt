//width, height, and padding for the graph. Padding ensures the axis does not overlap
const w = 1500;
const h = 500;
const padding =2;
const axisPadding = 60;

//the dataset is set up with emissions pr. country from the most resent year 2021

let dataset_carbon_cap = [];
// data setup is [emission, area, country]

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

//declaring the axis to be used later.
let yScale = null;
let xScale = null;
let xAxis = null;
let yAxis = null;

//shows the graph when the webserver loads
InitializeGraph(dataset_carbon_cap, true);


//sorting buttons nad adding click event listeners to sorting buttons
d3.selectAll("#sortByemission, #sortByarea_km, #sortByCountry").on(
  "click",
  function (e) {
//tracks witch button is pressed
// Get the ID of the clicked button to determine sort type
let id = e.target.id;
console.log(id); //logging which one is pressed
let isCountry = false;
if (id === "sortByCountry") {
    isCountry = true; // Mark true if sorting (used for axis label logic)
}
//sorting the data, when done the sorting is logged based on the button pressed
sortData(id);
 console.log("Sorted data by " + id + " : ", dataset_carbon_cap);

 //sorting animation to reflect the chosen data 
 animateData(dataset_carbon_cap, isCountry);
  }
);

function InitializeGraph(dataset_carbon_cap, isCountry) {
// Step 1: Set up scales and axes based on the dataset and axis label
setUp(dataset_carbon_cap, isCountry);
// Step 2: Create the initial bar chart with default bars
createDefaultChart(dataset_carbon_cap);
// Step 3: Add X and Y axes to the SVG
addAxes ();
}

function setUp (dataset_carbon_cap, isCountry) {
  //sets up the graph by creating a linear skala, that converts the values from the dataset to the y-and x-positions
  yScale = createScaleY(dataset_carbon_cap);
  xScale = createScaleX(dataset_carbon_cap);
  //making the actual lines 
  xAxis = createAxisX(xScale, isCountry);
  yAxis = createAxisY(yScale);
}


//defining the colors for the barchart
const colors = ["#F3D58D", "#F3D58D", "#E59D2C", "#F99256", "#C74E51"];


// Function to determine the color of each bar based on the value
// Higher values get darker colors; lower values get lighter colors
function getColor(value, maxValue) {
  const ratio = value / maxValue;
  const index = Math.floor(ratio * (colors.length - 1));
  return colors[index];
}

function createDefaultChart (dataset_carbon_cap) {
  // finding the highest value to add color scaling
const maxArea =d3.max(dataset_carbon_cap, d => d[0]);
//adding a mouseover function
  const tooltip = d3.select("#tooltip");

//now the barchat is build, enery coloum gets a unique key
//this is done for d3 to reginize dem and bind the data to the bars
svg
.selectAll ("rect")
.data(dataset_carbon_cap, function (d) { //using country as key
    return d[2];
})
.enter()
.append("rect")
//set x position based on index and scale
.attr("x", function (d, i) {
    return xScale (i) + padding;
})
//set y position based on emission value
.attr("y", function (d) {
      return yScale(d[0]);
    })
    .attr(
      "width",
      w / dataset_carbon_cap.length - 2 * padding - (2 * axisPadding) / dataset_carbon_cap.length
    )
    .attr("height", function (d) {
      console.log("height: " + (yScale(d[0]) - axisPadding));
      return h - padding - axisPadding - yScale(d[0]);
    })
    //setting it to fill color depending on emission value
    .attr("fill", d => getColor(d[0], maxArea))
    
    
    //adding a mouseover event to show the tooltip with data info
  .on("mouseover", (event, d) => {
    tooltip
      .style("opacity", 1) //makeing it opacique
      //shows the country name, emission and area for the country hovering over
  .html(`
      <strong>Country:</strong> ${d[2]}<br>
      <strong>Emission:</strong> ${d[0]}<br>
      <strong>Area:</strong> ${d[1].toLocaleString()} km²
    `);
})
  //opdating the position while the mouse moves over the bar
  .on("mousemove", (event) => {
    tooltip
    //sits the mouseover to the right and a little above of the mause 
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 35) + "px");
  })
  //removes it when the mouse is no longer on the bar 
  .on("mouseout", () => {
    tooltip.style("opacity", 0);

  });
}

//making the xscale based on the data
function createScaleX(dataset_carbon_cap) {
  return (
    d3
    .scaleBand()
    //defining the area (range)
      .range([padding + axisPadding, w - padding - axisPadding])
      //defining the domain as a index for each country
      .domain(
              dataset_carbon_cap.map(function (d, i) {

          return i; //used to place the bars
        })
      )
  );
}
//same but with yscale based on the data
function createScaleY(dataset_carbon_cap) {
  return d3
    .scaleLinear()
    //the domain starts with 0 until max.
    .domain([
      0,
      d3.max(dataset_carbon_cap, function (d) {
        return d[0];
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

function createAxisX(xScale, isCountry) {
  return (
    d3
    //isCountry desides which value is chosen
      .axisBottom()
      .scale(xScale)
      .tickFormat(function (d) {
        //when sorting by country (isCountry ==true), show name
        if (isCountry) {
          return dataset_carbon_cap[d][0]; // countrys
        } else {
          return dataset_carbon_cap[d][2]; //alternative value
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
function animateData(data, isCountry) {
  setUp(data, isCountry); // updating the scales and axis
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
    dataset_carbon_cap.sort(function (a, b) {
      return b[0] - a[0];
    });


    //sorting by area_km
  } else if (by === "sortByarea_km") {
    dataset_carbon_cap.sort(function (a, b) {

      return b[1] - a[1];
    });
  } else {
    //sorting after country alphabetically
    dataset_carbon_cap.sort(function (a, b) {
      return a[2].localeCompare(b[2]);
    });
  }
}
//insures the script is read
console.log("graph is loaded");