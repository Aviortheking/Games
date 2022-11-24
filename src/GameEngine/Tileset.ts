import Asset from './Asset'

export type TilesetDeclaration = {
	// id: string
	// padding?: number
	fileSize: {width: number, height: number}
	tileSize: number | {width: number, height: number}
	spacing?: number
} | Array<{
	x: number
	y: number
	width: number
	height: number
}>

export default class Tileset {

	public constructor(
		public asset: Asset,
		private declaration: TilesetDeclaration
	) {}

	// public getPosFromId(id: number): {x: number, y: number} {

	// 	return {x, y}
	// }

	public getSourceData(id: number): {sx: number ,sy: number} {
		if (Array.isArray(this.declaration)) {
			const item = this.declaration[id]
			return {sx: item.x, sy: item.y}
		}
		// const {x, y} = this.getPosFromId(id)
		const cols = Math.trunc(this.declaration.fileSize.width / this.width(id))
		// eslint-disable-next-line id-length
		const x = id % cols
		// eslint-disable-next-line id-length
		const y = Math.trunc(id / cols)
		const sx = x * this.width(id) + x * (this.declaration.spacing ?? 0)
		const sy = y * this.height(id) + y * (this.declaration.spacing ?? 0)
		return {sx, sy}
	}

	public width(id: number) {
		if (Array.isArray(this.declaration)) {
			return this.declaration[id].width
		}
		const item = this.declaration.tileSize
		return typeof item === 'number' ? item : item.width
	}

	public height(id: number) {
		if (Array.isArray(this.declaration)) {
			return this.declaration[id].height
		}
		const item = this.declaration.tileSize
		return typeof item === 'number' ? item : item.height
	}
}
