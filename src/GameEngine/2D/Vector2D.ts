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

	public isIn(topLeft: Vector2D, bottomRight: Vector2D): boolean {
		return this.x >= topLeft.x &&
			this.y >= topLeft.y &&
			this.x <= bottomRight.x &&
			this.y <= bottomRight.y
	}
}
