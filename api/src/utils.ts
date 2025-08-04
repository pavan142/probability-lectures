import { Point } from "./types";

export const trimPoint = (point: Point): { x: string; y: string } => {
  const trimmedPoint = {
    x: point.x.toFixed(1),
    y: point.y.toFixed(1),
  };

  return trimmedPoint;
};

export const printPoints = (points: Point[]) => {
  return points
    .map(trimPoint)
    .map((point) => `${point.x} | ${point.y}`)
    .join("\n");
};
