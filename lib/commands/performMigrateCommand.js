var log = require('../logger'),
    migrationSetFactory = require('../model/migrationSetFactory').migrationSetFactory,
    join = require('path').join,
    migrate = require('../migrate'),
    fs = require('fs')

function migrateCommand(cwdir) {
    performMigration(cwdir, 'up');
}

function migrateUpCommand(cwdir, fromMigration) {
    performMigration(cwdir, 'up', fromMigration);
}

function migrateDownCommand(cwdir, fromMigration) {
    performMigration(cwdir, 'down', fromMigration);
}

/**
 * Perform a migration in the given `direction`.
 *
 * @param {Number} direction
 */
function performMigration(cwdir, direction, migrationName) {
    migrate('migrations/.migrate');

    function createMigrationScript(migrationFileName) {
        return require(cwdir + '/migrations/' + migrationFileName);
    }

    migrations().forEach(function (migrationFileName) {
        var migrationScript = createMigrationScript(migrationFileName);

        migrate(migrationFileName, migrationScript.up, migrationScript.down);
    });

    var set = migrationSetFactory.create();

    var migrationPath = migrationName
        ? join('migrations', migrationName)
        : migrationName;

    set[direction](null, migrationPath);
}

function migrations() {
    var fileGeneratedFromMigrationRegex = /^\d+.*\.js$/;

    var migrationFiles = fs.readdirSync('migrations')
        .filter(function findMigrationFileNames(fileName) {
            return fileName.match(fileGeneratedFromMigrationRegex);
        })
        .sort();

    return migrationFiles;
}

module.exports.migrateCommand = migrateCommand;
module.exports.migrateUpCommand = migrateUpCommand;
module.exports.migrateDownCommand = migrateDownCommand;