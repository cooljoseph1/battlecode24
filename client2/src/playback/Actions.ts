import Turn from './Turn'
import { schema } from 'battlecode-schema'
import assert from 'assert'
import * as renderUtils from '../util/RenderUtil'
import * as vectorUtils from './Vector'
import { Dimension } from './Map'
import { Team } from './Game'

export default class Actions {
    actions: Action[] = []

    constructor() {}

    applyDelta(turn: Turn, delta: schema.Round): void {
        for (let i = 0; i < this.actions.length; i++) {
            this.actions[i].duration--
            if (this.actions[i].duration == 0) {
                this.actions.splice(i, 1)
                i--
            }
        }

        if (delta.actionsLength() > 0) {
            for (let i = 0; i < delta.actionsLength(); i++) {
                const action = delta.actions(i) ?? assert.fail('actions not found in round')
                const robotID = delta.actionIDs(i) ?? assert.fail('actionIDs not found in round')
                const target = delta.actionTargets(i) ?? assert.fail('actionTargets not found in round')
                const actionClass =
                    ACTION_DEFINITIONS[action] ?? assert.fail(`Action ${action} not found in ACTION_DEFINITIONS`)
                const newAction = new actionClass(robotID, target)
                this.actions.push(newAction)
                newAction.apply(turn)
            }
        }
    }

    copy(): Actions {
        const newActions = new Actions()
        newActions.actions = this.actions.map((action) => action.copy())
        return newActions
    }

    draw(mapDimension: Dimension, interpFactor: number, ctx: CanvasRenderingContext2D) {
        for (const action of this.actions) {
            action.draw(mapDimension, interpFactor, ctx)
        }
    }
}

export class Action {
    constructor(protected robotID: number, protected target: number, public duration: number = 1) {}

    /**
     * Applies this action to the turn provided. If stat is provided, it will be mutated to reflect the action as well
     *
     * @param turn the turn to apply this action to
     * @param stat if provided, this action will mutate the stat to reflect the action
     */
    apply(turn: Turn): void {}
    draw(mapDimension: Dimension, interpFactor: number, ctx: CanvasRenderingContext2D) {}
    copy(): Action {
        // creates a new object using this object's prototype and all its parameters. this is a shallow copy, override this if you need a deep copy
        return Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this))
    }
}

