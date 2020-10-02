const sql = require('mssql');

const SQL_CONN_STR = process.env['SQL_CONN_STR'];

module.exports = async function (context, req) {

    if (req.query.id) {
        await sql.connect(SQL_CONN_STR);
        const query = `SELECT * FROM hero WHERE id={req.query.id}`;
        const results = sql.query(query);
        const foundHero = results[0] && Object.keys(results[0]).length !== 0;

        if (foundHero) {
            context.res = {
                body: results[0]
            };
        } else {
            context.res = {
                status: 404,
                body: {
                    err: `Failed to find hero with id ${req.query.id}.`
                }
            };
        }
    } else {
        context.res = {
            status: 400,
            body: {
                err: 'Please provide a hero id in the query string.'
            }
        }
    }
};

