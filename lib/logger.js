exports = module.exports = log;

/**
 * Log a keyed message.
 */
function log(key, msg) {
    console.log('  \033[90m%s :\033[0m \033[36m%s\033[0m', key, msg);
}