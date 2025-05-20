
//----------------animation (waves)--------------//
const svgWave = d3.select("#waveScene");
const width = window.innerWidth;
const waveImgUrl = "https://cdn.pixabay.com/photo/2022/10/17/13/33/ocean-7527654_960_720.png";

const imgWidth = 300;
const imgHeight = 200;
const count = Math.ceil(width / imgWidth) + 3;
const startX = -imgWidth * 2;
const waveGroup = svgWave.append("g").attr("id", "waveGroup");

for (let i = 0; i < count; i++) {
  waveGroup.append("image")
    .attr("href", waveImgUrl)
    .attr("x", startX + i * imgWidth)
    .attr("y", 0)
    .attr("width", imgWidth)
    .attr("height", imgHeight);
}

let waveOffset = 0;
function animateWaves() {
  waveOffset += 2;
  if (waveOffset >= imgWidth) waveOffset = 0;
  waveGroup.attr("transform", `translate(${waveOffset}, 0)`);
  requestAnimationFrame(animateWaves);
}
animateWaves();
//------------Graph------------------//

// - header and text

// - bar chart race (carbon_cap)

// - bar chart race (gdp)

// - dropdown button for each year

//-------------animation (plane)-------------//
const svgWidth = window.innerWidth;
const cloudGroup = d3.select("#cloudGroup");
const planeGroup = d3.select("#planeGroup");
const plane = d3.select("#plane");

function drawCloud(x, y, scale) {
  const cloud = cloudGroup.append("g")
    .attr("transform", `translate(${x}, ${y}) scale(${scale})`);

  cloud.append("circle").attr("r", 20).attr("cx", 0).attr("cy", 0).attr("fill", "white");
  cloud.append("circle").attr("r", 25).attr("cx", 20).attr("cy", -10).attr("fill", "white");
  cloud.append("circle").attr("r", 20).attr("cx", 40).attr("cy", 0).attr("fill", "white");

  animateCloud(cloud, x, y, scale);
}

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
    .on("end", () => cloud.remove());
}

setInterval(() => {
  const y = 40 + Math.random() * 60;
  const scale = 0.6 + Math.random() * 0.6;
  drawCloud(0, y, scale);
}, 2000);

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

// Scroll-baseret visning
let isSkyVisible = false;

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const triggerHeight = window.innerHeight * 0.7;

  const waves = document.getElementById("waves");
  const sky = document.getElementById("sky");

  if (!isSkyVisible && scrollY > triggerHeight) {
    waves.classList.remove("visible");
    waves.classList.add("hidden");

    sky.classList.remove("hidden");
    sky.classList.add("visible");

    isSkyVisible = true;
  } else if (isSkyVisible && scrollY < triggerHeight - 100) {
    sky.classList.remove("visible");
    sky.classList.add("hidden");

    waves.classList.remove("hidden");
    waves.classList.add("visible");

    isSkyVisible = false;
  }
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

