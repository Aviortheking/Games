import GameEngine from 'GameEngine'

export default interface Renderer {
	render(ge: GameEngine, ctx: CanvasRenderingContext2D): Promise<void>
}
