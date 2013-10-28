var Migration = require('../model/migration'),
    fs = require('fs');

var migrationRepository = {
    getMigrations: function(cwdir) {

        return migrations().map(function (migrationFileName) {
            var migrationScript = createMigrationScript(cwdir, migrationFileName);
            return new Migration(migrationFileName, migrationScript.up, migrationScript.down);
        });
    }
}

function createMigrationScript(cwdir, migrationFileName) {
    return require(cwdir + '/migrations/' + migrationFileName);
}

function migrations() {
    var fileGeneratedFromMigrationRegex = /^\d+.*\.js$/;

    var migrationFiles = fs.readdirSync('migrations')
        .filter(function findMigrationFileNames(fileName) {
            return fileName.match(fileGeneratedFromMigrationRegex);
        })
        .sort();

    return migrationFiles;
}

module.exports = migrationRepository;