var fs = require('fs'),
    logger = require('../logger');

var fileMigrationStrategy = function (migrationSet, direction, migrationName) {

    fs.readFile(migrationSet.path, 'utf8', function (err, json) {
        var migrationSetFromFile;

        function hasErrorAndNotFileNotFoundError(err) {
            return err && err.code != 'ENOENT';
        }

        function processMigration() {
            if (json) {
                migrationSetFromFile = JSON.parse(json);
                migrationSet.pos = migrationSetFromFile.pos;
            }

            migrate(migrationSet, direction, migrationName);
        }

        if (hasErrorAndNotFileNotFoundError(err)) {
            logger.error('Could not load migration history, error: ' + err);
        }
        else {
            processMigration();
        }
    });
};

/**
 * Get index of given migration in list of migrations
 *
 * @api private
 */
function positionOfMigration(migrations, filename) {
    var numberMigrations = migrations.length;
    var migrationPosition = -1;

    for (var migrationIndex = 0; migrationIndex < numberMigrations; migrationIndex++) {

        if (migrations[migrationIndex].title == filename) {
            migrationPosition = migrationIndex;
        }
    }
    return migrationPosition;
}

/**
 * Perform migration.
 *
 * @api private
 */

function migrate(migrationSet, direction, fn, migrationName) {
    var migrationsForDirection = getMigrationsFor(migrationSet, direction, migrationName);

    function next(errFromPreviousMigration, migration) {
        if (errFromPreviousMigration) {
            return fn(errFromPreviousMigration);
        }

        // done
        if (!migration) {
            migrationSet.emit('complete');
            save(migrationSet);

        } else {
            migrationSet.emit('migration', migration, direction);

            migration[direction](function (err) {
                next(err, migrationsForDirection.shift());
            });
        }
    }

    next(null, migrationsForDirection.shift());
}

function getMigrationsFor(migrationSet, direction, migrationName) {
    var migrationsFnsForDirection,
        migrationPos = migrationPosition();

    function migrationPosition() {
        var migrationPos;

        if (!migrationName) {
            migrationPos = direction == 'up'
                ? migrationSet.migrations.length
                : 0;

        } else if ((migrationPos = positionOfMigration(migrationSet.migrations, migrationName)) == -1) {
            logger.error("Could not find migration: " + migrationName);
            process.exit(1);
        }

        return migrationPos;
    }

    switch (direction) {
        case 'up':
            migrationsFnsForDirection = migrationSet.migrations.slice(migrationSet.pos, migrationPos + 1);
            migrationSet.pos += migrationsFnsForDirection.length;
            break;
        case 'down':
            migrationsFnsForDirection = migrationSet.migrations.slice(migrationPos, migrationSet.pos).reverse();
            migrationSet.pos -= migrationsFnsForDirection.length;
            break;
    }

    return migrationsFnsForDirection;
}

function save(migrationSet) {
    var json = JSON.stringify(migrationSet);

    fs.writeFile(migrationSet.path, json, function (err) {
        if (err) {
            logger.error(err);
        } else {
            migrationSet.emit('save');
        }
    });
}

module.exports = fileMigrationStrategy;