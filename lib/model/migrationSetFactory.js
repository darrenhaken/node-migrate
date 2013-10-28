var log = require('../logger'),
    MigrationSet = require('./migrationSet').migrationSet;

var migrationSetFactory = {

    create: function (title, migrations) {
        var migrationSet = new MigrationSet(title);

        migrations.forEach(function(migration) {
            migrationSet.addMigration(migration);
        });

        migrationSet = registerEventHandlers(migrationSet);

        return migrationSet;
    }
}

function registerEventHandlers(migrationSet) {
    migrationSet.on('migration', function (migration, direction) {
        log(direction, migration.title);
    });

    migrationSet.on('save', function () {
        log('migration', 'complete');
        process.exit();
    });

    return migrationSet;
}

module.exports.migrationSetFactory = migrationSetFactory;