/**
 * @type {import("tsdserver").Options}
 */
module.exports = {
    directories: [".", "./dist", "./src" ],
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
};
