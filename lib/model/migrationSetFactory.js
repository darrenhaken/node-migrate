var logger = require('../logger'),
    MigrationSet = require('./migrationSet').migrationSet;

var migrationSetFactory = {

    create: function (title, migrations, direction, startingMigration) {
        var migrationSet = new MigrationSet(title, direction, startingMigration);

        migrations.forEach(function(migration) {
            migrationSet.addMigration(migration);
        });

        migrationSet = registerEventHandlers(migrationSet);

        return migrationSet;
    }
}

function registerEventHandlers(migrationSet) {
    migrationSet.on('migration', function (migration, direction) {
        logger.log(direction, migration.title);
    });

    migrationSet.on('save', function () {
        logger.log('migration', 'complete');
        process.exit();
    });

    return migrationSet;
}

module.exports.migrationSetFactory = migrationSetFactory;