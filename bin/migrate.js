#!/usr/bin/env node

/**
 * Module dependencies.
 */
var migrate = require('../lib/migrate'),
    log = require('../lib/logger'),
    join = require('path').join,
    fs = require('fs'),
    program = require('commander');

var options = { args: [] };

// abort with a message
function abort(msg) {
    console.error('  %s', msg);
    process.exit(1);
}

/**
 * Load migrations.
 */
function migrations() {
    return fs.readdirSync('migrations').filter(function (file) {
        return file.match(/^\d+.*\.js$/);
    }).sort().map(function (file) {
            return 'migrations/' + file;
        });
}

var commands = {
    /**
     * up [name]
     */
    up: function (migrationName) {
        performMigration('up', migrationName);
    },

    /**
     * down [name]
     */
    down: function (migrationName) {
        performMigration('down', migrationName);
    }
};

/**
 * Perform a migration in the given `direction`.
 *
 * @param {Number} direction
 */

function performMigration(direction, migrationName) {
    migrate('migrations/.migrate');
    migrations().forEach(function (path) {
        var mod = require(process.cwd() + '/' + path);
        migrate(path, mod.up, mod.down);
    });

    var set = migrate();

    set.on('migration', function (migration, direction) {
        log(direction, migration.title);
    });

    set.on('save', function () {
        log('migration', 'complete');
        process.exit();
    });

    var migrationPath = migrationName
        ? join('migrations', migrationName)
        : migrationName;

    set[direction](null, migrationPath);
}

// invoke command

var command = options.command || 'up';
if (!(command in commands)) abort('unknown command "' + command + '"');
command = commands[command];
command.apply(this, options.args);
