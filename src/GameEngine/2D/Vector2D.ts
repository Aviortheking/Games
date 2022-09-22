export default class Vector2D {
	public constructor(
		public x: number,
		public y: number
	) {}

	public multiply(v: Vector2D): Vector2D {
		return new Vector2D(
			v.x * this.x,
			v.y * this.y
		)
	}

	public sum(v: Vector2D): Vector2D {
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

	public set(x: number, y: number) {
		this.x = x
		this.y = y
	}
}
