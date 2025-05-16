
console.log('script is running')

//Two const's used for the map
const width = 1000;
const height = 800;

//svg element that targets the canvas div
const svg = d3.select('#canvas')
  .append('svg')
  .attr('width', width)
  .attr('height', height) 
  .style('border', '3px solid black')
  .style('border-radius', '25px');
  

//fun fact box group element 
const fun_fact = svg.append('g')
.attr('class', 'fun_fact')
.attr('transform','translate(10, 10)');

//Data display when hovering above country
const dataBox = d3.select('#dataBox')
  .append('dataBox')
  .attr('class', 'dataBox')
  .style('position', 'absolute')
  .style('z-index', 1000)
  .style('background', 'white')
  .style('padding', '8px')
  .style('border', '1px solid #ccc')
  .style('border-radius', '8px')
  .style('pointer-events', 'none')
  .style('font-family', 'sans-serif')
  .style('font-size', '14px')
  .style('visibility', 'hidden');



//fun fact box 
fun_fact.append('rect')
.attr('width', 300)
.attr('height', 80)
.style('fill', 'white')
.style('stroke', '#ccc')
.style('border', '1px solid black')
.attr('rx', '10')
.attr('ry','10');

//fun fact box text
fun_fact.append('text')
.attr('x', '10')
.attr('y', '20')
.style('font-family', 'sans-serif')
.style('font-size', '14px')
.style('fill', '#333')
.text('Insert fun fact here');  

fun_fact.append('text')
.attr('x', '10')
.attr('y', '40')
.style('font-family', 'sans-serif')
.style('font-size', '14px')
.style('fill', '#333')
.text('Or here i dont care');

//Projection used for the map itself
const projection = d3.geoMercator().scale(140)
.translate([width/ 2, height/ 1.3]); //Translates the map to fit the page

//creates path that converts geoJSON to SVG strings
const path = d3.geoPath(projection);

//group element 'g', for the country paths
const g = svg.append('g');


//Logging data from our api
d3.json('http://localhost:3000/api/dbData').then(countryData => {
  console.log(countryData); 
  
});
//data on the world map from a CDN
d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
.then(data=> {
  const countries = topojson.feature(data, data.objects.countries); //converts topojson to geojson

  g.selectAll('path').data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path);
    
// When creating your countries paths...
d3.selectAll('path.country')
  .on('mouseover', () => dataBox.style('visibility', 'visible'))
  .on('mousemove', (event) => {
    dataBox
      .style('top', (event.pageY + 10) + 'px')
      .style('left', (event.pageX + 10) + 'px')
      .style('color', '#333')
      .text('Land: Danmark');
  })
  .on('mouseout', () => dataBox.style('visibility', 'hidden'));

});

console.log('World map bbyyyy')