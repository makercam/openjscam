import Coordinate from './coordinate'

export const axes: string[] = ['x', 'y', 'z', 'a', 'b', 'c', 'u', 'v', 'w']

export function sumCoords(coord1: Coordinate, coord2: Coordinate): Coordinate {
    const newCoord: Coordinate = {}
    axes.forEach((c: string) => {
      if (coord1[c] !== undefined) {
          newCoord[c] = coord1[c]
      }
      if (coord1[c] !== undefined && coord2[c] !== undefined) {
        newCoord[c] = coord1[c] + coord2[c]
      }
    })
    return newCoord
}

export function toRadians(angle: number) {
    return angle * (Math.PI / 180);
}

export function toDegrees(radians: number) {
    return radians * 180 / Math.PI;
}

export function findCoordOnCircle(radius: number, angle: number, offset: Coordinate): Coordinate {
    var newX = radius * Math.cos(toRadians(-angle)) + offset.x!
    var newY = radius * Math.sin(toRadians(-angle)) + offset.y!
    return {
        x: Math.round((newX * 1000)) / 1000,
        y: Math.round((newY * 1000)) / 1000
    }
}

export function mergeCoords(coord1: Coordinate, coord2: Coordinate) {
    const newCoord: Coordinate = {}
    axes.forEach(c => {
      if (coord1[c] !== undefined) {
        newCoord[c] = coord1[c]
      }
      if (coord2[c] !== undefined) {
        newCoord[c] = coord2[c]
      }
    })
    return newCoord
  }