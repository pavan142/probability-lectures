import { printPoints } from "./utils";
import clipboard from "clipboardy";

export const genUncorrelatedDistribution = (numPoints: number = 50) => {
  const points: { x: number; y: number }[] = [];
  const radius = 5;
  const centerX = 0;
  const centerY = 0;

  for (let i = 0; i < numPoints; i++) {
    // Generate random angle between 0 and 2π
    const angle = Math.random() * 2 * Math.PI;

    // Generate random radius between 0 and 5 (uniform distribution within circle)
    // Using square root for uniform distribution in area
    const randomRadius = Math.sqrt(Math.random()) * radius;

    // Convert polar coordinates to Cartesian coordinates
    const x = centerX + randomRadius * Math.cos(angle);
    const y = centerY + randomRadius * Math.sin(angle);

    points.push({ x, y });
  }

  return points;
};

export const genPositiveCorrelatedDistribution = (numPoints: number = 50) => {
  const points: { x: number; y: number }[] = [];
  const spread = 1.5; // Controls how spread out the points are from the line x=y
  const range = 8; // Range of values for x (and y)

  for (let i = 0; i < numPoints; i++) {
    // Generate a base point along the line x=y
    const baseValue = (Math.random() - 0.5) * range;

    // Add some noise perpendicular to the line x=y
    const noise = (Math.random() - 0.5) * spread;

    // Convert to x,y coordinates
    // x = baseValue + noise/sqrt(2)
    // y = baseValue - noise/sqrt(2)
    const x = baseValue + noise / Math.sqrt(2);
    const y = baseValue - noise / Math.sqrt(2);

    points.push({ x, y });
  }

  return points;
};

export const genNegativeCorrelatedDistribution = (numPoints: number = 50) => {
  return genPositiveCorrelatedDistribution(numPoints).map((point) => ({
    x: -point.x,
    y: point.y,
  }));
};

export function main() {
  //   const points = genUncorrelatedDistribution(300);
  const points = genPositiveCorrelatedDistribution(100);
  //   const points = genNegativeCorrelatedDistribution(100);

  const pointsText = printPoints(points);

  // Copy to clipboard using Node.js clipboardy package
  clipboard.writeSync(pointsText);
  console.log("Points copied to clipboard!");
}

main();
