const odbc = require('odbc');

const SQL_CONN_STR = process.env['SQL_CONN_STR'];

module.exports = async function (context, req) {
    const conn = await odbc.connect(SQL_CONN_STR);
    const query = 'SELECT * FROM hero WHERE id=?';

    if (req.query.id) {
        const results = await doQuery(conn, query, [ req.query.id ]);
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

function doQuery(conn, query, params) {
    return new Promise((resolve, reject) => {
        conn.query(query, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}