export const ACTION_DEFINITIONS: Record<number, typeof Action> = {
    [schema.Action.DIE_EXCEPTION]: class DieException extends Action {
        apply(turn: Turn): void {
            console.log(`Exception occured: robotID(${this.robotID}), target(${this.target}`)
        }
    },
    [schema.Action.CHANGE_HEALTH]: class ChangeHealth extends Action {
        apply(turn: Turn): void {
            const body = turn.bodies.getById(this.robotID)
            if (!turn.stat.completed) turn.stat.getTeamStat(body.team).total_hp[body.type] += this.target
            body.hp += this.target
        }
    },
    [schema.Action.CHANGE_MANA]: class ChangeMana extends Action {
        apply(turn: Turn): void {
            const body = turn.bodies.getById(this.robotID)
            if (!turn.stat.completed && body.type !== schema.BodyType.HEADQUARTERS)
                turn.stat.getTeamStat(body.team).manaMined += this.target
            body.mana += this.target
        }
    },
    [schema.Action.CHANGE_ELIXIR]: class ChangeElixir extends Action {
        apply(turn: Turn): void {
            const body = turn.bodies.getById(this.robotID)
            if (!turn.stat.completed && body.type !== schema.BodyType.HEADQUARTERS)
                turn.stat.getTeamStat(body.team).elixirMined += this.target
            body.elixir += this.target
        }
    },
    [schema.Action.CHANGE_ADAMANTIUM]: class ChangeAdamantium extends Action {
        apply(turn: Turn): void {
            const body = turn.bodies.getById(this.robotID)
            if (!turn.stat.completed && body.type !== schema.BodyType.HEADQUARTERS)
                turn.stat.getTeamStat(body.team).adamantiumMined += this.target
            body.adamantium += this.target
        }
    },
    [schema.Action.THROW_ATTACK]: class Throw extends Action {
        constructor(robotID: number, target: number) {
            super(robotID, target, 1)
        }
        apply(turn: Turn): void {
            const body = turn.bodies.getById(this.robotID)
            assert(body.type === schema.BodyType.CARRIER, 'Cannot throw from non-carrier')
            body.clearResources()
        }
        draw(mapDimension: Dimension, interpFactor: number, ctx: CanvasRenderingContext2D) {
            //const targetLoc = turn.map.indexToLocation(this.target)
        }
    },
    [schema.Action.LAUNCH_ATTACK]: class Launch extends Action {
        private drawLocationStart?: vectorUtils.InterpVector
        private drawLocationEnd?: vectorUtils.InterpVector
        private drawTeam?: Team

        apply(turn: Turn): void {
            const body = turn.bodies.getById(this.robotID)
            assert(body.type === schema.BodyType.LAUNCHER, 'Cannot launch from non-launcher')

            this.drawTeam = body.team
            this.drawLocationStart = { start: body.pos, end: body.nextPos }

            // Target is negative when it represents a miss (map location hit). Otherwise,
            // the attack hit a bot so we must transform the target into the bot's location
            if (this.target >= 0) {
                const targetBody = turn.bodies.getById(this.target)
                this.drawLocationEnd = { start: targetBody.pos, end: targetBody.nextPos }
            } else {
                const location = turn.map.indexToLocation(-this.target - 1)
                this.drawLocationEnd = { start: location, end: location }
            }
        }
        draw(mapDimension: Dimension, interpFactor: number, ctx: CanvasRenderingContext2D) {
            // Compute true start and end points of the projectile
            const interpStart = renderUtils.getInterpolatedCoords(
                this.drawLocationStart!.start,
                this.drawLocationStart!.end,
                interpFactor
            )
            const interpEnd = renderUtils.getInterpolatedCoords(
                this.drawLocationEnd!.start,
                this.drawLocationEnd!.end,
                interpFactor
            )

            // Compute the start and end points for the animation projectile
            const dir = vectorUtils.vectorSub(interpEnd, interpStart)
            const len = vectorUtils.vectorLength(dir)
            vectorUtils.vectorMultiplyInPlace(dir, 1 / len)
            const projectileStart = vectorUtils.vectorAdd(
                interpStart,
                vectorUtils.vectorMultiply(dir, len * interpFactor)
            )
            const projectileEnd = vectorUtils.vectorAdd(
                interpStart,
                vectorUtils.vectorMultiply(dir, len * Math.min(interpFactor + 0.2, 1.0))
            )

            // True direction
            renderUtils.renderLine(
                ctx,
                renderUtils.getRenderCoords(interpStart.x, interpStart.y, mapDimension),
                renderUtils.getRenderCoords(interpEnd.x, interpEnd.y, mapDimension),
                this.drawTeam!,
                0.05,
                0.1,
                true
            )

            // Projectile animation
            renderUtils.renderLine(
                ctx,
                renderUtils.getRenderCoords(projectileStart.x, projectileStart.y, mapDimension),
                renderUtils.getRenderCoords(projectileEnd.x, projectileEnd.y, mapDimension),
                this.drawTeam!,
                0.05,
                1.0,
                false
            )
        }
    },

    // Unused (not visualized)
    [schema.Action.SPAWN_UNIT]: Action,
    [schema.Action.PICK_UP_ANCHOR]: Action,
    [schema.Action.PLACE_ANCHOR]: Action,
    [schema.Action.DESTABILIZE]: Action,
    [schema.Action.DESTABILIZE_DAMAGE]: Action,
    [schema.Action.BOOST]: Action,
    [schema.Action.BUILD_ANCHOR]: Action,
    [schema.Action.PICK_UP_RESOURCE]: Action,
    [schema.Action.PLACE_RESOURCE]: Action
}