var url = require('url');
var http = require('http');
var request = require("request");
var util = require('util');
var ubiworx = require('./ubiworx');
var htmlhelp = require('./htmlhelp');

// ==============================
//
//    SOSA / SSN methods
//
// ==============================

function prefix (html)
{
    return (htmlhelp.prefix (html, '', 'https://w3id.org/sosa#>')+
            htmlhelp.prefix (html, 'om', 'http://www.wurvoc.org/vocabularies/om-1.8/')+
            htmlhelp.prefix (html, 'owl', 'http://www.w3.org/2002/07/owl#')+
            htmlhelp.prefix (html, 'foaf', 'http://xmlns.com/foaf/0.1/')+
            htmlhelp.prefix (html, 'geo', 'http://www.w3.org/2003/01/geo/wgs84_pos#')+
            htmlhelp.prefix (html, 'rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')+
            htmlhelp.prefix (html, 'rdfs', 'http://www.w3.org/2000/01/rdf-schema#')+
            htmlhelp.prefix (html, 'saref', 'https://w3id.org/saref#')+
            htmlhelp.prefix (html, 'schema', 'http://schema.org/')+
            htmlhelp.prefix (html, 'dcterms', 'http://purl.org/dc/terms/')+
            htmlhelp.prefix (html, 'time', 'http://www.w3.org/2006/time#')+
            htmlhelp.prefix (html, 'xsd', 'http://www.w3.org/2001/XMLSchema#')+
            htmlhelp.prefix (html, 'ldal', 'http://www.burkley.net/LDAL/SOSA/')+
            '\n');
}

function observation (res, html, uuidSensor, tsBegin, tsEnd)
{
    ubiworx.queryDataSingle (uuidSensor, tsBegin, tsEnd, function (data)
    {
        if (data == null)
        {
            htmlhelp.respond404 (res, html);
            res.end(null);
        }
        else
        {
            htmlhelp.respond200 (res, html);

            if (html)
                res.write ("<body><html><pre>");

            res.write(prefix(html) +
                    htmlhelp.link (html, 
                        'ldal:observation/'+uuidSensor+'/'+tsBegin+'/'+tsEnd,
                        '/LDAL/SOSA/observation/'+uuidSensor+'/'+tsBegin+'/'+tsEnd)+'\n'+
                '  sosa:observedProperty '+
                    htmlhelp.link (html, 
                        'ldal:property/'+uuidSensor,
                        '/LDAL/SOSA/property/'+uuidSensor)+' ;\n'+
                '  sosa:madeBySensor '+
                    htmlhelp.link (html, 
                        'ldal:sensor/'+uuidSensor,
                        '/LDAL/SOSA/sensor/'+uuidSensor)+' ;\n'+
                '  sosa:hasFeatureOfInterest '+
                    htmlhelp.link (html, 
                        'ldal:sample/'+uuidSensor,
                        '/LDAL/SOSA/sample/'+uuidSensor)+' ;\n'+
                '  sosa:phenomenonTime [\n'+
                '      rdf:type time:Interval ;\n'+
                '      time:hasBeginning [\n'+
                '          rdf:type time:Instant ;\n'+
                '          time:inXSDDateTimeStamp "'+tsBegin+'"^^xsd:datetime\n'+
                '          ] ;\n'+
                '      time:hasEnd [\n'+
                '          rdf:type time:Instant ;\n'+
                '          time:inXSDDateTimeStamp "'+tsEnd+'"^^xsd:datetime\n'+
                '          ] ;\n'+
                '      ] ;\n'+
                '  sosa:resultTime '+data[0].time+'"^^xsd:datetime ;\n'+
                '  sosa:hasSimpleResultValue "'+data[0].val+'"^^xsd:string .\n');

            if (html)
                res.write ("</pre></html></body>");

            res.end();
        }
    })
}

