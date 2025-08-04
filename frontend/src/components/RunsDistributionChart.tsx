import React, { useEffect, useRef, useState } from "react";
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
  const [bandwidth, setBandwidth] = useState(7);

  const updateChart = (newBandwidth: number) => {
    if (!data.length || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const runs = data.filter((runs) => runs > 0);

    if (runs.length === 0) return;

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

    // Kernel density estimation with dynamic bandwidth
    const kde = kernelDensityEstimator(
      kernelEpanechnikov(newBandwidth),
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
      .call(d3.axisBottom(xScale).tickSize(6).tickPadding(8))
      .selectAll("text")
      .style("font-size", "12px");

    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(6).tickPadding(8))
      .selectAll("text")
      .style("font-size", "12px");

    g.append("text")
      .attr("class", "axis-label")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 65)
      // .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Runs");

    g.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -65)
      .attr("x", -chartHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Probability Density");

    // Add statistics
    const mean = d3.mean(runs) as number;
    const median = d3.median(runs) as number;
    const stdDev = d3.deviation(runs) as number;

    g.append("text")
      .attr("x", 10)
      .attr("y", -20)
      .style("font-size", "16px")
      .style("font-weight", "500")
      .style("fill", "#374151")
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
      .attr("y", chartHeight / 2)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#ef4444")
      .attr("text-anchor", "start")
      .text("Mean");
  };

  useEffect(() => {
    updateChart(bandwidth);
  }, [data, width, height, bandwidth]);

  const handleBandwidthChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newBandwidth = parseFloat(event.target.value);
    setBandwidth(newBandwidth);
  };

  return (
    <div className="chart-container h-full flex flex-col">
      {/* <div className="mb-3 flex-shrink-0">
        <label
          htmlFor="bandwidth-slider"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Kernel Bandwidth: {bandwidth.toFixed(1)}
        </label>
        <div className="flex items-center space-x-4">
          <input
            id="bandwidth-slider"
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            value={bandwidth}
            onChange={handleBandwidthChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-gray-500 w-16">
            <div>Discrete</div>
            <div className="text-right">Smooth</div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Lower values show discrete spikes, higher values create smoother
          curves
        </div>
      </div> */}
      <div className="flex-1 min-h-0">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
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
