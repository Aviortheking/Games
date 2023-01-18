/* eslint-disable id-length */
export default class Vector2D {

	public x: number
	public y: number

	public constructor(
		x: number | [number, number],
		y?: number
	) {
		if (typeof x === 'object') {
			this.x = x[0]
			this.y = x[1]
			return
		}
		this.x = x
		if (typeof y === 'number') {
			this.y = y
		} else {
			this.y = x
		}
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

	public sub(v: Vector2D): Vector2D {
		return new Vector2D(
			v.x - this.x,
			v.y - this.y
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

	public equal(vector: Vector2D): boolean {
		return vector.x === this.x && vector.y === this.y
	}

	public toArray(): [number, number] {
		return [this.x, this.y]
	}
}