function featureOfInterest (res, html, uuidSensor)
{
    ubiworx.querySensor (uuidSensor, function (sensor)
    {
        if (sensor == null)
        {
            res.writeHead(404, {'Content-Type': 'text/turtle'});
            res.end(null);
        }
        else
        {
            htmlhelp.respond200 (res, html);

            if (html)
                res.write ("<body><html><pre>");

            res.write (prefix(html) +
                'ldal:sample/'+uuidSensor+'\n'+
                '  a sosa:FeatureOfInterest ;\n'+
                '  rdfs:label <'+sensor.name+'> ;\n'+
                '  sosa:hasProperty <ubiworx-sensor> .\n');

            if (html)
                res.write ("</pre></html></body>");

            res.end();
        }
    })
}

// function sosaResult (uuidSensor)

function observableProperty (res, html, uuidSensor)
{
    ubiworx.querySensor (uuidSensor, function (sensor)
    {
        if (sensor == null)
        {
            html.respond404 (res);
            res.end(null);
        }
        else
        {
            htmlhelp.respond200 (res, html);

            if (html)
                res.write ("<body><html><pre>");

            res.write (prefix(html) +
                'ldal:observableProperty/'+uuidSensor+'\n'+
                '  a sosa:ObservableProperty ;\n'+
                '  rdfs:label <'+sensor.name+'> ;\n'+
                '  sosa:isObservedBy '+
                    htmlhelp.link (html, 
                        'ldal:sensor/'+uuidSensor,
                        '/LDAL/SOSA/sensor/'+uuidSensor)+' .\n');

            if (html)
                res.write ("</pre></html></body>");

            res.end(text);
        }
    })
}

function sensor (res, html, uuidSensor)
{
ubiworx.querySensor (uuidSensor, function (sensor)
{
if (sensor == null)
{
    res.writeHead(404, {'Content-Type': 'text/turtle'});
    res.end(null);
}
else
{
    var text=
        prefix() +
        'ldal:sensor/'+uuidSensor+'\n'+
                '  a sosa:Sensor ;\n'+
                '  rdfs:label <'+sensor.name+'> ;\n'+
                '  sosa:observes <observableProperty/'+sensor.node+'> ;\n'+
                '  sosa:madeObservation <observation/'+uuidSensor+
                    '/20200101T000000> .\n';

            res.writeHead(200, {'Content-Type': 'text/turtle'});
            res.end(text);
        }
    })
}

function platform (res, html, uuidGateway)
{
    ubiworx.queryGateway (uuidGateway, function (gw)
    {
        // console.log ("gw="+gw);

        if (gw == null)
        {
            res.writeHead(404, {'Content-Type': 'text/turtle'});
            res.end(null);
        }
        else
        {
            var sens = gw.sensors;
            // console.log("#sens="+sens.length);
            var text=
                prefix() +
                'ldal:platform/'+uuidGateway+'\n'+
                '  a sosa:Platform ;\n'+
                '  rdfs:label <'+gw.name+'> ;\n'+
                '  rdfs:comment <'+gw.name+'>';

            for (var i = 0; i < gw.sensors.length; i++)
                text = text + ' ;\n  sosa:hosts <sensor/'+gw.sensors[i]+'>';

            text = text + ' .\n';

            res.writeHead(200, {'Content-Type': 'text/turtle'});
            res.end(text);
        }
    })
}

function execute (response, html, property, uuid, tsBegin, tsEnd)
{
    switch (property)
    {
    /*  Implement some non SOSA endpoints for testing and human interactions */
    case "list":
        listSensors (response, html, uuid);
        break;
    case "dummy":
        dummy (response, uuid, tsBegin, tsEnd);
        break;

    /*  Implement the SAREF class endpoints */
    case "sensor":
        sensor (response, html, uuid, tsBegin, tsEnd);
        break;
    case "platform":
        platform (response, html, uuid);
        break;
    case "observableProperty":
        observableProperty (response, html, uuid);
        break;
    case "featureOfInterest":
        featureOfInteresponset (response, html, uuid);
        break;
    case "observation":
        observation (response, html, uuid, tsBegin, tsEnd);
        break;
    default:
        console.log("Didn't expect property = "+property);
        htmlhelp.respond404 (response, html);
        response.end(null);
        break;
    }
}

module.exports.execute = execute;

