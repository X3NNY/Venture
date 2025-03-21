'use strict';

var screepsApi = require('screeps-api');
var fs = require('fs');
var git = require('git-rev-sync');
var path = require('path');

function generateSourceMaps(bundle) {
    // Iterate through bundle and test if type===chunk && map is defined
    let itemName;
    for (itemName in bundle) {
        let item = bundle[itemName];
        if (item.type === "chunk" && item.map) {
            // Tweak maps
            let tmp = item.map.toString;
            delete item.map.sourcesContent;
            item.map.toString = function () {
                return "module.exports = " + tmp.apply(this, arguments) + ";";
            };
        }
    }
}
function writeSourceMaps(options) {
    fs.renameSync(options.file + '.map', options.file + '.map.js');
}
function validateConfig(cfg) {
    if (cfg.hostname && cfg.hostname === 'screeps.com') {
        return [
            typeof cfg.token === "string",
            cfg.protocol === "http" || cfg.protocol === "https",
            typeof cfg.hostname === "string",
            typeof cfg.port === "number",
            typeof cfg.path === "string",
            typeof cfg.branch === "string"
        ].reduce((a, b) => a && b);
    }
    return [
        (typeof cfg.email === 'string' && typeof cfg.password === 'string') || typeof cfg.token === 'string',
        cfg.protocol === "http" || cfg.protocol === "https",
        typeof cfg.hostname === "string",
        typeof cfg.port === "number",
        typeof cfg.path === "string",
        typeof cfg.branch === "string"
    ].reduce((a, b) => a && b);
}
function loadConfigFile(configFile) {
    let data = fs.readFileSync(configFile, 'utf8');
    let cfg = JSON.parse(data);
    if (!validateConfig(cfg))
        throw new TypeError("Invalid config");
    if (cfg.email && cfg.password && !cfg.token && cfg.hostname === 'screeps.com') {
        console.log('Please change your email/password to a token');
    }
    return cfg;
}
function uploadSource(config, options, bundle) {
    if (!config) {
        console.log('screeps() needs a config e.g. screeps({configFile: \'./screeps.json\'}) or screeps({config: { ... }})');
    }
    else {
        if (typeof config === "string")
            config = loadConfigFile(config);
        let code = getFileList(options.file);
        let branch = getBranchName(config.branch);
        let api = new screepsApi.ScreepsAPI(config);
        if (!config.token) {
            api.auth().then(() => {
                runUpload(api, branch, code);
            });
        }
        else {
            runUpload(api, branch, code);
        }
    }
}
function runUpload(api, branch, code) {
    api.raw.user.branches().then((data) => {
        let branches = data.list.map((b) => b.branch);
        if (branches.includes(branch)) {
            api.code.set(branch, code);
        }
        else {
            api.raw.user.cloneBranch('', branch, code);
        }
    });
}
function getFileList(outputFile) {
    let code = {};
    let base = path.dirname(outputFile);
    let files = fs.readdirSync(base).filter((f) => path.extname(f) === '.js' || path.extname(f) === '.wasm');
    files.map((file) => {
        if (file.endsWith('.js')) {
            code[file.replace(/\.js$/i, '')] = fs.readFileSync(path.join(base, file), 'utf8');
        }
        else {
            code[file.replace(/\.wasm$/i, '')] = {
                binary: fs.readFileSync(path.join(base, file)).toString('base64')
            };
        }
    });
    return code;
}
function getBranchName(branch) {
    if (branch === 'auto') {
        return git.branch();
    }
    else {
        return branch;
    }
}
function screeps(screepsOptions = {}) {
    return {
        name: "screeps",
        generateBundle(options, bundle, isWrite) {
            if (options.sourcemap)
                generateSourceMaps(bundle);
        },
        writeBundle(options, bundle) {
            if (options.sourcemap)
                writeSourceMaps(options);
            if (!screepsOptions.dryRun) {
                uploadSource((screepsOptions.configFile || screepsOptions.config), options);
            }
        }
    };
}

export default screeps;
