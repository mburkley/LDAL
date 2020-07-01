// ==============================
//  Copyright 2020 Mark Burkley
//  
//  Permission is hereby granted, free of charge, to any person obtaining a copy of
//  this software and associated documentation files (the "Software"), to deal in
//  the Software without restriction, including without limitation the rights to
//  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
//  the Software, and to permit persons to whom the Software is furnished to do so,
//  subject to the following conditions:
//  
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//  
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
//  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
//  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
//  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
//  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// ==============================
//
//  This module implements wrappers for the ubiworx IoT API.  It uses HTTP and
//  websocket requests to request static and streaming data.
//
// ==============================

var request = require("request");
var websocket = require("websocket");
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

    console.log("Requesting ... "+ux_url);

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
function queryWS (urlParam, uuidArray, callback)
{
    var ux_url="wss://"+config.url+urlParam+
                encodeURIComponent(JSON.stringify(uuidArray));
    console.log('url='+ux_url);
    var client = new websocket.client(); // ux_url);

    client.on ('connect', function (connection)
    {
        console.log ('WS connected');
        connection.on('error', function(error)
        {
            console.log("WS error: " + error.toString());
        });
        connection.on('close', function()
        {
            console.log('WS server closed connection');
        });
        connection.on('message', function(message)
        {
            console.log('received message of type '+ message.type);
            callback (message);
            // === 'utf8') {
            // console.log("Received: '" + message.utf8Data + "'");
        });
    });

    var up=config.user+':'+config.pass;
    console.log("up='"+up+", type="+up.type);
    var auth= Buffer.from(up,'utf8').toString('base64');
    console.log('auth='+auth);
    client.connect (ux_url, null, null,
        {
            'Authorization': 'Basic '+
                Buffer.from(config.user+':'+config.pass,'utf8').toString('base64')
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

function queryDataMultipleFilter (uuid, tsbegin, tsend, filter, callback)
{
    var ux_url="sensors/"+uuid+"/data?start="+tsbegin+
               "&end="+tsend;

    if (filter)
        ux_url += "&filter="+filter+"&limit=1";

    queryAPI (ux_url, callback);
}

function queryDataMultiple (uuid, tsbegin, tsend, callback)
{
    queryDataMultipleFilter (uuid, tsbegin, tsend, null, callback);
}

module.exports.queryDataMultiple = queryDataMultiple;

function queryDataAverage (uuid, tsbegin, tsend, callback)
{
    queryDataMultipleFilter (uuid, tsbegin, tsend, "average", callback);
}

module.exports.queryDataAverage = queryDataAverage;

function queryDataSum (uuid, tsbegin, tsend, callback)
{
    queryDataMultipleFilter (uuid, tsbegin, tsend, "sum", callback);
}

module.exports.queryDataSum = queryDataSum;

function queryDataDelta (uuid, tsbegin, tsend, callback)
{
    queryDataMultipleFilter (uuid, tsbegin, tsend, "delta", callback);
}

module.exports.queryDataDelta = queryDataDelta;

function queryDataStream (uuid, callback)
{
    var uuidArray = [uuid];
    var ux_url="stream?sensors=";
    queryWS (ux_url, uuidArray, callback);
}

module.exports.queryDataStream = queryDataStream;


