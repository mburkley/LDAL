var request = require("request");
var fs = require('fs');

/*
 *  Read configuration parameters from a JSON file.  This avoids
 *  hard-coding username, password, etc, in the code
 */
var rawdata = fs.readFileSync('config.json');
var config = JSON.parse(rawdata);

/*
 *  Query the ubiworx API.  Builds a request based on the provided URL and
 *  performs the query.  Calls the callback with the returned JSON body or null
 *  if an error occurred.
 */
function queryAPI (urlParam, callback)
{
    var ux_url="https://"+config.user+":"+config.pass+"@"+config.url+urlParam;

    var temp_time;
    var temp_val;

    // console.log("Requesting ... "+ux_url);

    request(
    {
        url: ux_url,
        json: true

    }, function (error, response, body)
    {
        // console.log("query: sta="+response.statusCode);
        if (error || response.statusCode != 200)
            callback (null);
        else
        {
            callback (body.result);
        }
    });
}

function queryGateway (uuid, callback)
{
    var ux_url="gateways/"+uuid;

    queryAPI (ux_url, callback);
}

module.exports.queryGateway = queryGateway;

function querySensor (uuid, callback)
{
    var ux_url="sensors/"+uuid;

    queryAPI (ux_url, callback);
}

module.exports.querySensor = querySensor;

function queryNode (uuid, callback)
{
    var ux_url="nodes/"+uuid;

    queryAPI (ux_url, callback);
}

module.exports.queryNode = queryNode;

function queryInterface (uuid, callback)
{
    var ux_url="interfaces/"+uuid;

    queryAPI (ux_url, callback);
}

module.exports.queryInterface = queryInterface;

function queryDataSingle (uuid, tsbegin, tsend, callback)
{
    var ux_url="sensors/"+uuid+"/data?start="+tsbegin+
               "&end="+tsend+"&filter=average&limit=1";

    queryAPI (ux_url, callback);
}

module.exports.queryDataSingle = queryDataSingle;

function queryDataMultiple (uuid, tsbegin, tsend, callback)
{
    var ux_url="sensors/"+uuid+"/data?start="+tsbegin+
               "&end="+tsend;

    queryAPI (ux_url, callback);
}

function queryDataStream (uuid, tsbegin, tsend, callback)
{
    var ux_url="https://"+config.user+":"+config.pass+"@"+config.url+
               "sensors/"+uuid+"/data?start="+tsbegin+
               "&end="+tsend;

    var temp_time;
    var temp_val;

    // console.log("Requesting ... "+ux_url);

    request(
    {
        url: ux_url,
        json: true

    }, function (error, response, body)
    {
        // console.log("query: sta="+response.statusCode);
        if (error || response.statusCode != 200)
            callback (null);
        else
        {
            callback (body.result);
        }
    });
}

module.exports.queryDataMultiple = queryDataMultiple;

