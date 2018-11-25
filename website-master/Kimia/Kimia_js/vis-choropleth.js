// sources:
//https://hackernoon.com/how-to-convert-and-prepare-topojson-files-for-interactive-mapping-with-d3-499cf0ced5f
//https://github.com/topojson/topojson/wiki/Gallery
//https://github.com/topojson/topojson/wiki/Introduction
//https://github.com/topojson/topojson/wiki
// http://stackoverflow.com/questions/21838013/d3-choropleth-map-with-legend
//https://bl.ocks.org/almccon/410b4eb5cad61402c354afba67a878b8

//https://bl.ocks.org/mbostock/4090848
//http://bost.ocks.org/mike/map/
// https://github.com/d3/d3-geo/blob/master/README.mdd
// https://github.com/mbostock/topojson
// http://bl.ocks.org/mapsam/6090056
// https://www.jasondavies.com/maps/rotate/
// http://axismaps.github.io/thematic-cartography/articles/choropleth.htmlCS171-Lab6-Instructions
//https://www.mapbox.com/mapbox-gl-js/example/geojson-markers/
// https://macwright.org/2015/03/23/geojson-second-bite.html,
// https://www.packtpub.com/mapt/book/web_development/9781785280085/12/ch12lvl1sec56/introducing-topojson-and-geojson

/// there is a very similar example online:
// // https://gist.github.com/tonmcg/bb353738d84198b2865760a3f667590d

var margin = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 60
};

var width = 800 - margin.left - margin.right, height = 600 - margin.top - margin.bottom;

var svg = d3.select("#choropleth-vizzy")
    .append("svg")
    .attr("width", width)
    .attr("height", height);


var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// from example
var projection = d3.geo.mercator()
    .rotate([-10, 0])
    .center([35, 3])
    .scale(330);

//make a path
var path = d3.geo.path()
    .projection(projection);


//  building with
var country_data, ID_data = {};

// public variables and options for the map
var colorscale = d3.scale.quantize();





// Use the Queue.js library to read two files
queue()
    .defer(d3.json, "data/africa.topo.json")
    .defer(d3.csv, "data/global-water-sanitation-2015.csv")
    .await(function(error, mapTopJson, rawcountry_data) {


        // make sure variables are ok
        rawcountry_data.forEach(function(d) {
            WHO_region = d.WHO_region;
            Code = d.Code;
            Country = d.Country;
            Improved_Sanitation_2015 = parseInt(parseFloat(d.Improved_Sanitation_2015)/100);
            Improved_Water_2015 = parseInt((parseFloat(d.Improved_Water_2015))/100);
            UN_Population = parseInt(d.UN_Population);
        });
        // only Africa but why no north africa
        country_data = rawcountry_data.filter(function (d) {
            return d.WHO_region === "African";  /// why isnt N africa coming up?
            //|| Why is north africa missing??? Is it w middle east?
            //|| d.WHO_region === "Eastern Mediterranean";

        });


        // map this to a new data structure where the objects are indexed
        // by country code
        country_data.forEach(function(d) {
            ID_data[d.Code] = d;
        });

        // Convert TopoJSON to GeoJSON
        var geoJSON_africa = topojson.feature(mapTopJson, mapTopJson.objects.collection)
            .features;

        // draw shapes on map
        svg.selectAll("path")
            .data(geoJSON_africa)
            .enter()
            .append("path")
            .attr("class", "map")
            .attr("d", path);

        // Update choropleth
        updateChoropleth();
    });



var colourBrewer = function (d) {
        return cbMap[numC][d];
    }


for (var i = 0; i < cfuncs.length; i++) {
        addScale(30 + i * (rectHeight + 30), cfuncs[i][1], cfuncs[i][0]);
    }

mapNames = ['Blues', 'Greens', 'Oranges', 'Purples', 'Reds'];
mapNames.forEach(function (mapName) {showColourInterpolations(mapName, colorbrewer[mapName]); });

///d3.scale.linear()



function updateChoropleth() {
    // grab data_ from page
    var data_ = d3.select("#selector")
        .node()
        .value;

    // grab data points for data_ so we can calculate domain
    var data_Values = country_data.map(function(d) {
        return d[data_];
    });


    colorscale
        .domain(d3.extent(data_Values))
        .range([


            '#c6dbef',
            '#6baed6',
            '#2171b5',
            '#08306b',

            ]);   // I used seq but skipped every other color to ensure the diff is large enough
    // so it helps double the use
    //http://colorbrewer2.org/#type=sequential&scheme=YlGnBu&n=9

    ////


    svg.selectAll(".map")
        .attr("fill", function(d) {
            return retrievevalue(d, data_);
        })




    var legend = svg.selectAll('g.legry')
        .data(colorscale.range(), function(d) {
            // key it to itself
            return d;
        });


    var legend_ = legend.enter()
        .append('g')
        .attr('class', 'legry');

    // draw colored boxes
    legend_
        .append('rect')
        .attr("x", width - 580)
        .attr("y", function(d, i) {
            return i * 20 +300;
        })
        .attr("width", 20)
        .attr("height", 20)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", function(d){
            return d;
        });

    // draw legend label text
    legend_
        .append('text')
        .attr("x", width-550 )
        .attr("y", function(d, i) {
            return i * 20 +315;
        })
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", function(d){return d;});



    legend.selectAll('text')
        .text(function(d, i) {
            var extent = colorscale.invertExtent(d);
            format = d3.format(".1s");
            boundary = format(+extent[0]);
            boundary2 = format(+extent[1]);
            var total = boundary+grouptext(data_)+ " to " + boundary2 + grouptext(data_);

            return total
        });
    legend.exit().remove();

}

function grouptext(data_) {
    if (data_ === "Improved_Sanitation_2015" || data_ === "Improved_Water_2015") {
        return "%"
    } else {
        return "";
    };
}

function retrievevalue(d, data_) {
    var countryData = getit(d);
    var data_Value = countryData[data_];
    return colorscale(data_Value);
}

function getit(d) {
    return ID_data[d.properties.adm0_a3_is] || 0;
}
