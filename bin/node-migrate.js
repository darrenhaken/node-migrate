#!/usr/bin/env node

var migrate = require('../lib/migrate'),
    log = require('../lib/logger'),
    join = require('path').join,
    fs = require('fs'),
    program = require('commander');

program
    .version('0.1.3')
    .option('-C, --chdir [directory]', 'Specify working directory to process migrations', process.cwd())
    .option('-c, --connection', 'specify the MongoDB connection')
    .option('-u, --username', 'specify the MongoDB Username')
    .option('-p, --password', 'specify the MongoDB Password');

program
    .command('create <migrationName>')
    .description('create migration script')
    .action(create);

program
    .command('migrate')
    .description('migrate MongoDB instance')
    .action(migrateDatabase);

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

    function pad(n) {
        return Array(4 - n.toString().length).join('0') + n;
    }

    function createMigrationTitle(migrationName) {
        var migrations = fs.readdirSync('migrations')
            .filter(function(file){
                return file.match(/^\d+/);
            })
            .map(function(file){
                return parseInt(file.match(/^(\d+)/)[1], 10);
            })
            .sort(function(a, b){
                return a - b;
            });

        var migrationNumber = pad((migrations.pop() || 0) + 1);
        return migrationNumber + '-' + migrationName;
    }

    function createMigrationTemplate(migrationName) {
        var migrationFileName = createMigrationTitle(migrationName);

        var path = 'migrations/' + migrationFileName + '.js',
            template = [
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

        var fullPath = join(program.chdir, path);

        log('create', fullPath);
        fs.writeFileSync(fullPath, template);
    }

    createMigrationDirectory();
    createMigrationTemplate(migrationName);
}

function migrateDatabase() {

}
