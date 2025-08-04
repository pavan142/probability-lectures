import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface RunsDistributionChartProps {
  data: number[];
  width?: number;
  height?: number;
}

export const RunsDistributionChart: React.FC<RunsDistributionChartProps> = ({
  data,
  width = 800,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const runs = data.filter((runs) => runs > 0);

    if (runs.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Kernel density estimation
    const kde = kernelDensityEstimator(
      kernelEpanechnikov(7),
      d3.extent(runs) as [number, number]
    );
    const densityData = kde(runs);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(densityData, (d) => d[0]) as [number, number])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(densityData, (d) => d[1]) as number])
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

    // Create smooth line
    const line = d3
      .line<[number, number]>()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    // Add area fill
    const area = d3
      .area<[number, number]>()
      .x((d) => xScale(d[0]))
      .y0(chartHeight)
      .y1((d) => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    // Add filled area
    g.append("path")
      .datum(densityData)
      .attr("class", "area")
      .attr("d", area)
      .attr("fill", "#0ea5e9")
      .attr("opacity", 0.3);

    // Add smooth line
    g.append("path")
      .datum(densityData)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#0ea5e9")
      .attr("stroke-width", 2);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("class", "axis-label")
      .attr("x", chartWidth / 2)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .text("Runs");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -chartHeight / 2)
      .attr("text-anchor", "middle")
      .text("Probability Density");

    // Add statistics
    const mean = d3.mean(runs) as number;
    const median = d3.median(runs) as number;
    const stdDev = d3.deviation(runs) as number;

    g.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("class", "text-sm fill-gray-600")
      .text(
        `Mean: ${mean.toFixed(1)} | Median: ${median.toFixed(
          1
        )} | Std Dev: ${stdDev.toFixed(1)}`
      );

    // Add mean line
    g.append("line")
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.7);

    g.append("text")
      .attr("x", xScale(mean) + 5)
      .attr("y", 15)
      .attr("class", "text-xs fill-red-500")
      .text("Mean");
  }, [data, width, height]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

// Kernel density estimation functions
function kernelDensityEstimator(
  kernel: (x: number) => number,
  domain: [number, number]
) {
  return function (sample: number[]) {
    const step = (domain[1] - domain[0]) / 100; // Create 100 points
    const points: [number, number][] = [];

    for (let x = domain[0]; x <= domain[1]; x += step) {
      const density = d3.mean(sample, (v) => kernel(x - v)) || 0;
      points.push([x, density]);
    }

    return points;
  };
}

function kernelEpanechnikov(K: number) {
  return function (V: number) {
    const normalized = V / K;
    return Math.abs(normalized) <= 1
      ? (0.75 * (1 - normalized * normalized)) / K
      : 0;
  };
}
