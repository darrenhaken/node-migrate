/*!
 * migrate - Set
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var EventEmitter = require('events').EventEmitter,
    fs = require('fs');
    Migration = require('./migration');

module.exports.migrationSet = MigrationSet;

/**
 * Initialize a new migration set with the given `path`
 * which is used to store data between migrations.
 *
 * @param {String} migrationFolder
 * @api private
 */
function MigrationSet(migrationFolder) {
    this.migrations = [];
    this.path = migrationFolder;
    this.pos = 0;
}

/**
 * Inherit from `EventEmitter.prototype`.
 */
MigrationSet.prototype.__proto__ = EventEmitter.prototype;

/**
 * Add a migration to the migration set
 *
 * @param {string} migrationName
 * @param {Function} upFunction
 * @param {Function} downFunction
 * @api public
 */
MigrationSet.prototype.addMigration = function(migration) {
    if(!migration.migrationName && !migration.up && !migration.down) {
        throw Error('Cannot add migration, missing migration name or migration does not have up/down functions');
    }

    this.migrations.push(migration);
};

/**
 * Save the migration data and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */
MigrationSet.prototype.save = function (fn) {
    var self = this,
        json = JSON.stringify(this);

    fs.writeFile(this.path, json, function (err) {
        self.emit('save');

        fn && fn(err);
    });
};

/**
 * Load the migration data and call `fn(err, obj)`.
 *
 * @param {Function} fn
 * @return {Type}
 * @api public
 */
MigrationSet.prototype.load = function (fn) {
    this.emit('load');
    fs.readFile(this.path, 'utf8', function (err, json) {
        if (err) {
            return fn(err);
        }

        try {
            fn(null, JSON.parse(json));
        } catch (err) {
            fn(err);
        }
    });
};

/**
 * Run down migrations and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */
MigrationSet.prototype.down = function (fn, migrationName) {
    this.migrate('down', fn, migrationName);
};

/**
 * Run up migrations and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

MigrationSet.prototype.up = function (fn, migrationName) {
    this.migrate('up', fn, migrationName);
};

/**
 * Migrate in the given `direction`, calling `fn(err)`.
 *
 * @param {String} direction
 * @param {Function} migrationFunction
 * @api public
 */

MigrationSet.prototype.migrate = function (direction, migrationFunction, migrationName) {
    var self = this;
    migrationFunction = migrationFunction || function () {};

    this.load(function (err, obj) {
        if (err) {
            if ('ENOENT' != err.code) {
                return migrationFunction(err);
            }
        } else {
            self.pos = obj.pos;
        }
        self._migrate(direction, migrationFunction, migrationName);
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

MigrationSet.prototype._migrate = function (direction, fn, migrationName) {
    var self = this,
        migrations,
        migrationPos;

    if (!migrationName) {
        migrationPos = direction == 'up' ? this.migrations.length : 0;
    } else if ((migrationPos = positionOfMigration(this.migrations, migrationName)) == -1) {
        console.error("Could not find migration: " + migrationName);
        process.exit(1);
    }

    switch (direction) {
        case 'up':
            migrations = this.migrations.slice(this.pos, migrationPos + 1);
            this.pos += migrations.length;
            break;
        case 'down':
            migrations = this.migrations.slice(migrationPos, this.pos).reverse();
            this.pos -= migrations.length;
            break;
    }

    function next(errFromPreviousMigration, migration) {
        if (errFromPreviousMigration) {
            return fn(errFromPreviousMigration);
        }

        // done
        if (!migration) {
            self.emit('complete');
            self.save(fn);
            return;
        }

        self.emit('migration', migration, direction);

        migration[direction](function (err) {
            next(err, migrations.shift());
        });
    }

    next(null, migrations.shift());
};
