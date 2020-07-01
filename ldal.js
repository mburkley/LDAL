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
//  This is the main LDAL entry point.  It creates a HTTP service that responds
//  to requests for RDF URIs and routes the requests to the appropriate ontology
//  module.
//
// ==============================

var url = require('url');
var http = require('http');
var request = require("request");
var fs = require('fs');
var sosa = require('./sosa');
var saref = require('./saref');
var htmlhelp = require('./htmlhelp');

/*
 *  Read configuration parameters from a JSON file.  This avoids
 *  hard-coding username, password, etc, in the code
 */
var rawdata = fs.readFileSync('config.json');
var config = JSON.parse(rawdata);

function listGateways (res)
{
    var text=
        '<body>'+
        '<ul>'+
        '<li>Environmental Monitoring Gateway'+
            '<ul><li>SAREF '+
                htmlhelp.ref ('/LDAL/SAREF/list/'+config.gw_environ)+
                '</li>'+
            '<li>SOSA/SSN '+
                htmlhelp.ref ('/LDAL/SOSA/list/'+config.gw_environ)+
                '</li>'+
            '</ul></li>'+
        '<li>Solar Energy Gateway'+
            '<ul><li>SAREF '+
                htmlhelp.ref ('/LDAL/SAREF/list/'+config.gw_solar)+
                '</li>'+
            '<li>SOSA/SSN '+
                htmlhelp.ref ('/LDAL/SOSA/list/'+config.gw_solar)+
                '</li>'+
            '</ul></li>'+
        '<li>Machine Monitoring Gateway'+
            '<ul><li>SAREF '+
                htmlhelp.ref ('/LDAL/SAREF/list/'+config.gw_machine)+
                '</li>'+
            '<li>SOSA/SSN '+
                htmlhelp.ref ('/LDAL/SOSA/list/'+config.gw_machine)+
                '</li>'+
            '</ul></li>'+
        '<li>Sample Data'+
            '<ul><li>SAREF '+
                htmlhelp.ref ('/LDAL/SAREF/measurement/'+
                              config.gw_solar+
                              '/2020-05-10T00:00:00/2020-05-20T00:00:00')+
                '</li>'+
            '<li>SOSA '+
                htmlhelp.ref ('/LDAL/SOSA/observation/'+
                              config.gw_solar+
                              '/2020-05-10T00:00:00/2020-05-20T00:00:00')+
                '</li>'+
            '</ul></li>'+
        '</ul></body>';

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(text);
}

http.createServer(function (req, res)
{
    console.log ("url="+req.url);

    /*  Parse the URL and split the pathname into components separated either by
     *  '/' or by '-'.  This if because 'property-uuid' and 'property/uuid' are both
     *  valid ways to address a property.
     *
     *  This is currently disabled since dashes are used in UUIDs.
     */
    var q = url.parse(req.url, true);
    // var s = q.pathname.split(/[\/-]/);
    var s = q.pathname.split('/');

    /*  Parse the accept headers looking for either html or turtle.  If neither
     *  are accepted we report a 404.  If both are accepted we default to turtle.
     */
    console.log ("accept="+req.headers.accept);
    var html = false;
    var turtle = false;

    if (req.headers.accept)
    {
        var accept = req.headers.accept.split(',')

        for (var i = 0; i < accept.length; i++)
        {
            if (accept[i]=="text/html")
                html = true;

            if (accept[i]=="text/turtle")
                turtle = true;
        }
    }

    if (!html && !turtle)
    {
        res.writeHead(404, {'Content-Type': 'text/turtle'});
        res.end(null);
    }

    /*  If both are present, default to turtle
     */
    if (html && turtle)
    {
        html = false;
    }

    switch (s[1])
    {
    case "listgw":
        /*  If no ontology is specified, then instead list the gateways
         *  presented as examples.
         */
        listGateways (res, html);
        break;

    case "SAREF":
        saref.execute (res, html, s[2], s[3], s[4], s[5]);
        break;

    case "SOSA":
        sosa.execute (res, html, s[2], s[3], s[4], s[5]);
        break;

    default:
        console.log("Unknown endpoint= "+s[1]);
        res.writeHead(404, {'Content-Type': 'text/turtle'});
        res.end(null);
        break;
    }
}).listen(8080);

