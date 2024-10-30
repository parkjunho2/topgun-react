import React, { useEffect, useState } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";

// 모든 Chart.js 구성 요소 등록
Chart.register(...registerables);

function WorldMapWithGraphs(props) {
  const [seatData, setSeatData] = useState([]);
  const [airlineRevenueData, setAirlineRevenueData] = useState({ labels: [], datasets: [] });
  const [aircraftRevenueData, setAircraftRevenueData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    // 좌석 데이터 가져오기
    const fetchSeatData = async () => {
      try {
        const response = await fetch('http://localhost:8080/seats/flightInfoList');
        const data = await response.json();
        setSeatData(data);

        // 항공사별 수익률 데이터 처리
        const airlineMap = new Map();
        data.forEach(seat => {
          const airline = seat.airlineName;
          const revenue = seat.seatsPrice || 0;

          if (!airlineMap.has(airline)) {
            airlineMap.set(airline, { totalRevenue: 0, totalSeats: 0 });
          }

          const airlineData = airlineMap.get(airline);
          airlineData.totalRevenue += revenue;
          airlineData.totalSeats += seat.totalSeats; // 총 좌석 수를 가져옵니다
        });

        const airlineLabels = Array.from(airlineMap.keys());
        const airlineRevenue = Array.from(airlineMap.values()).map(item => item.totalRevenue / (item.totalSeats || 1)); // 수익률 계산

        setAirlineRevenueData({
          labels: airlineLabels,
          datasets: [{
            label: "항공사별 수익률",
            data: airlineRevenue,
            backgroundColor: "rgba(236, 115, 147, 0.8)", // 핑크톤 강조 색상
            borderColor: "rgba(236, 115, 147, 1)",
            borderWidth: 2,
          }]
        });

        // 항공기별 수익률 데이터 처리
        const aircraftMap = new Map();
        data.forEach(seat => {
          const flightId = seat.flightId; // flightId로 구분
          const revenue = seat.seatsPrice || 0;

          if (!aircraftMap.has(flightId)) {
            aircraftMap.set(flightId, 0);
          }

          aircraftMap.set(flightId, aircraftMap.get(flightId) + revenue);
        });

        // 항공기별 매출 데이터 설정
        const aircraftLabels = Array.from(aircraftMap.keys());
        const aircraftRevenues = Array.from(aircraftMap.values());

        setAircraftRevenueData({
          labels: aircraftLabels,
          datasets: [{
            label: "항공기별 매출",
            data: aircraftRevenues,
            backgroundColor: "rgba(75, 192, 192, 0.8)", // 다른 색상 사용
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
          }]
        });

      } catch (error) {
        console.error('좌석 데이터 가져오기 오류:', error);
      }
    };

    fetchSeatData();
  }, []);

  useEffect(() => {
    // 맵 인스턴스 생성
    let map = am4core.create("chartdiv", am4maps.MapChart);

    // 맵 데이터 설정
    map.geodata = am4geodata_worldLow;

    // 프로젝션 설정
    map.projection = new am4maps.projections.Miller();

    // 폴리곤 시리즈 추가
    let polygonSeries = new am4maps.MapPolygonSeries();
    polygonSeries.useGeodata = true;
    map.series.push(polygonSeries);

    // 샘플 데이터 추가 (국가별 여행 횟수, GDP, 인구 등)
    const sampleData = [
      { id: "US", value: 50, gdp: 20000, population: 331000000 },
      { id: "CN", value: 70, gdp: 14000, population: 1439323776 },
      { id: "JP", value: 30, gdp: 5000, population: 126476461 },
      { id: "DE", value: 20, gdp: 4000, population: 83783942 },
      { id: "GB", value: 25, gdp: 2800, population: 67886011 },
      { id: "FR", value: 15, gdp: 2900, population: 65273511 },
      { id: "IN", value: 90, gdp: 2500, population: 1380004385 },
      { id: "BR", value: 40, gdp: 2100, population: 212559417 },
      { id: "AU", value: 10, gdp: 1400, population: 25499884 },
      { id: "ZA", value: 35, gdp: 350, population: 59308690 },
    ];

    // 맵에 데이터 추가
    polygonSeries.data = sampleData.map(country => ({
      id: country.id,
      value: country.value,
      gdp: country.gdp,
      population: country.population,
    }));

    // 데이터 표현을 위한 색상 사용
    polygonSeries.heatRules.push({
      property: "fill",
      target: polygonSeries.mapPolygons.template,
      min: am4core.color("#ffccd5"),
      max: am4core.color("#ec7393") // 핑크톤 강조
    });

    // 툴팁 구성
    polygonSeries.mapPolygons.template.tooltipText = 
      "{name}:\n" +
      "여행 횟수: {value} 회\n" +
      "GDP: {gdp} 억 달러\n" +
      "인구: {population}명";

    // Hover 애니메이션 추가
    polygonSeries.mapPolygons.template.events.on("over", function (event) {
      event.target.animate(
        { property: "fill", to: am4core.color("#ff4081") }, // 호버 시 색상 변경
        400,
        am4core.ease.circleInOut
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

  // 그래프 옵션 설정
  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: '항공사', // X축 제목 추가
        ticks: {
          autoSkip: true,
          maxTicksLimit: 24, // 최대 틱 수 제한
        },
        grid: {
          display: true, // X축 격자선 표시
        },
      },
      y: {
        title: '수익', // Y축 제목 추가
        grid: {
          display: true, // Y축 격자선 표시
        },
      },
    },
    plugins: {
      legend: {
        display: true, // 범례 표시
      },
      tooltip: {
        mode: 'index', // 툴팁을 인덱스 모드로 설정
        intersect: false, // 교차하지 않도록 설정
      },
    },
  };

  return (
    <div style={styles.container}>
      <div id="chartdiv" style={styles.map} />
      <div style={styles.graphContainer}>
        <div style={styles.graph}>
          <h3 style={styles.graphTitle}>항공사별 수익률</h3>
          <Bar data={airlineRevenueData} options={graphOptions} />
        </div>
        <div style={styles.graph}>
          <h3 style={styles.graphTitle}>항공기별 매출</h3>
          <Bar data={aircraftRevenueData} options={graphOptions} />
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
    width: "70%",
    height: "650px", // 맵 크기 조정
  },
  graphContainer: {
    display: "flex",
    flexDirection: "column",
    width: "30%",
    gap: "20px",
  },
  graph: {
    borderRadius: "10px",
    padding: "30px",
    height: "300px", // 그래프 크기 조정
    //background: "rgba(255, 255, 255, 0.9)", // 그래프 배경 색상
    //boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  graphTitle: {
    margin: "0 0 10px 0",
  },
};

export default WorldMapWithGraphs;
