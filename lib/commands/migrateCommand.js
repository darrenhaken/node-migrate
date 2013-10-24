var log = require('../logger'),
    join = require('path').join,
    migrate = require('../migrate'),
    fs = require('fs')

    function migrateCommand() {
    performMigration('up');
}

function migrateUpCommand(fromMigration) {
    performMigration('up', fromMigration);
}

function migrateDownCommand(fromMigration) {
    performMigration('down', fromMigration);
}

/**
 * Perform a migration in the given `direction`.
 *
 * @param {Number} direction
 */
function performMigration(direction, migrationName) {
    migrate('migrations/.migrate');

    migrations().forEach(function (path) {
        var mod = require(process.cwd() + '/' + path);
        migrate(path, mod.up, mod.down);
    });

    var set = migrate();

    set.on('migration', function (migration, direction) {
        log(direction, migration.title);
    });

    set.on('save', function () {
        log('migration', 'complete');
        process.exit();
    });

    var migrationPath = migrationName
        ? join('migrations', migrationName)
        : migrationName;

    set[direction](null, migrationPath);
}

function migrations() {
    return fs.readdirSync('migrations').filter(function (file) {
        return file.match(/^\d+.*\.js$/);
    }).sort().map(function (file) {
            return 'migrations/' + file;
        });
}


module.exports = migrateCommand;
module.exports.migrateUpCommand = migrateUpCommand;
module.exports.migrateDownCommand = migrateDownCommand;