import { expect, ifExitCodeIsOtherThan, logOutput, Pick, SpawnResult } from '@integration/testing-tools';
import {
    ActivityFinished,
    ActivityStarts,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { ExecutionSkipped, FeatureTag, ImplementationPending, Name } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';

import { CucumberRunner, cucumberVersions } from '../src';

describe('@serenity-js/cucumber', function() {

    this.timeout(5000);

    given([
        ...cucumberVersions(1)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/register.js',
                'features/support/configure_serenity.ts',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario with steps marked as pending')
            .toRun('features/pending_scenarios.feature'),

        ...cucumberVersions(2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/register.js',
                'features/support/configure_serenity.ts',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario with steps marked as pending', '--no-strict')
            .toRun('features/pending_scenarios.feature'),

        ...cucumberVersions(3)
            .thatRequires('features/support/configure_serenity.ts')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
                '--name', 'A scenario with steps marked as pending', '--no-strict',
            )
            .toRun('features/pending_scenarios.feature'),
    ]).
    it(`recognises a pending scenario where some steps are marked as 'pending'`, (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            // expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario with steps marked as pending')))
                .next(TestRunnerDetected,  event => expect(event.value).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`Given a step that's marked as pending`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ImplementationPending()))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ImplementationPending()))
            ;
        }));

    given([
        ...cucumberVersions(1)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/register.js',
                'features/support/configure_serenity.ts',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario with steps that have not been implemented yet')
            .toRun('features/pending_scenarios.feature'),

        ...cucumberVersions(2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/register.js',
                'features/support/configure_serenity.ts',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario with steps that have not been implemented yet', '--no-strict')
            .toRun('features/pending_scenarios.feature'),

        ...cucumberVersions(3)
            .thatRequires('features/support/configure_serenity.ts')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
                // '--no-strict',                       // cucumber 3 ignores the --no-strict mode
                '--name', 'A scenario with steps that have not been implemented yet',
            )
            .toRun('features/pending_scenarios.feature'),
    ]).
    it(`recognises a pending scenario where some steps have not been implemented yet`, (runner: CucumberRunner) => runner.run().
        // then(ifExitCodeIsOtherThan(0, logOutput)).   // cucumber 3 ignores the --no-strict mode
        then(res => {
            // expect(res.exitCode).to.equal(0);        // cucumber 3 ignores the --no-strict mode

            Pick.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario with steps that have not been implemented yet')))
                .next(TestRunnerDetected,  event => expect(event.value).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`Given a step that hasn't been implemented yet`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ImplementationPending()))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ImplementationPending()))
            ;
        }));

    given([
        ...cucumberVersions(1)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/register.js',
                'features/support/configure_serenity.ts',
                'features/support/wip_hook.ts',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario which tag marks it as pending')
            .toRun('features/pending_scenarios.feature'),

        ...cucumberVersions(2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/register.js',
                'features/support/configure_serenity.ts',
                'features/support/wip_hook.ts',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario which tag marks it as pending', '--no-strict')
            .toRun('features/pending_scenarios.feature'),
    ]).
    it(`recognises a scenario tagged as 'pending'`, (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            // expect(res.exitCode).to.equal(0);

            Pick.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario which tag marks it as pending')))
                .next(TestRunnerDetected,  event => expect(event.value).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`Given step number one that passes`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`And step number two that is marked as pending`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`And step number three that fails`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ImplementationPending()))
            ;
        }));

    given([
        ...cucumberVersions(3)
            .thatRequires(
                'features/support/configure_serenity.ts',
                'features/support/wip_hook.ts',
            )
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
                '--name', 'A scenario which tag marks it as pending',
                // '--no-strict',
            )
            .toRun('features/pending_scenarios.feature'),
    ]).
    it(`recognises a scenario tagged as 'pending'`, (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(1, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(1);

            Pick.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario which tag marks it as pending')))
                .next(TestRunnerDetected,  event => expect(event.value).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`Given step number one that passes`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ImplementationPending()))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`And step number two that is marked as pending`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name(`And step number three that fails`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ImplementationPending()))
            ;
        }));
});
