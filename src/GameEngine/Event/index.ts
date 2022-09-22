import GameEngine from 'GameEngine'

export default abstract class Event {
	public constructor(
		protected ge: GameEngine
	) {}

	abstract init(): void
	abstract update(): void
	abstract destroy(): void
}
