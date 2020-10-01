const request = require('request-promise');
const odbc = require('odbc');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

const VAULT_NAME = 'dotadatatest';
const VAULT_URL = `https://${VAULT_NAME}.vault.azure.net`;

const credential = new DefaultAzureCredential();
const client = new SecretClient(VAULT_URL, credential);

const BASE_URL = process.env['STEAMPOWERED_API_BASEURL'];
const ENDPOINT = process.env['STEAMPOWERED_API_ENDPOINT_GET_HEROES'];
const uri = BASE_URL + ENDPOINT;

const SQL_CONN_STR = process.env['SQL_CONN_STR'];

module.exports = async function (context, myTimer) {
    const timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);   

    const key = (await client.getSecret('steampowered')).value;
    const qs = { key };
    const json = true;
    context.log(uri);
    context.log(key);

    const { result } = await request({uri, qs, json});

    const heroesList = result.heroes
        .map(hero => `(${hero.id},'${hero.name}')`)
        .join(', ');

    const conn = await odbc.connect(SQL_CONN_STR);
    const query = `
TRUNCATE TABLE hero;
SET IDENTITY_INSERT hero ON;
INSERT INTO hero (id, name) VALUES ?;
    `; 

    await doQuery(conn, query.replace('?', heroesList));
};

function doQuery(conn, query, params) {
    return new Promise((resolve, reject) => {
        conn.query(query, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

