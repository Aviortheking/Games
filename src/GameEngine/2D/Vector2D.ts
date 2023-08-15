import GameEngine from '..'
import MathUtils from '../libs/MathUtils'

/* eslint-disable id-length */
export default class Vector2D {

	public x: number
	public y: number

	// eslint-disable-next-line complexity
	public constructor(
		x: number | [number, number] | Vector2D | {x: number, y: number},
		y?: number
	) {
		// init from a vector
		if (x instanceof Vector2D) {
			this.x = x.x
			this.y = x.y
			return
		}
		// init from an object with x & y as parameters
		if (typeof x === 'object' && 'x' in x && 'y' in x && typeof x.x === 'number' && typeof x.y === 'number') {
			this.x = x.x
			this.y = x.y
			return
		}

		// init from an array
		if (Array.isArray(x) && x.length === 2 && typeof x[0] === 'number' && typeof x[1] === 'number') {
			this.x = x[0]
			this.y = x[1]
			return
		}

		// handle x & y are numbers
		if (typeof x === 'number') {
			this.x = x
			if (typeof y === 'number') {
				this.y = y
			} else {
				this.y = x
			}
			return
		}

		// no init available
		throw new Error(`can't create vector from input x: "${x}" (${typeof x}), y: "${y}" (${typeof y})`)
	}

	/**
	 * return the coordinates from the browser to a GE one
	 * @param clientX the x position from the client (excluding the X scroll)
	 * @param clientY the y position from the client (excluding the Y scroll)
	 * @returns the vector with the position in the game
	 */
	// eslint-disable-next-line complexity
	public static fromBrowser(clientX: number, clientY: number) {
		const ge = GameEngine.getGameEngine()
		if (!ge) {
			return new Vector2D(0)
		}

		return new Vector2D(
			// get X position on browser
			((clientX ?? 0) + window.scrollX - ge.canvas.offsetLeft) /
			(ge.currentScene?.scale ?? 1) * ge.getXCaseCount() /
			ge.canvas.offsetWidth + (ge.currentScene?.position?.x ?? 0),
			// get Y position on browser
			((clientY ?? 0) + window.scrollY - ge.canvas.offsetTop) /
			(ge.currentScene?.scale ?? 1) * ge.getYCaseCount() /
			ge.canvas.offsetHeight + (ge.currentScene?.position?.y ?? 0)
		)
	}

	/**
	 * return a new vector multiplied with the current one
	 * @param v vector
	 * @returns a new vector
	 */
	public multiply(v: Vector2D): Vector2D {
		return new Vector2D(
			v.x * this.x,
			v.y * this.y
		)
	}

	/**
	 * return a new vector summed with the current one
	 * @param v vector or x to add
	 * @param y y to add
	 * @returns a new vector
	 */
	public sum(v: Vector2D | number, y?: number): Vector2D {
		if (typeof v === 'number') {
			return new Vector2D(this.x + v, this.y + (y ?? v))
		}
		return new Vector2D(
			v.x + this.x,
			v.y + this.y
		)
	}

	public neg(): Vector2D {
		return new Vector2D(
			-this.x,
			-this.y
		)
	}

	public sub(x: Vector2D | number, y?: number): Vector2D {
		if (typeof x === 'number') {
			return new Vector2D(this.x - x, this.y - (y ?? x))
		}
		return new Vector2D(
			x.x - this.x,
			x.y - this.y
		)
	}

	public div(v: number): Vector2D {
		return new Vector2D(
			this.x / v,
			this.y / v
		)
	}

	public isIn(topLeft: Vector2D, bottomRight: Vector2D): boolean {
		return this.x >= topLeft.x &&
			this.y >= topLeft.y &&
			this.x <= bottomRight.x &&
			this.y <= bottomRight.y
	}

	public decimalCount(nDecimal: number) {
		return new Vector2D(
			parseFloat(this.x.toFixed(nDecimal)),
			parseFloat(this.y.toFixed(nDecimal))
		)
	}

	/**
	 * return a new Vector with the this minus the other vector/x,y
	 */
	public minus(x: Vector2D | number, y?: number) {
		return this.sum(
			typeof x === 'number' ? -x : -x.x,
			y? -y : typeof x === 'number' ? -x : -x.y,
		)
	}

	public set(x: number | Vector2D, y?: number) {

		if (typeof x === 'object') {
			this.x = x.x
			this.y = x.y
			return this
		}

		this.x = x
		if (!y) {
			this.y = x
		} else {
			this.y = y
		}
		return this
	}

	public setY(y: number) {
		this.y = y
		return this
	}

	public setX(x: number) {
		this.x = x
		return this
	}

	public clone() {
		return new Vector2D(this.x, this.y)
	}

	public toString() {
		return `${this.x}, ${this.y}`
	}

	public toFixed(fractionDigits?: number) {
		return `${this.x.toFixed(fractionDigits)}, ${this.y.toFixed(fractionDigits)}`
	}

	public equal(x: Vector2D | number, y?: number): boolean {
		let otherX = 0
		let otherY = y ?? 0
		if (x instanceof Vector2D) {
			otherX = x.x
			otherY = x.y
		} else {
			otherX = x
			if (!y) {
				otherY = x
			}
		}
		return otherX === this.x && otherY === this.y
	}

	public toArray(): [number, number] {
		return [this.x, this.y]
	}

	/**
	 * return the angle to make [this] look at [point]
	 * @param point the second point
	 *
	 * @returns the angle in degrees
	 */
	public angle(point: Vector2D): number {
		return Math.atan2(
			this.y - point.y,
			this.x - point.x
		) * 180 / Math.PI + 180
	}

	// eslint-disable-next-line complexity
	public toBrowser(): [number, number] {
		const ge = GameEngine.getGameEngine()
		const offsetLeft = ge.canvas.offsetLeft
		const offsetTop = ge.canvas.offsetTop

		const canvasW = ge.canvas.offsetWidth
		const canvasH = ge.canvas.offsetHeight

		const finalX = offsetLeft + canvasW * (this.x - ge.currentScene!.position.x) / ge.getXCaseCount() * ge.currentScene!.scale
		const finalY = offsetTop + canvasH * (this.y - ge.currentScene!.position.y) / ge.getYCaseCount() * ge.currentScene!.scale

		return [
			finalX,
			finalY
		]
	}

	public distance(b: Vector2D): Vector2D {
		return new Vector2D(
			this.x - b.x,
			this.y - b.y
		)
	}

	/**
	 * rotate the vector by the {origin}
	 * @param origin the point of rotation
	 * @param degrees the number of degrees of rotation
	 */
	public rotate(origin: Vector2D, degrees: number): Vector2D {
		const radians = MathUtils.toRadians(degrees)
		const tmp = this.sum(-origin.x, -origin.y)
		return new Vector2D(
			origin.x + (tmp.x * Math.cos(radians) - tmp.y * Math.sin(radians)),
			origin.y + (tmp.x * Math.sin(radians) + tmp.y * Math.cos(radians))
		)
	}
}
