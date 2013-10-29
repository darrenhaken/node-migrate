var migrationSetFactory = require('../model/migrationSetFactory').migrationSetFactory,
    migrationRepository = require('../repositories/migrationRepository'),
    join = require('path').join

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
        migrations,
        migrationSet;

    migrations = migrationRepository.getMigrations(cwdir);
    migrationSet = migrationSetFactory.create(migrationSetTitle, migrations);

    if(migrationName) {
        migrationName = join('migrations', migrationName);
    }

    //Invocates either the up or down function off the migration set
    migrationSet[migrationDirection](null, migrationName);
}

module.exports.migrateCommand = migrateCommand;
module.exports.migrateUpCommand = migrateUpCommand;
module.exports.migrateDownCommand = migrateDownCommand;