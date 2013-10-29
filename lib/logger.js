
var log = {
    log: function(key, msg) {
        console.log('  \033[90m%s :\033[0m \033[36m%s\033[0m', key, msg);
    },

    error: function(msg) {
        console.error(msg);
    }
}

module.exports = log;