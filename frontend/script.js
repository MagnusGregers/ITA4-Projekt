
//----------------animation (waves)--------------//

// - Wave model

// - wave animation

//------------Graph------------------//

// - header and text

// - bar chart race (carbon_cap)

// - bar chart race (gdp)

// - dropdown button for each year

//-------------animation (plane)-------------//
// Starts by making different const to call back to.
const svgWidth = window.innerWidth;
const cloudGroup = d3.select("#cloudGroup");
const planeGroup = d3.select("#planeGroup");
const plane = d3.select("#plane");

// here we make the drawing of the clouds.
function drawCloud(x, y, scale) {
  const cloud = cloudGroup.append("g")
    .attr("transform", `translate(${x}, ${y}) scale(${scale})`);

  cloud.append("circle").attr("r", 20).attr("cx", 0).attr("cy", 0).attr("fill", "white");
  cloud.append("circle").attr("r", 25).attr("cx", 20).attr("cy", -10).attr("fill", "white");
  cloud.append("circle").attr("r", 20).attr("cx", 40).attr("cy", 0).attr("fill", "white");

  animateCloud(cloud, x, y, scale);
}

// here we animate the clouds.
function animateCloud(cloud, startX, y, scale) {
  cloud
    .transition()
    .duration(30000 + Math.random() * 10000)
    .ease(d3.easeLinear)
    .attrTween("transform", () => {
      return t => {
        const x = startX + t * ((svgWidth + 100) - startX);
        return `translate(${x}, ${y}) scale(${scale})`;
      };
    })
    .on("end", () => {
      cloud.remove();
    });
}

// cloud-generator.
setInterval(() => {
  const y = 40 + Math.random() * 60;
  const scale = 0.6 + Math.random() * 0.6;
  drawCloud(0, y, scale);
}, 2000);

// here we animate the plane.
function animatePlane() {
  plane
    .attr("x", -600)
    .transition()
    .duration(20000)
    .ease(d3.easeLinear)
    .attr("x", svgWidth + 200)
    .on("end", animatePlane);
}
animatePlane();

// Scroll effect. 
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  // updates the position of the clouds and plane based by the scroll effect.
  const offset = scrollY * 0.3;
  cloudGroup.attr("transform", `translate(0, ${offset})`);
  planeGroup.attr("transform", `translate(0, ${offset})`);
});
//---------------World map-----------------//

// - Map

// - fun fact box

// - button for shoing each continent and countries

// - hover effekt on the map

// - dropdown button for choosing a specific year

//-----------------memory game--------------------//

// - ship model

// - truck model

// - cards

// - text

// - turning animation

// - try again button

// - game over and wind scrren when game is done

