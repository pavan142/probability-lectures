import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RunsDistributionChartProps {
  data: number[];
  width?: number;
  height?: number;
}

export const RunsDistributionChart: React.FC<RunsDistributionChartProps> = ({ 
  data, 
  width = 800, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const runs = data.filter(runs => runs > 0);
    
    if (runs.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create histogram
    const histogram = d3.histogram()
      .domain(d3.extent(runs) as [number, number])
      .thresholds(d3.thresholdScott(runs, d3.min(runs) as number, d3.max(runs) as number));

    const bins = histogram(runs);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.x1) as number])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) as number])
      .range([chartHeight, 0]);

    // Add grid
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickSize(-chartHeight).tickFormat(() => ''));

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).tickSize(-chartWidth).tickFormat(() => ''));

    // Add bars
    g.selectAll('.bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.x0 as number))
      .attr('width', d => Math.max(0, xScale(d.x1 as number) - xScale(d.x0 as number) - 1))
      .attr('y', d => yScale(d.length))
      .attr('height', d => chartHeight - yScale(d.length))
      .attr('fill', '#0ea5e9')  
      .attr('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1);
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none');
        
        tooltip.html(`
          Runs: ${d.x0}-${d.x1}<br/>
          Frequency: ${d.length}<br/>
          Percentage: ${((d.length / runs.length) * 100).toFixed(1)}%
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8);
        d3.selectAll('.tooltip').remove();
      });

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', chartWidth / 2)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .text('Runs');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .text('Frequency');

    // Add statistics
    const mean = d3.mean(runs) as number;
    const median = d3.median(runs) as number;
    const stdDev = d3.deviation(runs) as number;

    g.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('class', 'text-sm fill-gray-600')
      .text(`Mean: ${mean.toFixed(1)} | Median: ${median.toFixed(1)} | Std Dev: ${stdDev.toFixed(1)}`);

  }, [data, width, height]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
}; 