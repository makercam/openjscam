import fs from 'fs'
import * as THREE from 'three'

import { IMPERIAL, Unit } from './constants'
import Coordinate from './coordinate'
import Arc from './segments/arc'
import Dwell from './segments/dwell'
import Linear from './segments/linear'
import Rapid from './segments/rapid'
import Rotate from './segments/rotate'
import Segment from './segments/segment'
import Translate from './segments/translate'
import Units from './segments/units'
import { axes, mergeCoords, sumCoords, toRadians } from './utils'

export default class GcodeGenerator {
    public gcode: string[] = []
    public lastCoord: Coordinate = { x: 0, y: 0, z: 0 }
    
    updateLastCoord(coord: Coordinate) {
      axes.forEach(c => {
        if (coord[c] !== undefined) {
          this.lastCoord[c] = coord[c]
        }
      })
    }

    applyTransformation(coord: Coordinate, transformation: Segment): Coordinate {
      let newCoord = {}
      if (transformation instanceof Translate) {
        var translated = new THREE.Vector3(coord.x, coord.y, coord.z);
        translated.add(new THREE.Vector3(transformation.offset.x, transformation.offset.y, transformation.offset.z))
        newCoord = {
          x: Math.round(translated.x * 1000) / 1000,
          y: Math.round(translated.y * 1000) / 1000,
          z: Math.round(translated.z * 1000) / 1000
        }
      }
      if (transformation instanceof Rotate) {
        var rotated = new THREE.Vector3(coord.x, coord.y, coord.z);
        rotated.applyAxisAngle(new THREE.Vector3(0, 0, 1), -toRadians(transformation.angle))
        newCoord = {
          x: Math.round(rotated.x * 1000) / 1000,
          y: Math.round(rotated.y * 1000) / 1000,
          z: Math.round(rotated.z * 1000) / 1000
        }
      }
      return newCoord
    }
    
    toAbsolute(segments: Segment[]) {
      let lastCoord: Coordinate = { x: 0, y: 0, z: 0 }
      for (const segment of segments) {
        if (segment instanceof Linear || segment instanceof Rapid) {
          if (segment.incremental === true) {
            segment.outCoord = sumCoords(lastCoord, segment.outCoord)
            segment.incremental = false
          }
          lastCoord = mergeCoords(lastCoord, segment.outCoord)
        }
        if (segment instanceof Arc) {
          const outCoord = segment.getOutCoordForInCoord(lastCoord)
          lastCoord = mergeCoords(lastCoord, outCoord)
        }
      }
      return segments
    }

    generate(segments: Segment[], transformations: Segment[] = []) {
      const absoluteSegments = this.toAbsolute(segments)
      for (const transformation of transformations) {
        for (const segment of absoluteSegments) {
          if (segment instanceof Linear || segment instanceof Rapid) {
            segment.outCoord = this.applyTransformation(segment.outCoord, transformation)
          }
          if (segment instanceof Arc && transformation instanceof Rotate) {
            segment.offset = this.applyTransformation(segment.offset, transformation)
          }
        }
      }
      for (const segment of absoluteSegments) {
        if (segment instanceof Dwell) {
          this.debug(`dwell(${segment.duration})`)
          this.dwell(segment.duration)
        } else if (segment instanceof Units) {
          this.debug(`units(${segment.units})`)
          this.units(segment.units)
        } else if (segment instanceof Linear) {
          this.debug(`linear(${JSON.stringify(segment.outCoord)}, ${segment.feedRate})`)
          this.moveLinearToCoord(segment.outCoord, segment.feedRate);
          this.updateLastCoord(segment.outCoord)
        } else if (segment instanceof Rapid) {
          this.debug(`rapid(${JSON.stringify(segment.outCoord)})`)
          this.moveRapidToCoord(segment.outCoord);
          this.updateLastCoord(segment.outCoord)
        } else if (segment instanceof Arc) {
          this.debug(`arc(${JSON.stringify(segment.offset)}, ${segment.angle})`)
          const outCoord = segment.getOutCoordForInCoord(this.lastCoord)
          this.arc(segment)
          this.updateLastCoord(outCoord)
        } else if (segment instanceof Translate) {
          this.debug(`translate(${JSON.stringify(segment.offset)})`)
          this.generate(segment.segments, transformations.concat([segment]))
        } else if (segment instanceof Rotate) {
          this.debug(`rotate(${segment.angle})`)
          this.generate(segment.segments, transformations.concat([segment]))
        }
      }
      return this;
    }
  
    write(command: string) {
      this.gcode.push(command);
    }

    debug(comment: string) {
      if (process.env.DEBUG) {
        this.gcode.push(`(${comment})`)
      }
    }
  
    retract(height: number) {
      this.write(`G1 Z${height}`);
    }
  
    dwell(duration: number) {
      this.write(`G04 P${duration}`);
    }

    units(units: Unit) {
      this.write(units === IMPERIAL ? 'G20' : 'G21')
    }
  
    moveRapidToCoord(coord: Coordinate): void {
      this.write(`G0${coord.x !== undefined && coord.x !== null ? ` X${coord.x}` : ''}${coord.y !== undefined && coord.y !== null ? ` Y${coord.y}` : ''}${coord.z !== undefined && coord.z !== null ? ` Z${coord.z}` : ''}`);
    }
  
    moveLinearToCoord(coord: Coordinate, feedRate?: number): void {
      this.write(`G1${coord.x !== undefined && coord.x !== null ? ` X${coord.x}` : ''}${coord.y !== undefined && coord.y !== null ? ` Y${coord.y}` : ''}${coord.z !== undefined && coord.z !== null ? ` Z${coord.z}` : ''}${feedRate ? ` F${feedRate}` : ''}`);
    }

    arc(arc: Arc) {
      const outCoord = arc.getOutCoordForInCoord(this.lastCoord)
      const centerCoord: Coordinate = {
        x: this.lastCoord.x + arc.offset.x,
        y: this.lastCoord.y + arc.offset.y,
      }
      const i = Math.round((centerCoord.x - this.lastCoord.x) * 10000) / 10000
      const j = Math.round((centerCoord.y - this.lastCoord.y) * 10000) / 10000
      this.write(`${arc.angle > 0 ? 'G2' : 'G3'} X${outCoord.x} Y${outCoord.y} I${i} J${j}${outCoord.z !== undefined ? ` Z${outCoord.z}` : ''}${arc.feedRate ? ` F${arc.feedRate}` : ''}`)
    }
  
    save(path: string) {
      fs.writeFileSync(path, this.toString())
    }

    toString() {
      return this.gcode.join('\n')
    }
  }
  