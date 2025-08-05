import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { InningsStats } from "../types/api";

interface CorrelationChartProps {
  data: InningsStats[];
  width?: number;
  height?: number;
}

// Define available axis options
const AXIS_OPTIONS = [
  { value: "runs", label: "Runs" },
  { value: "wickets", label: "Wickets" },
  { value: "overs", label: "Overs" },
  { value: "balls", label: "Balls" },
  { value: "centuries", label: "Centuries" },
  { value: "fifers", label: "Fifers" },
  { value: "highest_score", label: "Highest Score" },
  { value: "lowest_score", label: "Lowest Score" },
  { value: "max_wickets", label: "Max Wickets" },
  { value: "min_wickets", label: "Min Wickets" },
  { value: "total_extras", label: "Total Extras" },
  { value: "total_boundaries", label: "Total Boundaries" },
  { value: "runs_per_over", label: "Runs per Over" },
] as const;

type AxisOption = (typeof AXIS_OPTIONS)[number]["value"];

export const CorrelationChart: React.FC<CorrelationChartProps> = ({
  data,
  width = 800,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [xAxis, setXAxis] = useState<AxisOption>("runs");
  const [yAxis, setYAxis] = useState<AxisOption>("runs_per_over");

  const updateChart = () => {
    if (!data.length || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Filter out invalid data points
    const validData = data.filter((d) => {
      const xValue = d[xAxis as keyof InningsStats] as number;
      const yValue = d[yAxis as keyof InningsStats] as number;
      return xValue > 0 && yValue > 0 && !isNaN(xValue) && !isNaN(yValue);
    });

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
      .domain([
        0,
        d3.max(validData, (d) => d[xAxis as keyof InningsStats] as number) ||
          500,
      ])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(validData, (d) => d[yAxis as keyof InningsStats] as number) ||
          10,
      ])
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
      .text(AXIS_OPTIONS.find((opt) => opt.value === xAxis)?.label || xAxis);

    g.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -65)
      .attr("x", -chartHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(AXIS_OPTIONS.find((opt) => opt.value === yAxis)?.label || yAxis);

    // Add scatter plot points
    g.selectAll("circle")
      .data(validData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d[xAxis as keyof InningsStats] as number))
      .attr("cy", (d) => yScale(d[yAxis as keyof InningsStats] as number))
      .attr("r", 4)
      .attr("fill", "#0ea5e9")
      .attr("opacity", 0.7)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 6).attr("opacity", 1);

        // Add tooltip
        const tooltip = g
          .append("text")
          .attr("class", "tooltip")
          .attr("x", xScale(d[xAxis as keyof InningsStats] as number) + 10)
          .attr("y", yScale(d[yAxis as keyof InningsStats] as number) - 10)
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .style("fill", "#374151")
          .text(
            `${AXIS_OPTIONS.find((opt) => opt.value === xAxis)?.label}: ${
              d[xAxis as keyof InningsStats]
            }, ${AXIS_OPTIONS.find((opt) => opt.value === yAxis)?.label}: ${(
              d[yAxis as keyof InningsStats] as number
            ).toFixed(2)}`
          );
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 4).attr("opacity", 0.7);
        g.selectAll(".tooltip").remove();
      });

    // Calculate correlation coefficient
    const correlation = calculateCorrelation(validData, xAxis, yAxis);

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
      const trendLine = calculateTrendLine(
        validData,
        xAxis,
        yAxis,
        xScale,
        yScale
      );

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
  }, [data, width, height, xAxis, yAxis]);

  return (
    <div className="chart-container h-full flex flex-col">
      <div className="mb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                X-Axis:
              </label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value as AxisOption)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {AXIS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Y-Axis:
              </label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value as AxisOption)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {AXIS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
    </div>
  );
};

// Helper function to calculate correlation coefficient
function calculateCorrelation(
  data: InningsStats[],
  xAxis: AxisOption,
  yAxis: AxisOption
): number {
  const n = data.length;
  const sumX = d3.sum(data, (d) => d[xAxis as keyof InningsStats] as number);
  const sumY = d3.sum(data, (d) => d[yAxis as keyof InningsStats] as number);
  const sumXY = d3.sum(
    data,
    (d) =>
      (d[xAxis as keyof InningsStats] as number) *
      (d[yAxis as keyof InningsStats] as number)
  );
  const sumX2 = d3.sum(
    data,
    (d) =>
      (d[xAxis as keyof InningsStats] as number) *
      (d[xAxis as keyof InningsStats] as number)
  );
  const sumY2 = d3.sum(
    data,
    (d) =>
      (d[yAxis as keyof InningsStats] as number) *
      (d[yAxis as keyof InningsStats] as number)
  );

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  return denominator === 0 ? 0 : numerator / denominator;
}

// Helper function to calculate trend line
function calculateTrendLine(
  data: InningsStats[],
  xAxis: AxisOption,
  yAxis: AxisOption,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
): { x1: number; y1: number; x2: number; y2: number } {
  const n = data.length;
  const sumX = d3.sum(data, (d) => d[xAxis as keyof InningsStats] as number);
  const sumY = d3.sum(data, (d) => d[yAxis as keyof InningsStats] as number);
  const sumXY = d3.sum(
    data,
    (d) =>
      (d[xAxis as keyof InningsStats] as number) *
      (d[yAxis as keyof InningsStats] as number)
  );
  const sumX2 = d3.sum(
    data,
    (d) =>
      (d[xAxis as keyof InningsStats] as number) *
      (d[xAxis as keyof InningsStats] as number)
  );

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const xMin =
    d3.min(data, (d) => d[xAxis as keyof InningsStats] as number) || 0;
  const xMax =
    d3.max(data, (d) => d[xAxis as keyof InningsStats] as number) || 500;

  const y1 = slope * xMin + intercept;
  const y2 = slope * xMax + intercept;

  return {
    x1: xScale(xMin),
    y1: yScale(y1),
    x2: xScale(xMax),
    y2: yScale(y2),
  };
}
