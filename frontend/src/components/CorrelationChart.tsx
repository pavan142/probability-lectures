import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { InningsStats } from "../types/api";

interface CorrelationChartProps {
  data: InningsStats[];
  width?: number;
  height?: number;
}

export const CorrelationChart: React.FC<CorrelationChartProps> = ({
  data,
  width = 800,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const updateChart = () => {
    if (!data.length || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Filter out invalid data points
    const validData = data.filter(
      (d) => d.runs > 0 && d.runs_per_over > 0 && !isNaN(d.runs_per_over)
    );

    if (validData.length === 0) return;

    // Much larger margins to prevent cutoff
    const margin = { top: 50, right: 50, bottom: 80, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(validData, (d) => d.runs) || 500])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(validData, (d) => d.runs_per_over) || 10])
      .range([chartHeight, 0]);

    // Add grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-chartHeight)
          .tickFormat(() => "")
      );

    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-chartWidth)
          .tickFormat(() => "")
      );

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickSize(6).tickPadding(8))
      .selectAll("text")
      .style("font-size", "12px");

    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(6).tickPadding(8))
      .selectAll("text")
      .style("font-size", "12px");

    // Add axis labels
    g.append("text")
      .attr("class", "axis-label")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 40)
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Runs in Innings");

    g.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -65)
      .attr("x", -chartHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Runs per Over");

    // Add scatter plot points
    g.selectAll("circle")
      .data(validData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.runs))
      .attr("cy", (d) => yScale(d.runs_per_over))
      .attr("r", 4)
      .attr("fill", "#0ea5e9")
      .attr("opacity", 0.7)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 6).attr("opacity", 1);
        
        // Add tooltip
        const tooltip = g
          .append("text")
          .attr("class", "tooltip")
          .attr("x", xScale(d.runs) + 10)
          .attr("y", yScale(d.runs_per_over) - 10)
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .style("fill", "#374151")
          .text(`Runs: ${d.runs}, RPO: ${d.runs_per_over.toFixed(2)}`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 4).attr("opacity", 0.7);
        g.selectAll(".tooltip").remove();
      });

    // Calculate correlation coefficient
    const correlation = calculateCorrelation(validData);

    // Add correlation info
    g.append("text")
      .attr("x", 10)
      .attr("y", -20)
      .style("font-size", "16px")
      .style("font-weight", "500")
      .style("fill", "#374151")
      .text(`Correlation: ${correlation.toFixed(3)}`);

    // Add trend line if correlation is significant
    if (Math.abs(correlation) > 0.1) {
      const trendLine = calculateTrendLine(validData, xScale, yScale);
      
      g.append("line")
        .attr("x1", trendLine.x1)
        .attr("x2", trendLine.x2)
        .attr("y1", trendLine.y1)
        .attr("y2", trendLine.y2)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.7);

      g.append("text")
        .attr("x", trendLine.x2 + 5)
        .attr("y", trendLine.y2)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#ef4444")
        .text("Trend Line");
    }
  };

  useEffect(() => {
    updateChart();
  }, [data, width, height]);

  return (
    <div className="chart-container h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
    </div>
  );
};

// Helper function to calculate correlation coefficient
function calculateCorrelation(data: InningsStats[]): number {
  const n = data.length;
  const sumX = d3.sum(data, (d) => d.runs);
  const sumY = d3.sum(data, (d) => d.runs_per_over);
  const sumXY = d3.sum(data, (d) => d.runs * d.runs_per_over);
  const sumX2 = d3.sum(data, (d) => d.runs * d.runs);
  const sumY2 = d3.sum(data, (d) => d.runs_per_over * d.runs_per_over);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

// Helper function to calculate trend line
function calculateTrendLine(
  data: InningsStats[],
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
): { x1: number; y1: number; x2: number; y2: number } {
  const n = data.length;
  const sumX = d3.sum(data, (d) => d.runs);
  const sumY = d3.sum(data, (d) => d.runs_per_over);
  const sumXY = d3.sum(data, (d) => d.runs * d.runs_per_over);
  const sumX2 = d3.sum(data, (d) => d.runs * d.runs);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const xMin = d3.min(data, (d) => d.runs) || 0;
  const xMax = d3.max(data, (d) => d.runs) || 500;

  const y1 = slope * xMin + intercept;
  const y2 = slope * xMax + intercept;

  return {
    x1: xScale(xMin),
    y1: yScale(y1),
    x2: xScale(xMax),
    y2: yScale(y2),
  };
} 