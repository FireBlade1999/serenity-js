import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';
import { Ensure, isGreaterThan } from '../../src';

describe('isGreaterThan', () => {

    const Astrid = Actor.named('Astrid');

    /** @test {isGreaterThan} */
    it(`allows for the actor flow to continue when the "actual" is greater than "expected"`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that(5, isGreaterThan(4)),
        )).to.be.fulfilled;
    });

    /** @test {isGreaterThan} */
    it(`breaks the actor flow when "actual" is not greater than "expected"`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that(0, isGreaterThan(2)),
        )).to.be.rejectedWith(AssertionError, `Expected 0 to have value greater than 2`);
    });

    /** @test {isGreaterThan} */
    it(`contributes to a human-readable description`, () => {
        expect(Ensure.that(5, isGreaterThan(4)).toString())
            .to.equal(`#actor ensures that 5 does have value greater than 4`);
    });
});
