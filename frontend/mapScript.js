
console.log('script is running')

// Dimensions for map
const widthMap = 1000;
const heightMap = 800;

// SVG element that targets canvas div
const svgMap = d3.select('#canvas')
  .append('svg')
  .attr('width', widthMap)
  .attr('height', heightMap)
  .style('border-radius', '25px');

  //fun fact box group element 
const fun_fact = svgMap.append('g')
.attr('class', 'fun_fact')
.attr('transform','translate(10, 10)');

// Display for data when hovering above a country with some style 
const dataBox = d3.select('#dataBox')
  .style('position', 'absolute')
  .style('z-index', 1000)
  .style('background', 'white')
  .style('padding', '8px')
  .style('border', '1px solid #ccc')
  .style('border-radius', '8px')
  .style('pointer-events', 'none')
  .style('font-family', 'sans-serif')
  .style('font-size', '14px')
  .style('visibility', 'hidden')
  .style('color', '#000');

  //fun fact box 
fun_fact.append('rect')
.attr('width', 400)
.attr('height', 90)
.style('fill', '#E59D2C')
.style('stroke', '#ccc')
.style('border', '1px solid black')
.attr('rx', '10')
.attr('ry','10');

//fun fact box text
const text = fun_fact.append('text')
.attr('x', '10')
.attr('y', '20')
.style('font-family', 'sans-serif')
.style('font-size', '14px')
.style('fill', 'white');

text.append('tspan')
  .text("Map of the world's Co2 emission per capita from each country,")
  .attr('x', 10)
  .attr('dy', 0); 

  text.append('tspan')
  .text("showing emission from the years 1990-2021")
  .attr('x', 10)
  .attr('dy', '1.2em');  

  text.append('tspan')
  .text("Click the dropdown to toggle between the years")
  .attr('x', 10)
  .attr('dy', '1.7em')
  .style('font-weight','bold'); 

  text.append('tspan')
  .text("Then hover your cursor above a country to see emission!")
  .attr('x', 10)
  .attr('dy', '1.2em')
  .style('font-weight','bold'); 
   


// Projection for drawing a Mercator map
const projection = d3.geoMercator()
  .scale(140)
  .translate([widthMap / 2, heightMap / 1.3]);

  //Defining path to draw the map with borders
const path = d3.geoPath(projection);
const g = svgMap.append('g');

//Dropdown for selecting specific year to display data
const select = d3.select('#selectYear');
//Object holding the data as countryInfo
let countryInfo = {}; 
let selectedYear;     

// Fixes name inconsistencies between geojson and API data
const nameCorrection = {
  "United States of America": "United States",
  "Central African Rep.": "Central African Republic",
  "S. Sudan": "South Sudan",
  "Dem. Rep. Congo":"Democratic Republic of Congo",
  "Eq. Guinea":"Equatorial Guinea",
  "Côte d'Ivoire": "Cote d'Ivoire",
  "Mali": "Mali",
  "Dominican Rep.": "Dominican Republic",
  "Bosnia and Herz.": "Bosnia and Herzegovina",
  "Macedonia": "North Macedonia"
};

//Fetching data from our database through an API
fetch('/api/carbonCap').then(res => res.json())
.then(carbonCap => {
  carbonCap.forEach(entry => {
    if (!countryInfo[entry.year]) {
      countryInfo[entry.year] = {};
    }
    countryInfo[entry.year][entry.country] = parseFloat(entry.pr_capita_co2_emissions);
  });

  // Populates dropdown with years
  Object.keys(countryInfo).forEach(year => {
    select.append('option')
    .attr('value', year)
    .text(year);
  });

  // Initialize selectedYear to first available year
  selectedYear = Object.keys(countryInfo)[0];

  // Update selectedYear dropdown when selecting year 
  select.on('change', function() {
    selectedYear = this.value;
  });

  loadMap();
});
// Function that fetches geojson data and draws countries as path elements
function loadMap() {
  //Takes geoJson data and converts to topoJson
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
    .then(worldData => {
      const countries = topojson.feature(worldData, worldData.objects.countries);

      g.selectAll('path')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path)
      // Interactive element. When hovering over a country (mouseover) drawn by the CDN data, it displays data from the API,
      .on('mouseover', (event, d) => {
        const name = d.properties.name; //Names from the geojson data
        const lookupName = nameCorrection[name] || name; //Calls for the name correction to either use the corrected name if listed or the default name form the dataset
        // If The cata for countryinfo[selectYear] exists, use that, otherwise set result to null.
        const co2_pr_capital_emissions = countryInfo[selectedYear] ? countryInfo[selectedYear][lookupName] : null;

        let dataBoxText = `<strong>Country:</strong> ${name}`;
        if (co2_pr_capital_emissions !== null && co2_pr_capital_emissions !== undefined) {
          dataBoxText += `<br><strong>Year:</strong> ${selectedYear}`;
          dataBoxText += `<br><strong>Co2 per capita:</strong> ${co2_pr_capital_emissions}t`;
        } else {
          dataBoxText += `<br><em>No data available</em>`;
          }

          dataBox
            .style('top', (event.pageY + 10) + 'px')
            .style('left', (event.pageX + 10) + 'px')
            .style('visibility', 'visible')
            .html(dataBoxText);
        })
        .on('mouseout', () => {
          dataBox.style('visibility', 'hidden');
        });
    });
}
