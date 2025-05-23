
//----------------animation (waves)--------------//
//creating a bunch of "const" 
const svgWave = d3.select("#waveScene");
const width = window.innerWidth;
const waveImgUrl = "https://cdn.pixabay.com/photo/2022/10/17/13/33/ocean-7527654_960_720.png";
const imgWidth = 300;
const imgHeight = 200;
const count = Math.ceil(width / imgWidth) + 3;
const startX = -imgWidth * 2;
const waveGroup = svgWave.append("g").attr("id", "waveGroup");

// Loop to create and append multiple wave images side by side
for (let i = 0; i < count; i++) {
  waveGroup.append("image")
    .attr("href", waveImgUrl)
    .attr("x", startX + i * imgWidth) // Position each image horizontally, spaced by imgWidth
    .attr("y", 0) // Set vertical position to 0 (top)
    .attr("width", imgWidth)
    .attr("height", imgHeight);
}
// Initialize horizontal offset for wave animation
let waveOffset = 0;

// Function to animate the wave movement
function animateWaves() {
  waveOffset += 2; // Increment the horizontal offset to create movement
  if (waveOffset >= imgWidth) waveOffset = 0; // Reset the offset if it exceeds one image width (looping effect)
  waveGroup.attr("transform", `translate(${waveOffset}, 0)`); // Apply translation to move the wave group
  requestAnimationFrame(animateWaves); // Schedule the next frame for smooth animation
}
// Start the wave animation
animateWaves();

//-------------animation (plane)-------------//
// Select SVG groups by their IDs for cloud and plane elements and set the width of the SVG to the width of the browser window
const svgWidth = window.innerWidth;
const cloudGroup = d3.select("#cloudGroup");
const planeGroup = d3.select("#planeGroup");
const plane = d3.select("#plane");

// Function to draw a cloud at a specified (x, y) position and scale 
function drawCloud(x, y, scale) {
  const cloud = cloudGroup.append("g")
    .attr("transform", `translate(${x}, ${y}) scale(${scale})`);

// Draw individual circles to form a stylized cloud shape
  cloud.append("circle").attr("r", 20).attr("cx", 0).attr("cy", 0).attr("fill", "white");
  cloud.append("circle").attr("r", 25).attr("cx", 20).attr("cy", -10).attr("fill", "white");
  cloud.append("circle").attr("r", 20).attr("cx", 40).attr("cy", 0).attr("fill", "white");

 // Start animating the cloud's movement
  animateCloud(cloud, x, y, scale);
}
// Function to animate a cloud moving across the screen from left to right
function animateCloud(cloud, startX, y, scale) {
  cloud
    .transition()
    .duration(30000 + Math.random() * 10000)
    .ease(d3.easeLinear)
    .attrTween("transform", () => {
      return t => {
        // Calculate the current x position based on the animation progress (t ranges from 0 to 1)
        const x = startX + t * ((svgWidth + 100) - startX);
        // Return the updated transform string to move and scale the cloud
        return `translate(${x}, ${y}) scale(${scale})`;
      };
    })
    .on("end", () => cloud.remove()); // Remove the cloud element once the animation ends
}
// Repeatedly create and animate clouds every 2 seconds 
setInterval(() => {
  const y = 40 + Math.random() * 60;
  const scale = 0.6 + Math.random() * 0.6;
  drawCloud(0, y, scale); // Draw a new cloud starting from the left edge, with the randomized y position and scale
}, 2000);

// Function to animate the plane moving across the screen in a loop
function animatePlane() {
  plane
    .attr("x", -600)
    .transition()
    .duration(20000)
    .ease(d3.easeLinear)
    .attr("x", svgWidth + 200) // Move the plane to beyond the right edge of the screen
    .on("end", animatePlane);
}
// Start the plane animation
animatePlane();

//-------------Scroll based showing of content-------------//
// Track whether the sky section is currently visible
let isSkyVisible = false;
// Add a scroll event listener to the window
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY; // Get the current vertical scroll position
  const triggerHeight = window.innerHeight * 0.7; // Set a threshold at 70% of the viewport height

  const waves = document.getElementById("waves");
  const sky = document.getElementById("sky");

    // If sky is not yet visible and user has scrolled past the trigger point
  if (!isSkyVisible && scrollY > triggerHeight) {
    waves.classList.remove("visible");
    waves.classList.add("hidden");

    sky.classList.remove("hidden");
    sky.classList.add("visible");

    isSkyVisible = true;
    // If sky is currently visible and user scrolls back above the threshold
  } else if (isSkyVisible && scrollY < triggerHeight - 100) {
    sky.classList.remove("visible");
    sky.classList.add("hidden");

    waves.classList.remove("hidden");
    waves.classList.add("visible");

    isSkyVisible = false;
  }
});