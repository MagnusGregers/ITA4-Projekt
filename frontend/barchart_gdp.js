//width, height, and padding for the graph. Padding ensures the axis does not overlap
const w = 700;
const h = 500;
const padding =2;
const axisPadding = 60;

//the dataset is set up with emissions pr. country from the most resent year 2021

let dataset_gdp = [];
// data setup is [emission, area, country]

fetch('/api/gdp')
  .then(response => response.json())
  .then(data => {
    dataset_gdp = data.map(d => [
      parseFloat(d.pr_capita_co2_emissions),  // emission as numbers
      parseInt(d.area_km2),                     // area as wholenumbers
      d.country                                // Country as text
    ]);
    console.log(dataset_gdp);

    InitializeGraph(dataset_gdp, true);  // to show country on the x axis (true)
  })

//adding svg elements to the body
const svggdp = d3.select("body").append("svggdp").attr("width", w).attr("height", h);

svggdp
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
      return yScale(d[0]);
    })
    .attr(
      "width",
      w / dataset_gdp.length - 2 * padding - (2 * axisPadding) / dataset_gdp.length
    )
    .attr("height", function (d) {
      console.log("height: " + (yScale(d[0]) - axisPadding));
      return h - padding - axisPadding - yScale(d[0]);
    })
    .attr("fill", d => getColor(d[0], maxArea))
    //adding a mouseover funktion
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
          return dataset_gdp[d][0]; // countrys
        } else {
          return dataset_gdp[d][2]; //alternative value
        }
      })
  );
}

//adding axis to the svggdp element
function addAxes() {
  //xaxis
  svggdp
    .append("g")
    .attr("transform", "translate(0," + (h - padding - axisPadding) + ")")
    .attr("id", "xAxis");

//yaxis
  svggdp
    .append("g")
    .attr("transform", "translate(" + (padding + axisPadding) + ",0)")
    .attr("id", "yAxis")
    .call(yAxis);

  //to insure the lable sits correct (fx rotating lables)
  formatAxisX();
}

function formatAxisX() {
  svggdp
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
  svggdp
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
      return b[0] - a[0];
    });


    //sorting by area_km
  } else if (by === "sortByarea_km") {
    dataset_gdp.sort(function (a, b) {

      return b[1] - a[1];
    });
  } else {
    //sorting after country alphabetically
    dataset_gdp.sort(function (a, b) {
      return a[2].localeCompare(b[2]);
    });
  }
}
//insures the script is read
console.log("graph is loaded");