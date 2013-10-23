#!/usr/bin/env node

/**
 * Module dependencies.
 */

var migrate = require('../lib/migrate'),
    log = require('../lib/logger'),
    join = require('path').join,
    fs = require('fs'),
    program = require('commander');

var args = process.argv.slice(2);
var options = { args: [] };
var currentWorkingDirectory = process.cwd();

// require an argument

function required() {
    if (args.length) return args.shift();
    abort(arg + ' requires an argument');
}

// abort with a message

function abort(msg) {
    console.error('  %s', msg);
    process.exit(1);
}

// parse arguments

var arg;
while (args.length) {
    arg = args.shift();
    switch (arg) {
        case '-h':
        case '--help':
        case 'help':
            console.log(usage);
            process.exit();
            break;
        case '-c':
        case '--chdir':
            process.chdir(currentWorkingDirectory = required());
            break;
        default:
            if (options.command) {
                options.args.push(arg);
            } else {
                options.command = arg;
            }
    }
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

/**
 * Slugify the given `str`.
 */

function slugify(str) {
    return str.replace(/\s+/g, '-');
}

// create ./migrations

try {
    fs.mkdirSync('migrations', 0774);
} catch (err) {
    // ignore
}

// commands

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
    },

    /**
     * create [title]
     */

    create: function () {
        var migrations = fs.readdirSync('migrations').filter(function (file) {
            return file.match(/^\d+/);
        }).map(function (file) {
                return parseInt(file.match(/^(\d+)/)[1], 10);
            }).sort(function (a, b) {
                return a - b;
            });

        var curr = pad((migrations.pop() || 0) + 1)
            , title = slugify([].slice.call(arguments).join(' '));
        title = title ? curr + '-' + title : curr;
        create(title);
    }
};

/**
 * Pad the given number.
 *
 * @param {Number} n
 * @return {String}
 */

function pad(n) {
    return Array(4 - n.toString().length).join('0') + n;
}

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
