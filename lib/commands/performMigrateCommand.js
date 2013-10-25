var log = require('../logger'),
    migrationSetFactory = require('../model/migrationSetFactory').migrationSetFactory,
    join = require('path').join,
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
 * @param {Number} migrationDirection
 */
function performMigration(cwdir, migrationDirection, migrationName) {
    var migrationSetTitle = 'migrations/.migrate',
        migrationSet = migrationSetFactory.create(migrationSetTitle);

    function createMigrationScript(migrationFileName) {
        return require(cwdir + '/migrations/' + migrationFileName);
    }

    migrations().forEach(function (migrationFileName) {
        var migrationScript = createMigrationScript(migrationFileName);
        migrationSet.addMigration(migrationFileName, migrationScript.up, migrationScript.down);
    });

    var migrationPath = migrationName
        ? join('migrations', migrationName)
        : migrationName;

    migrationSet[migrationDirection](null, migrationPath);
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