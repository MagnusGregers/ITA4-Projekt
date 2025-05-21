const w = 500;
const h = 100;
const padding = 2;

const dataset_gdp = [];

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

const svggdp = d3
  .select("#barChart")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

svggdp
  .selectAll("rect")
  .data(dataset)
  .enter()
  .append("rect")
  .attr("x", function (d, i) {
    return i * (w / dataset.length);
  })
  .attr("y", function (d) {
    return h - d * 4;
  })
  .attr("width", w / dataset.length - padding)
  .attr("height", function (d) {
    return d * 4;
  })
  .attr("fill", "black");