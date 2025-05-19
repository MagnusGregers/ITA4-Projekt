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

// Display for data when hovering above a country
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

const path = d3.geoPath(projection);
const g = svg.append('g');

let countryInfo = {}; // To hold API data keyed by country name

// Fixes names between the geojson and api data
const nameCorrection = {
  "United States of America": "United States",
  
};

d3.json('http://localhost:3000/api/dbData').then(dbData => {
  dbData.forEach(entry => {
    countryInfo[entry.country] = entry;
  });

  loadMap();
});

function loadMap() {
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
    .then(worldData => {
      const countries = topojson.feature(worldData, worldData.objects.countries);

      g.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', path)
        .on('mouseover', (event, d) => {
          const name = d.properties.name;
          const lookupName = nameCorrection[name] || name;
          const api = countryInfo[lookupName];
          console.log(d.properties.name)

          let dataBoxText = `<strong>Country:</strong> ${d.properties.name}`;
          if (api) {
            dataBoxText += `<br><strong>Year:</strong> ${api.year}`;
            dataBoxText += `<br><strong>CO₂ per capita:</strong> ${api.pr_capita_co2_emissions}`;
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
