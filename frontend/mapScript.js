console.log('script is running')

// Dimensions for map
const width = 1000;
const height = 800;

// SVG element that targets canvas div
const svg = d3.select('#canvas')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('border', '3px solid black')
  .style('border-radius', '25px');

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

// Projection for drawing a Mercator map
const projection = d3.geoMercator()
  .scale(140)
  .translate([width / 2, height / 1.3]);

  //Defining path to draw the map with borders
const path = d3.geoPath(projection);
const g = svg.append('g');

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
d3.json('http://localhost:3000/api/carbonCap').then(carbonCap => {
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
      // Interactive element. When hovering over a country (mouseover) drawn by the CDN data
      // it displays data from the API,
      .on('mouseover', (event, d) => {
        const name = d.properties.name; //Names from the geojson data
        const lookupName = nameCorrection[name] || name; //Calls for the 
        const co2_pr_capital_emissions = countryInfo[selectedYear] ? countryInfo[selectedYear][lookupName] : null;

        let dataBoxText = `<strong>Country:</strong> ${name}`;
        if (co2_pr_capital_emissions !== null && co2_pr_capital_emissions !== undefined) {
          dataBoxText += `<br><strong>Year:</strong> ${selectedYear}`;
          dataBoxText += `<br><strong>CO₂ per capita:</strong> ${co2_pr_capital_emissions}t`;
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
