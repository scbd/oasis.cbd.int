import { format as _format } from 'util';
import { createLogger, transports, format } from 'winston';


const defaultLogLevel         = process.env.LOG_LEVEL || 'debug'

const GLOBAL_LOGGER = createLogger({ 
    level : defaultLogLevel,
    exitOnError: false,
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        })
    ]
});

// ============================================================
//
// ============================================================
export function silly (msg, ...meta) {
    return GLOBAL_LOGGER.silly(formatMessage(msg, ...meta))
}

// ============================================================
//
// ============================================================
export function verbose (msg, ...meta) {
    return GLOBAL_LOGGER.verbose(formatMessage(msg, ...meta))
}

// ============================================================
//
// ============================================================
export function debug (msg, ...meta) {
    return GLOBAL_LOGGER.debug(formatMessage(msg, ...meta))
}

// ============================================================
//
// ============================================================
export function info (msg, ...meta) {
    return GLOBAL_LOGGER.info(formatMessage(msg, ...meta))
}

// ============================================================
//
// ============================================================
export function warn (msg, ...meta) {
    GLOBAL_LOGGER.warn(formatMessage(msg, ...meta))
}

// ============================================================
//
// ============================================================
export function error (msg, ...meta) {
    GLOBAL_LOGGER.error(formatMessage(msg, ...meta))
}

function formatMessage(...params) {

    let error = null;
    let text  = null;

    text   = params.find(e=>typeof(e)=='string');
    error = params.find(e=>e instanceof Error);

    params = params.filter(e=>e!==text)
    params = params.filter(e=>e!==error)

    if(error && !text) text = error.message;

    let parts = [text, ...params].filter(o=>o!==null && o!==undefined);

    parts = parts.map(o=> _format(o));

    if(error) { 
        parts.push(`\n ${_format(error.stack)}`)
    }

    return parts.join(', ');
}

export default Object.freeze({
    silly, 
    verbose, 
    debug,
    info,
    warn,
    error
})