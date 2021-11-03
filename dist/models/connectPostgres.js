"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
function connectPostgress() {
    const client = new pg_1.Client();
    client.connect();
    const pool = new pg_1.Pool();
    //pool.query('SELECT NOW()').then(x => console.log(x)).catch(err => console.log(err))
    pool.query('SELECT NOW()', (err, res) => {
        console.log(res);
        pool.end();
    });
}
exports.default = connectPostgress;