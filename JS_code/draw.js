const { createCanvas } = require("canvas");
const fs = require("fs");
const chroma = require("chroma-js");
// Include the topojson-client library
var topojson = require('topojson-client');

var rawbase = 'https://raw.githubusercontent.com/';
var jsonloc = 'uoa-eresearch/cancermap/master/data/IMD18.topojson';
//https://uoa-eresearch.github.io/cancermap/data/IMD18.topojson

// Use fetch API to load the TopoJSON file
fetch(rawbase + jsonloc)
    .then(response => response.json())
    .then(topology => {
        // Convert TopoJSON to GeoJSON
        var geojson = topojson.feature(topology, topology.objects.IMD18);

        // Access the features
        var features = geojson.features;

        // Dimensions for the image
        const width = 500;
        const height = 500;

        // Loop through each feature
        features.forEach(function (feature) {
            // Access properties of each feature
            //console.log(feature.properties.DZID);

            // Instantiate the canvas object
            const canvas = createCanvas(width, height);
            const context = canvas.getContext("2d");

            // flower
            // colour scheme for petals
            // same range for all, ranking ranging from 1 to 6181
            // Define your color palette
            var colorScale = chroma.scale('BuPu');

            // Function to map a value to a color
            function valueToColor(value) {
                // Normalize the value to a number between 0 and 1
                var normalizedValue = (value - 1) / (6181 - 1);

                // Get the color for this value from the color scale
                var color = colorScale(normalizedValue).hex();

                return color;
            }

            // Function to map a value to a size
            function valueToSize(value) {
                // Normalize the value to a number between 0 and 1
                var normalizedValue = 1 - ((value - 1) / (6181 - 1));

                // Map the normalized value to a size
                var size = normalizedValue * (90 - 30) + 30;

                return size;
            }

            // code for the flowers
            function drawPetal(context, x, y, width, height, color) {
                context.beginPath();
                context.moveTo(x, y);  // Start at the bottom of the petal
                context.quadraticCurveTo(x + width / 2, y + height / 2, x, y + height);  // Quadratic curve to the top of the petal
                context.quadraticCurveTo(x - width / 2, y + height / 2, x, y);  // Quadratic curve to the bottom right of the petal
                context.closePath();  // Close the path
                context.fillStyle = color;
                context.fill();
                context.lineWidth = 1; // Set the border thickness
                context.strokeStyle = 'lightgrey'; //Set the border color
                context.stroke();
            }

            function drawFlower(context, x, y, petals) {
                for (let i = 0; i < petals.length; i++) {
                    // Angle of each petal
                    let angle = (Math.PI * 2 / petals.length) * i;
                    // Save the current context state
                    context.save();
                    // Move the context origin to the flower's center
                    context.translate(x, y);
                    // Rotate the context so the petal is oriented correctly
                    context.rotate(angle);
                    // Draw the petal with the corresponding color and dimensions
                    let petal = petals[i];
                    drawPetal(context, 0, 0, petal.width, petal.height, petal.color);
                    // Restore the context state
                    context.restore();
                }
            }

            // circle
            // Function to draw a circle
            function drawCircle(context, x, y, radius, color) {
                context.beginPath();
                context.arc(x, y, radius, 0, 2 * Math.PI, false);
                context.closePath(); // Close the path
                context.fillStyle = color;
                context.fill();
            }

            // Function to map a value to a radius
            function valueToRadius(value) {
                // Normalize the value to a number between 0 and 1
                var normalizedValue = 1 - ((value - 1) / (6181 - 1));

                // Map the normalized value to a radius
                var radius = normalizedValue * (100 - 30) + 30;

                return radius;
            }

            // Access the columns
            var value_DZID = feature.properties.DZ2018;
            var value_overall = feature.properties.IMD18;
            var value_access = feature.properties.Access;
            var value_crime = feature.properties.Crime;
            var value_education = feature.properties.Education;
            var value_employment = feature.properties.Employment;
            var value_health = feature.properties.Health;
            var value_housing = feature.properties.Housing;
            var value_income = feature.properties.Income;

            drawCircle(context, 250, 250, valueToRadius(value_overall), valueToColor(value_overall));  // Draw the circle, overall

            var petals = [
                { width: valueToSize(value_employment), height: valueToSize(value_employment) * 2, color: valueToColor(value_employment) }, // Employment
                { width: valueToSize(value_income), height: valueToSize(value_income) * 2, color: valueToColor(value_income) }, // Income
                { width: valueToSize(value_crime), height: valueToSize(value_crime) * 2, color: valueToColor(value_crime) }, // Crime
                { width: valueToSize(value_housing), height: valueToSize(value_housing) * 2, color: valueToColor(value_housing) }, // Housing
                { width: valueToSize(value_health), height: valueToSize(value_health) * 2, color: valueToColor(value_health) }, // Health
                { width: valueToSize(value_education), height: valueToSize(value_education) * 2, color: valueToColor(value_education) }, // Education
                { width: valueToSize(value_access), height: valueToSize(value_access) * 2, color: valueToColor(value_access) } // Access
            ];
            drawFlower(context, 250, 250, petals);  // Draw a flower with 7 oblong-shaped petals

            // Write the image to file
            const buffer = canvas.toBuffer("image/png");
            fs.writeFileSync("./flowers/" + value_DZID + ".png", buffer);

        });
    });
