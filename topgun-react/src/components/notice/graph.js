import React, { useEffect } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import { Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';

// Chart.js의 모든 등록 가능한 요소를 등록
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
      max: am4core.color("#ec7393") // 핑크톤 강조
    });

    // Add travel data to countries
    polygonSeries.data = [
      { id: "US", value: 1000 }, 
      { id: "CN", value: 850 }, 
      { id: "RU", value: 700 },
      { id: "IN", value: 600 },
      { id: "BR", value: 400 },
      // ... 더미 데이터 추가
    ];

    polygonSeries.mapPolygons.template.tooltipText = "{name}: {value} trips";
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
      backgroundColor: "rgba(236, 115, 147, 0.7)", // 핑크톤 강조 색상
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
          display: false, // X축 구분선 제거
        }
      },
      y: {
        grid: {
          display: false, // Y축 구분선 제거
        }
      }
    },
    plugins: {
      legend: {
        display: false // 범례 제거 (필요 시 true로 변경 가능)
      }
    },
    elements: {
      line: {
        tension: 0.4 // 부드러운 곡선으로 그래프 표현
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
    height: "650px", // 지도를 조금 더 크게 조정
  },
  graphContainer: {
    display: "flex",
    flexDirection: "column",
    width: "30%",
    gap: "20px",
  },
  graph: {
    border: "none", // 테두리 제거
    borderRadius: "10px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    height: "300px", // 그래프 크기 조정
  }
};

export default WorldMapWithGraphs;
