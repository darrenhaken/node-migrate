var log = require('../logger'),
    MigrationSet = require('./migrationSet').migrationSet;

var migrationSetFactory = {

    create: function (migrationTitle) {
        var set = new MigrationSet(migrationTitle);

        set.on('migration', function (migration, direction) {
            log(direction, migration.title);
        });

        set.on('save', function () {
            log('migration', 'complete');
            process.exit();
        });

        return set;
    }
};

module.exports.migrationSetFactory = migrationSetFactory;