var fs = require('fs'),
    logger = require('../logger');


var fileMigrationStrategy = {

    migrate: function (migrationSet) {

        fs.readFile(migrationSet.path, 'utf8', function (err, migrationHistoryJson) {

            function processMigration() {
                //Assign position of where migrations processed up to last time.
                if (migrationHistoryJson) {
                    migrationSet.pos = JSON.parse(migrationHistoryJson).pos;
                }

                migrate(migrationSet);
            }

            if (hasErrorAndNotFileNotFoundError(err)) {
                logger.error('Could not load migration history, error: ' + err);
            }
            else {
                processMigration();
            }
        });
    }
}

function hasErrorAndNotFileNotFoundError(err) {
    return err && err.code != 'ENOENT';
}

/**
 * Perform migration.
 *
 * @api private
 */
function migrate(migrationSet) {
    migrationSet.migrationsToRun = getMigrationsFor(migrationSet);

    function next(errFromPreviousMigration, migration) {
        if (errFromPreviousMigration) {
            return fn(errFromPreviousMigration);
        }

        // done - no more migrations
        if (!migration) {
            migrationSet.emit('complete');
            save(migrationSet);

        } else {
            migrationSet.emit('migration', migration, migrationSet.direction);

            migration[migrationSet.direction](function (err) {
                next(err, migrationSet.migrationsToRun.shift());
            });
        }
    }

    next(null, migrationSet.migrationsToRun.shift());
}

function getMigrationsFor(migrationSet) {
    var migrationsFnsForDirection,
        migrationPos = migrationPosition(migrationSet);

    switch (migrationSet.direction) {
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

/**
 * Get index of given migration in list of migrations
 *
 * @api private
 */
function positionOfMigration(migrations, migration) {
    var numberMigrations = migrations.length;
    var migrationPosition = -1;

    for (var migrationIndex = 0; migrationIndex < numberMigrations; migrationIndex++) {

        if (migrations[migrationIndex].title == migration) {
            migrationPosition = migrationIndex;
        }
    }
    return migrationPosition;
}

function migrationPosition(migrationSet) {
    var migrationPos;

    if (!migrationSet.startingMigration) {
        migrationPos = migrationSet.direction == 'up'
            ? migrationSet.migrations.length
            : 0;
    } else {
        migrationPos = positionOfMigration(migrationSet.migrations, migrationName);
    }

    if(migrationPos == -1) {
        logger.error("Could not find migration: " + migrationName);
        process.exit(1);
    }

    return migrationPos;
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