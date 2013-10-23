#!/usr/bin/env node

var migrate = require('../lib/migrate'),
    log = require('../lib/logger'),
    join = require('path').join,
    fs = require('fs'),
    program = require('commander'),
    packageJson = ('./package.json');

program
    .version('0.1.3')
    .option('-c, --connection', 'specify the MongoDB connection')
    .option('-u, --username', 'specify the MongoDB Username')
    .option('-p, --password', 'specify the MongoDB Password');

program
    .command('create <migrationName>')
    .description('create migration script')
    .action(create);

program
    .command('migrate')
    .description('create migration script')
    .action(function(){
        console.log('migrate:');
    });

//Must execute this after registering all the commands
program.parse(process.argv);

function create(migrationName) {
    function createMigrationDirectory() {
        var createMask = 0774;

        try {
            fs.mkdirSync('migrations', createMask);
        } catch (err) {
            // ignore
        }
    }

    function createMigrationTemplate(migrationName) {
        var path = 'migrations/' + migrationName + '.js',
            currentWorkingDirectory = process.cwd();

        var template = [
            '',
            'exports.up = function(next){',
            '  next();',
            '};',
            '',
            'exports.down = function(next){',
            '  next();',
            '};',
            ''
        ].join('\n');

        log('create', join(currentWorkingDirectory, path));
        fs.writeFileSync(path, template);
    }

    createMigrationDirectory();
    createMigrationTemplate(migrationName);
}



