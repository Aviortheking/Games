import Asset from './Asset'

export interface TilesetDeclaration {
	// id: string
	// padding?: number
	fileSize: {width: number, height: number}
	tileSize: number | {width: number, height: number}
	spacing?: number
}

export default class Tileset {

	public constructor(
		public asset: Asset,
		private declaration: TilesetDeclaration
	) {}

	public getPosFromId(id: number): {x: number, y: number} {
		const cols = Math.trunc(this.declaration.fileSize.width / this.width())
		const x = id % cols
		const y = Math.trunc(id / cols)
		return {x, y}
	}

	public getSourceData(id: number): {sx: number ,sy: number} {
		const {x, y} = this.getPosFromId(id)
		const sx = x * this.width() + x * (this.declaration.spacing ?? 0)
		const sy = y * this.height() + y * (this.declaration.spacing ?? 0)
		return {sx, sy}
	}

	public width() {
		const item = this.declaration.tileSize
		return typeof item === 'number' ? item : item.width
	}

	public height() {
		const item = this.declaration.tileSize
		return typeof item === 'number' ? item : item.height
	}
}
