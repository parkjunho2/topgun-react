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

    // 국가에 대한 여행 데이터 추가 (추가 정보 포함)
    polygonSeries.data = [
      { id: "US", value: 1000, revenue: 100000, description: "최고의 여행지." },
      { id: "CN", value: 850, revenue: 85000, description: "급성장하는 관광지." },
      { id: "RU", value: 700, revenue: 70000, description: "다양한 문화 경험." },
      { id: "IN", value: 600, revenue: 60000, description: "풍부한 역사적 유적지." },
      { id: "BR", value: 400, revenue: 40000, description: "카니발로 유명." },
      // ... 더미 데이터 추가
    ];

    // Tooltip 설정
    polygonSeries.mapPolygons.template.tooltipText = "{name}: {value} trips\nRevenue: ${revenue}\n{description}";
    polygonSeries.mapPolygons.template.fill = am4core.color("#74B266");

    // Hover 애니메이션 추가
    polygonSeries.mapPolygons.template.events.on("over", function (event) {
      event.target.animate(
        { property: "fill", to: am4core.color("#ff4081") }, // 호버 시 색상 변경
        400, // 애니메이션 시간
        am4core.ease.circleInOut // 애니메이션 효과
      );
    });

    polygonSeries.mapPolygons.template.events.on("out", function (event) {
      event.target.animate(
        { property: "fill", to: event.target.dataItem.dataContext.color || am4core.color("#74B266") }, // 원래 색상으로 복원
        400,
        am4core.ease.circleInOut
      );
    });

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
      backgroundColor: "rgba(236, 115, 147, 0.8)", // 핑크톤 강조 색상
      borderColor: "rgba(236, 115, 147, 1)",
      borderWidth: 2,
      borderRadius: 8, // 둥근 모서리
      hoverBackgroundColor: "rgba(236, 115, 147, 1)", // 호버 시 색상 변경
    }]
  };

  const revenueData = {
    labels: ["US", "China", "Russia", "India", "Brazil"],
    datasets: [{
      label: "Revenue ($)",
      data: [100000, 85000, 70000, 60000, 40000],
      backgroundColor: "rgba(75, 192, 192, 0.8)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 2,
      borderRadius: 8, // 둥근 모서리
      hoverBackgroundColor: "rgba(75, 192, 192, 1)", // 호버 시 색상 변경
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
        display: true, // 범례 표시
        position: 'top', // 범례 위치
        labels: {
          fontColor: '#333', // 범례 텍스트 색상
          fontSize: 14, // 범례 텍스트 크기
        }
      }
    },
    elements: {
      line: {
        tension: 0.4, // 부드러운 곡선으로 그래프 표현
        borderWidth: 3, // 라인 두께
      }
    }
  };

  return (
    <div style={styles.container}>
      <div id="chartdiv" style={styles.map} />

      <div style={styles.graphContainer}>
        <div style={styles.graph}>
          <h3 style={styles.graphTitle}>Travel Count by Country</h3>
          <Bar data={travelData} options={graphOptions} />
        </div>
        <div style={styles.graph}>
          <h3 style={styles.graphTitle}>Revenue by Country</h3>
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
    borderRadius: "10px",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    height: "300px", // 그래프 크기 조정
    boxShadow: "0 4px 8px rgba(0, 0, 1, 0)", // 그림자 추가
  },
  graphTitle: {
    marginBottom: "10px",
    fontSize: "18px",
    color: "#333",
  }
};

export default WorldMapWithGraphs;
