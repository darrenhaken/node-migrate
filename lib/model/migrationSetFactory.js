var migrate = require('../migrate'),
    log = require('../logger');

var migrationSetFactory = {

    create: function () {
        var set = migrate();

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