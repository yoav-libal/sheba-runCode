// Module preloader - ensures pkg includes all required modules
// This file contains explicit require statements that pkg can analyze

// Required modules for pkg static analysis
const mssql = require('mssql');
const moment = require('moment');
const yargs = require('yargs');
const fsExtra = require('fs-extra');
const xlsx = require('xlsx');
const xlsxCalc = require('xlsx-calc');
const pdf2json = require('pdf2json');
const nodemailer = require('nodemailer');
const childProcess = require('child_process');
const lodash = require('lodash');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const util = require('util');
const url = require('url');
const querystring = require('querystring');
const buffer = require('buffer');
const stream = require('stream');
const events = require('events');

// Export all modules for easy access
module.exports = {
    mssql,
    moment,
    yargs,
    fsExtra,
    xlsx,
    xlsxCalc,
    pdf2json,
    nodemailer,
    childProcess,
    lodash,
    path,
    os,
    crypto,
    util,
    url,
    querystring,
    buffer,
    stream,
    events
};