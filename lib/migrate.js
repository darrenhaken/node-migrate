/*!
 * migrate
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var Migration = require('./model/migration'),
    MigrationSet = require('./model/migrationSet');

function migrate(title, up, down) {

    if(up && down) {
        migrationSet.migrations.push(new Migration(title, up, down));
    }

    return migrationSet;
}

//    // migration
//    if ('string' == typeof title && up && down) {
//        migrate.set.migrations.push(new Migration(title, up, down));
//
//        // specify migration file
//    } else if ('string' == typeof title) {
//        migrate.set = new MigrationSet(title);
//        // no migration path
//    } else if (!migrate.set) {
//        throw new Error('must invoke migrate(path) before running migrations');
//        // run migrations
//    } else {
//        return migrate.set;
//    }

module.exports = migrate;