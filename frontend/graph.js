//width, height, and padding for the graph. Padding ensures the axis does not overlap
const w = 500;
const h = 250;
const padding =10;

//the dataset is set up with value, continent, country
const dataset_carbon_cap = [
      [0.987654, 27, "2023-10-30 08:22:14"],
  [0.456789, 15, "2023-10-30 09:45:22"],
  [0.654321, 31, "2023-10-30 10:11:05"],
  [0.888888, 63, "2023-10-30 12:05:10"],
  [0.754123, 42, "2023-10-30 14:30:00"],
  [0.182739, 87, "2023-10-30 15:15:30"],
  [0.111111, 66, "2023-10-30 16:59:03"],
  [0.56789, 74, "2023-10-30 18:10:45"],
  [0.123456, 99, "2023-10-30 20:40:55"],
  [0.333333, 53, "2023-10-30 22:55:30"],
];
const dataset_gdp = [];


//adding svg elements to the body
const svg = d3.select("body").append("svg").attr("width", w).attr("height", h);

let yscale = null;
let xscale = null;

let xaxis = null;
let yaxis = null;

//shows the graph when the webserver loads
Infinity(dataset_carbon_cap, false);

//sorting buttons
d3.selectAll("#sortByValue, #sortByContinent, #sortByCountry").on(
  "click",
  function (e) {
//tracks witch button is pressed
let id = e.target.id;
console.log(id);
let isCountry = false;
if (id === "sortByCountry") {
    isCountry = true;
}
//sorting the data, when done the soring is logged
sortData(id);
 console.log("Sorted data by " + id + " : ", dataset);

 //sorting animation
 animateData(dataset, isCountry);
  }
);

function Infinity(dataset_carbon_cap, isCountry) {
//setting the dinamic values and makeing the standard chart
setUp(dataset_carbon_cap, isCountry);
createDefaultChart(dataset_carbon_cap);
//adding axes
addAxes ();
}

function setUp (dataset_carbon_cap, isCountry) {
  yScale = createScaleY(dataset);
  xScale = createScaleX(dataset);
  
  xAxis = createAxisX(xScale, isFastest);
  yAxis = createAxisY(yScale);
}

function createDefaultChart (dataset_carbon_cap) {
//now the barchat is build, enery coloum gets a unique key
//this is done for d3 to reginize dem
svg
.selectAll ("rect")
.data(dataset_carbon_cap, function (d) {
    return d[2];
})
.enter()
.append("rect")
.attr("x", function (d, i) {
    return xscale (i) + padding;
})
.attr("y", function (d) {
      return yScale(d[1]);
    })
    .attr(
      "width",
      w / dataset.length - 2 * padding - (2 * axisPadding) / dataset.length
    )
    .attr("height", function (d) {
      console.log("height: " + (yScale(d[1]) - axisPadding));
      return h - padding - axisPadding - yScale(d[1]);
    })
    .attr("fill", function (d) {
      return "rgb(0, 0, " + (256 - d[1] * 2) + ")";
    });
}

function createScaleX(dataset) {
  return (
    d3
    .scaleBand()
      .range([padding + axisPadding, w - padding - axisPadding])
      .domain(
              dataset.map(function (d, i) {

          return i;
        })
      )
  );
}
function createScaleY(dataset) {
  return d3
    .scaleLinear()
    .domain([
      0,
      d3.max(dataset, function (d) {
        return d[1];
      }),
    ])
    .range([h - padding - axisPadding, padding + axisPadding])
    .nice();
}

function createAxisY(yScale) {
  return d3.axisLeft().scale(yScale).ticks(5);
}

function createAxisX(xScale, isFastest) {
  return (
    d3
      .axisBottom()
      .scale(xScale)
      //Her fortæller vi hvad der skal skrives på aksen, isFastest bestemmer om det skal være måletid eller måledato
      .tickFormat(function (d) {
        if (isFastest) {
          return dataset[d][0];
        } else {
          return dataset[d][2];
        }
      })
  );
}

function addAxes() {
  svg
    .append("g")
    .attr("transform", "translate(0," + (h - padding - axisPadding) + ")")
    .attr("id", "xAxis");

  svg
    .append("g")
    .attr("transform", "translate(" + (padding + axisPadding) + ",0)")
    .attr("id", "yAxis")
    .call(yAxis);

  //X-aksen formateres, så den viser sine labels korrekt
  formatAxisX();
}

function formatAxisX() {
  svg
    .select("#xAxis")
    .call(xAxis)
    //Her fjernes tickmarks fra x-aksen - det synes jeg ser pænere ud
    .call(xAxis.tickSize(0))
    .selectAll("text")
    .attr("transform", "translate(-10,5)rotate(-45)")
    .style("text-anchor", "end");
}

function animateData(data, isFastest) {
  setUp(data, isFastest);
  formatAxisX();
  // select alle 'rect'.
  svg
    .selectAll("rect")
    .data(data, function (d) {
      // Vælg key til hvert dataelement
      return d[2];
    })
    //start en animation
    .transition()
    //Lad den vare 2000 ms
    .duration(2000)
    /**
     * Dette skal være slutresultatet: flyt søjlerne til de nye positioner
     * 'width', 'height' og 'color' er de samme som før,
     * så dem behøver vi ikke at tage med i vores 'transition'
     * Men i praksis kan man sagtens animere flere ting på én gang, hvis man vil.
     * I dette tilfælde skal altså kun 'x' ændres.
     * */
    .attr("x", function (d, i) {
      return xScale(i) + padding;
    });

  //her opdateres så x-aksen
}

function sortData(by) {
  /**
   * I array-objektet i JS er der indbygget en metoder som hedder 'sort'.
   * Den tager en callback-funktion som parameter.
   * I denne callback-funktion skal der returneres et tal, som er enten positivt, negativt eller 0.
   * Hvis tallet er positivt, så bytter 'sort' metoden om på de to elementer i arrayet.
   * Hvis tallet er negativt eller 0, så lader 'sort' metoden dem være som de er.
   * På den måde bliver elementerne i arrayet sorteret.
   */
  if (by === "sortByValue") {
    dataset.sort(function (a, b) {
      return b[1] - a[1];
    });
  } else if (by === "sortByDate") {
    dataset.sort(function (a, b) {
      /**
       * I JS er der indbygget et objekt som hedder 'Date'.
       * Den kan bruges til at lave en dato ud fra en tekststreng.
       * Derfor giver vi det andet element i hvert indre array til 'Date' objektet.
       * JS kan sammenligne Date-objekter ved at trække dem fra hinanden.
       */
      return new Date(a[2]) - new Date(b[2]);
    });
  } else {
    dataset.sort(function (a, b) {
      return a[0] - b[0];
    });
  }
}