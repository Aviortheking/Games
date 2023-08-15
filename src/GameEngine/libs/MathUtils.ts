export default class MathUtils {
	/**
	 * round the value to the nearest value
	 *
	 * ex: [88, 45] round to 90, while [50, 45] round to 45
	 * @param value the value to round
	 * @param near the multiplier to near to
	 * @returns the value closest to the nearest [near]
	 */
	public static roundToNearest(value: number, near: number): number {
		// get the remainder of the division
		const remainder = value % near
		// if remainder is 0 then no need to round
		if (remainder === 0 || near <= 0) {
			return value
		}
		// round down if value is less than near / 2
		if (remainder < near / 2) {
			return value - remainder
		}
		// round up
		return value - remainder + near
	}

	/**
	 * clamp the specified value between two other values
	 * @param value the value to clamp
	 * @param min the minimum value
	 * @param max the maxmimum
	 * @returns the value clamped between [min] and [max]
	 */
	public static clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max)
	}

	/**
	 * transform degrees to radians
	 * @param deg the value in degrees
	 * @returns the value in radians
	 */
	public static toRadians(deg: number): number {
		deg = deg % 360
		if (deg < 0) {
			deg = 360 + deg
		}
		return deg * (Math.PI / 180)
	}
}
