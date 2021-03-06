import { ensure, isDefined, isInstanceOf, property } from 'tiny-types';

import { DomainEvent, SceneStarts } from './events';
import { ErrorStackParser } from './io';
import { Duration, Timestamp } from './model';
import { Actor } from './screenplay/actor';
import { SerenityConfig } from './SerenityConfig';
import { Cast, Clock, Stage, StageCrewMember, StageManager } from './stage';
import { Extras } from './stage/Extras';

export class Serenity {
    private static defaultCueTimeout    = Duration.ofSeconds(5);
    private static defaultActors        = new Extras();

    private stage: Stage;

    constructor(private readonly clock: Clock = new Clock()) {
        this.stage = new Stage(
            Serenity.defaultActors,
            new StageManager(Serenity.defaultCueTimeout, clock),
        );

        this.stage.assign(new StageHand());
    }

    /**
     * @desc
     *  Configures Serenity/JS. Every call to this function
     *  replaces the previous configuration provided,
     *  so this function should called be exactly once
     *  in your test suite.
     *
     * @param {SerenityConfig} config
     * @return {void}
     */
    configure(config: SerenityConfig): void {

        const cueTimeout = !! config.cueTimeout
            ? ensure('cueTimeout', config.cueTimeout, isInstanceOf(Duration))
            : Serenity.defaultCueTimeout;

        this.stage = new Stage(
            Serenity.defaultActors,
            new StageManager(cueTimeout, this.clock),
        );

        if (!! config.actors) {
            this.engage(config.actors);
        }

        this.stage.assign(new StageHand());

        if (Array.isArray(config.crew)) {
            this.stage.assign(...config.crew);
        }
    }

    /**
     * @desc
     *  Re-configures Serenity/JS with a new {@link Cast} of {@link Actor}s
     *  you'd like to use in any subsequent call to {@link actorCalled}.
     *
     *  This method provides an alternative to calling {@link Actor#whoCan}
     *  directly in your tests and you'd typically us it in a "before each"
     *  hook of your test runner of choice.
     *
     * @example <caption>Engaging a cast of actors</caption>
     *  import { Actor, Cast } from '@serenity-js/core';
     *
     *  class Actors implements Cast {
     *      prepare(actor: Actor) {
     *          return actor.whoCan(
     *              // ... abilities you'd like the Actor to have
     *          );
     *      }
     *  }
     *
     * engage(new Actors();
     *
     * @example <caption>Usage with Jasmine</caption>
     *  import 'jasmine';
     *
     *  beforeEach(() => engage(new Actors()));
     *
     * @example <caption>Usage with Cucumber</caption>
     *  import { Before } from 'cucumber';
     *
     *  Before(() => engage(new Actors());
     *
     * @param {Cast} actors
     * @returns {void}
     *
     * @see {@link Actor}
     * @see {@link Cast}
     */
    engage(actors: Cast): void {
        this.stage.engage(
            ensure('actors', actors, property('prepare', isDefined())),
        );
    }

    /**
     * @desc
     *  Instantiates or retrieves an actor {@link Actor}
     *  called `name` if one has already been instantiated.
     *
     * @example <caption>Usage with Jasmine</caption>
     *   import 'jasmine';
     *   import { actorCalled } from '@serenity-js/core';
     *
     *   describe('Feature', () => {
     *
     *      it('should have some behaviour', () =>
     *          actorCalled('James').attemptsTo(
     *              // ... activities
     *          ));
     *   });
     *
     * @example <caption>Usage with Cucumber</caption>
     *   import { actorCalled } from '@serenity-js/core';
     *   import { Given } from 'cucumber';
     *
     *   Given(/(.*?) is a registered user/, (name: string) =>
     *      actorCalled(name).attemptsTo(
     *              // ... activities
     *          ));
     *
     * @param {string} name
     *  The name of the actor to instantiate or retrieve
     *
     * @returns {Actor}
     *
     * @see {@link engage}
     * @see {@link Actor}
     * @see {@link Cast}
     */
    theActorCalled(name: string): Actor {
        return this.stage.theActorCalled(name);
    }

    /**
     * @desc
     *  Retrieves an actor who was last instantiated or retrieved
     *  using {@link actorCalled}.
     *
     *  This function is particularly useful when automating Cucumber scenarios.
     *
     * @example <captiongit>Usage with Cucumber</caption>
     *   import { actorCalled } from '@serenity-js/core';
     *   import { Given, When } from 'cucumber';
     *
     *   Given(/(.*?) is a registered user/, (name: string) =>
     *      actorCalled(name).attemptsTo(
     *              // ... activities
     *          ));
     *
     *   When(/(?:he|she|they) browse their recent orders/, () =>
     *      actorInTheSpotlight().attemptsTo(
     *              // ... activities
     *          ));
     *
     * @returns {Actor}
     *
     * @see {@link engage}
     * @see {@link actorCalled}
     * @see {@link Actor}
     * @see {@link Cast}
     */
    theActorInTheSpotlight(): Actor {
        return this.stage.theActorInTheSpotlight();
    }

    announce(event: DomainEvent): void {
        this.stage.announce(event);
    }

    currentTime(): Timestamp {
        return this.stage.currentTime();
    }

    /**
     * @package
     */
    waitForNextCue(): Promise<void> {
        return this.stage.waitForNextCue();
    }

    /**
     * @deprecated
     * @experimental
     * @param stageCrewMembers
     */
    setTheStage(...stageCrewMembers: StageCrewMember[]): void {
        deprecated('serenity.setTheStage', 'Please use the new `configure({ crew: stageCrewMembers }) from @serenity-js/core instead.');

        this.stage.assign(...stageCrewMembers);
    }

    /**
     * @deprecated
     * @param actors
     */
    callToStageFor(actors: Cast): Stage {
        deprecated('serenity.callToStageFor(...)', 'Please use `actorCalled(name)` and `actorInTheSpotlight()` functions from @serenity-js/core to access the actors instead.');

        return this.stage.callFor(actors);
    }
}

// todo: remove when the deprecated methods are removed
function deprecated(method: string, message: string) {
    const callers = new ErrorStackParser().parse(new Error())
        .filter(frame => ! /(node_modules)/.test(frame.fileName));

    const location = !! callers[2]
        ? `[${ callers[2].fileName }:${ callers[2].lineNumber }] `
        : '';

    console.warn(`${ location }${ method } has been deprecated. ${ message }`);   // tslint:disable-line:no-console
}

/**
 * @private
 */
class StageHand implements StageCrewMember {
    constructor(
        private readonly stage: Stage = null) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new StageHand(stage);
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof SceneStarts) {
            this.stage.resetActors();
        }
    }
}
