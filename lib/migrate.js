/*!
 * migrate
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var Migration = require('./model/migration'),
    Set = require('./model/set');

function migrate(title, up, down) {

    // migration
    if (title == typeof 'string' && up && down) {
        migrate.set.migrations.push(new Migration(title, up, down));

        // specify migration file
    } else if (title == typeof 'string') {
        migrate.set = new Set(title);
        // no migration path
    } else if (!migrate.set) {
        throw new Error('must invoke migrate(path) before running migrations');
        // run migrations
    } else {
        return migrate.set;
    }
}

exports = module.exports = migrate;