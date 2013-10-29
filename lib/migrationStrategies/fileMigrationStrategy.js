var fs = require('fs'),
    logger = require('../logger');

var fileMigrationStrategy = function (migrationSet, direction, migrationName) {

    fs.readFile(migrationSet.path, 'utf8', function (err, json) {
        var migrationFunction = function () {},
            migrationSetFromFile;

        if (err && err.code != 'ENOENT') {
            logger.error(err);
            return err;
        }

        if (json) {
            migrationSetFromFile = JSON.parse(json);
            migrationSet.pos = migrationSetFromFile.pos;
        }

        migrate(migrationSet, direction, migrationFunction, migrationName);
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

    for (var migrationIndex = 0; migrationIndex < numberMigrations; ++migrationIndex) {

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
    var self = migrationSet,
        migrations,
        migrationPos;

    if (!migrationName) {
        migrationPos = direction == 'up' ? self.migrations.length : 0;
    } else if ((migrationPos = positionOfMigration(self.migrations, migrationName)) == -1) {
        logger.error("Could not find migration: " + migrationName);
        process.exit(1);
    }

    switch (direction) {
        case 'up':
            migrations = self.migrations.slice(self.pos, migrationPos + 1);
            self.pos += migrations.length;
            break;
        case 'down':
            migrations = self.migrations.slice(migrationPos, self.pos).reverse();
            self.pos -= migrations.length;
            break;
    }

    function save() {
        var json = JSON.stringify(self);

        fs.writeFile(self.path, json, function (err) {

            if (err) {
                logger.error(err);
            }
            else {
                self.emit('save');
            }
        });
    }

    function next(errFromPreviousMigration, migration) {
        if (errFromPreviousMigration) {
            return fn(errFromPreviousMigration);
        }

        // done
        if (!migration) {
            self.emit('complete');
            save();

        } else {
            self.emit('migration', migration, direction);

            migration[direction](function (err) {
                next(err, migrations.shift());
            });
        }
    }

    next(null, migrations.shift());
};

module.exports = fileMigrationStrategy;