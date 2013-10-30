var EventEmitter = require('events').EventEmitter,
    migrationStrategy = require('../migrationStrategies/fileMigrationStrategy');

/**
 * Initialize a new migration set with the given migration path.
 * which is used to store data between migrations.
 *
 * @param {String} migrationsPath
 * @param {String} migrationDirection
 * @param {String} startingMigration
 * @api private
 */
function MigrationSet(migrationsPath, migrationDirection, startingMigration) {
    this.migrations = [];
    this.path = migrationsPath;
    this.pos = 0;
    this.direction =  migrationDirection ? migrationDirection : 'up';
    this.startingMigration = startingMigration ? startingMigration : null;
    this.migrationsToRun = [];
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
MigrationSet.prototype.addMigration = function (migration) {
    if (!migration.migrationName && !migration.up && !migration.down) {
        throw Error('Cannot add migration, missing migration name or migration does not have up/down functions');
    }

    this.migrations.push(migration);
};

/**
 * Run down migrations and call `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */
MigrationSet.prototype.down = function ( migrationName) {
    this.migrate('down', migrationName);
};

/**
 * Run up migrations
 *
 * @param {Function} fn
 * @api public
 */
MigrationSet.prototype.up = function (migrationName) {
    this.migrate('up', migrationName);
};

/**
 * Migrate in the given `direction`, calling `fn(err)`.
 *
 * @param {String} direction
 * @param {Function} migrationFunction
 * @api public
 */
MigrationSet.prototype.migrate = function (direction, migrationName) {
    this.emit('load');
    migrationStrategy.migrate(this, direction, migrationName);
};

module.exports.migrationSet = MigrationSet;
