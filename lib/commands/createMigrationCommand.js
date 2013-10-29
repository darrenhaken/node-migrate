var logger = require('../logger'),
    join = require('path').join,
    fs = require('fs');

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

function createMigrationTemplate(currentWorkingDirectory, migrationName) {
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

    var fullPath = join(currentWorkingDirectory, path);

    logger.log('create', fullPath);
    fs.writeFileSync(fullPath, template);
}

function createMigrationCommand(currentWorkingDirectory, migrationName) {
    createMigrationDirectory();
    createMigrationTemplate(currentWorkingDirectory, migrationName);
}

module.exports.createMigrationCommand = createMigrationCommand;