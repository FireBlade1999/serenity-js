#!/usr/bin/env node

'use strict';

const
    { satisfies } = require('semver'),
    { spawn } = require('child_process');

const nodeRequiredForParallelExecution = require('mocha-parallel-tests/package').engines.node;

const mocha = satisfies(process.versions.node, nodeRequiredForParallelExecution)
    ? require.resolve('mocha-parallel-tests/dist/bin/cli.js')
    : require.resolve('mocha/bin/mocha');

spawn(mocha, process.argv.slice(2), {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
});
