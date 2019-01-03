import Coordinate from './coordinate'

export const axes: string[] = ['x', 'y', 'z', 'a', 'b', 'c', 'u', 'v', 'w']

export function sumCoords(coord1: Coordinate, coord2: Coordinate): Coordinate {
    const newCoord: Coordinate = {}
    axes.forEach((axis: string) => {
      const coord1AxisValue = coord1[axis]
      const coord2AxisValue = coord2[axis]
      if (coord1AxisValue !== undefined) {
          newCoord[axis] = coord1AxisValue
      }
      if (coord1AxisValue !== undefined && coord2AxisValue !== undefined) {
        newCoord[axis] = coord1AxisValue + coord2AxisValue
      }
    })
    return newCoord
}

export function subCoords(coord1: Coordinate, coord2: Coordinate): Coordinate {
    const newCoord: Coordinate = {}
    axes.forEach((axis: string) => {
      const coord1AxisValue = coord1[axis]
      const coord2AxisValue = coord2[axis]
      if (coord1AxisValue !== undefined) {
          newCoord[axis] = coord1AxisValue
      }
      if (coord1AxisValue !== undefined && coord2AxisValue !== undefined) {
        newCoord[axis] = coord1AxisValue - coord2AxisValue
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

export function round(number: number, precision: number = 10000) {
    return Math.round(number * precision) / precision
}

export function roundCoord(coord: Coordinate, precision: number = 10000) {
    const newCoord: Coordinate = {}
    axes.forEach(axis => {
      const value = coord[axis]
      if (value !== undefined) {
        newCoord[axis] = round(value, precision)
      }
    })
    return newCoord
}

export function mirrorCoord(coord: Coordinate) {
    const newCoord: Coordinate = {}
    axes.forEach(axis => {
        const axisValue = coord[axis]
        if (axisValue !== undefined) {
            newCoord[axis] = axisValue > 0 ? -axisValue : Math.abs(axisValue)
        }
    })
    return newCoord
}

export function coordToString(coord: Coordinate) {
    let str = ''
    axes.forEach((axis) => {
        const value = coord[axis]
        if (value !== undefined) {
            str += `${str.length === 0 ? '' : ' '}${axis.toUpperCase()}${round(value)}`
        }
    })
    return str
}

