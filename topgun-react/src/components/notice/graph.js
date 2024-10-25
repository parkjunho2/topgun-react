import React, { useEffect } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import { Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

function WorldMapWithGraphs(props) {
  useEffect(() => {
    // Create map instance
    let map = am4core.create("chartdiv", am4maps.MapChart);

    // Set map data
    map.geodata = am4geodata_worldLow;

    // Set projection
    map.projection = new am4maps.projections.Miller();

    // Add polygon series
    let polygonSeries = new am4maps.MapPolygonSeries();
    polygonSeries.useGeodata = true;
    map.series.push(polygonSeries);

    // Use color to represent data
    polygonSeries.heatRules.push({
      property: "fill",
      target: polygonSeries.mapPolygons.template,
      min: am4core.color("#ffccd5"),
      max: am4core.color("#ec7393") // Pink tone emphasis
    });

    // Add detailed data for each country
    polygonSeries.data = [
      { id: "US", value: 1000, gdp: "$21 trillion", population: "331 million" }, 
      { id: "CN", value: 850, gdp: "$14 trillion", population: "1.4 billion" }, 
      { id: "RU", value: 700, gdp: "$1.7 trillion", population: "146 million" },
      { id: "IN", value: 600, gdp: "$2.7 trillion", population: "1.3 billion" },
      { id: "BR", value: 400, gdp: "$2 trillion", population: "213 million" },
      // ... Add more data as needed
    ];

    // Configure tooltip to show additional data
    polygonSeries.mapPolygons.template.tooltipText = 
      "{name}:\n" +
      "Travel Count: {value} trips\n" +
      "GDP: {gdp}\n" +
      "Population: {population}";

    polygonSeries.mapPolygons.template.fill = am4core.color("#74B266");

    return () => {
      map.dispose();
    };
  }, []);

  // Graph data and options
  const travelData = {
    labels: ["US", "China", "Russia", "India", "Brazil"],
    datasets: [{
      label: "Travel Count",
      data: [1000, 850, 700, 600, 400],
      backgroundColor: "rgba(236, 115, 147, 0.7)", // Pink tone color
      borderColor: "rgba(236, 115, 147, 1)",
      borderWidth: 2,
    }]
  };

  const revenueData = {
    labels: ["US", "China", "Russia", "India", "Brazil"],
    datasets: [{
      label: "Revenue ($)",
      data: [100000, 85000, 70000, 60000, 40000],
      backgroundColor: "rgba(75, 192, 192, 0.7)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 2,
    }]
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false, // Remove X-axis gridlines
        }
      },
      y: {
        grid: {
          display: false, // Remove Y-axis gridlines
        }
      }
    },
    plugins: {
      legend: {
        display: false // Hide legend (set to true if needed)
      }
    },
    elements: {
      line: {
        tension: 0.4 // Smooth curve
      }
    }
  };

  return (
    <div style={styles.container}>
      <div id="chartdiv" style={styles.map} />

      <div style={styles.graphContainer}>
        <div style={styles.graph}>
          <h3>Travel Count by Country</h3>
          <Bar data={travelData} options={graphOptions} />
        </div>
        <div style={styles.graph}>
          <h3>Revenue by Country</h3>
          <Line data={revenueData} options={graphOptions} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "20px",
    width: "95%",
    margin: "40px auto",
  },
  map: {
    width: "65%",
    height: "650px", // Adjust map size
  },
  graphContainer: {
    display: "flex",
    flexDirection: "column",
    width: "30%",
    gap: "20px",
  },
  graph: {
    border: "none", // Remove border
    borderRadius: "10px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    height: "300px", // Adjust graph size
  }
};

export default WorldMapWithGraphs;
