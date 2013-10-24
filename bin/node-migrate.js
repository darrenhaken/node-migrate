#!/usr/bin/env node

var migrate = require('../lib/migrate'),
    createMigrationCommand = require('../lib/commands/createMigrationCommand').createMigrationCommand,
    migrateCommand = require('../lib/commands/migrateCommand'),
    join = require('path').join,
    program = require('commander');

program
    .version('0.1.3')
    .option('-C, --chdir [directory]', 'Specify working directory to process migrations', process.cwd())
    .option('-c, --connection', 'specify the MongoDB connection')
    .option('-u, --username', 'specify the MongoDB Username')
    .option('-p, --password', 'specify the MongoDB Password');

program
    .command('create <migrationName>')
    .description('create migration script template')
    .action(function(migrationName) {
        createMigrationCommand(program.chdir, migrationName);
    });

program
    .command('migrate-down <migrationName>')
    .description('migrate down till given migration')
    .action(function(migrationName) {
        console.log('Work in progress - migrate down')
    });

program
    .command('migrate-up <migrationName>')
    .description('migrate up till given migration')
    .action(function(migrationName) {
        console.log('Work in progress - migrate up')
    });

program
    .command('migrate')
    .description('migrate until last migration')
    .action(migrateCommand);

//Must execute this after registering all the commands
program.parse(process.argv);