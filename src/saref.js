var url = require('url');
var http = require('http');
var request = require("request");
var util = require('util');
var ubiworx = require('./ubiworx');
var htmlhelp = require('./htmlhelp');

// ==============================
//
//    SAREF methods
//
// ==============================

/*  Create prefixes specific to SAREF
 */
function prefix (html)
{
    return (htmlhelp.prefix (html, '', 'https://w3id.org/saref#')+
            htmlhelp.prefix (html, 'om', 'http://www.wurvoc.org/vocabularies/om-1.8/')+
            htmlhelp.prefix (html, 'owl', 'http://www.w3.org/2002/07/owl#')+
            htmlhelp.prefix (html, 'foaf', 'http://xmlns.com/foaf/0.1/')+
            htmlhelp.prefix (html, 'geo', 'http://www.w3.org/2003/01/geo/wgs84_pos#')+
            htmlhelp.prefix (html, 'rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#)')+
            htmlhelp.prefix (html, 'rdfs', 'http://www.w3.org/2000/01/rdf-schema#')+
            htmlhelp.prefix (html, 'saref', 'https://w3id.org/saref#')+
            htmlhelp.prefix (html, 'schema', 'http://schema.org/')+
            htmlhelp.prefix (html, 'dcterms', 'http://purl.org/dc/terms/')+
            htmlhelp.prefix (html, 'time', 'http://www.w3.org/2006/time#')+
            htmlhelp.prefix (html, 'xsd', 'http://www.w3.org/2001/XMLSchema#')+
            htmlhelp.prefix (html, 'saref', 'http://www.burkley.net/LDAL/SAREF/')+
            '\n');
}

/*
 *  A dummy class that returns a fixed response without querying the ubiworx
 *  server.  This is used for benchmarking without incurring any time penalties
 *  for depending on external servers.
 */
function dummy (res, html, uuidSensor)
{
    var text=
        prefix(html) +
        'ldal:dummy\n'+
        '  saref:consistsOf saref:Device ;\n'+
        '  saref:measuresProperty ldal:property-'+uuidSensor+' ;\n'+
        '  saref:hasProfile ldal:profile-'+uuidSensor+' ;\n'+
        '  saref:makesMeasurement ldal:measurement-'+uuidSensor+' ;\n'+
        '  saref:hasDescription "description"^^xsd:string ;\n'+
        '  saref:hasManufacturer "manufacturer"^^xsd:string ;\n'+
        '  saref:hasModel "model"^^xsd:string ;\n';

    htmlhelp.respond200 (res, html);
    res.end(text);
}

/*  Instantiate a device class.  A device is a sensor in the API.  We also fetch
 *  the parent node of the sensor to provide additional metadata such as
 *  manufacturer and model.
 */
function device (res, html, uuidSensor, noHeaders)
{
    ubiworx.querySensor (uuidSensor, function (sensor)
    {
        if (sensor == null)
        {
            htmlhelp.respond404 (res, html);
            res.end(null);
        }
        else
        {
            ubiworx.queryNode (sensor.node, function (node)
            {
                if (node == null)
                {
                    html.respond404 (res);
                    res.end(null);
                }
                else
                {
                    console.log("output device");
                    console.log ("html="+html);

                    htmlhelp.respond200 (res, html);

                    if (html)
                        res.write ("<body><html><pre>");

                    res.write (prefix(html));
                    res.write ('ldal:device-'+sensor.node+'\n'+
                        '  saref:consistsOf saref:Device ;\n'+
                        '  saref:measuresProperty '+
                            htmlhelp.link (html, 'ldal:property-'+uuidSensor,
                                    '/SAREF/property/'+uuidSensor)+' ;\n'+
                        '  saref:hasProfile '+
                            htmlhelp.link (html, 'ldal:profile-'+uuidSensor,
                                    '/SAREF/profile/'+uuidSensor)+' ;\n'+
                        '  saref:makesMeasurement '+
                            htmlhelp.link (html, 'ldal:measurement-'+uuidSensor,
                                     '/SAREF/measurement/'+uuidSensor)+' ;\n'+
                        '  saref:hasDescription "'+sensor.name+'"^^xsd:string ;\n'+
                        '  saref:hasManufacturer "'+node.hwid+'"^^xsd:string ;\n'+
                        '  saref:hasModel "'+node.name+'"^^xsd:string ;\n');

                    if (html)
                        res.write ("</pre></html></body>");

                    console.log ("ending");
                    res.end();
                }
            })
        }
    })
}

function profile (res, html, uuid, tsBegin, tsEnd)
{
    ubiworx.querySensor (uuid, function (node)
    {
        if (node == null)
        {
            htmlhelp.respond404 (res, html);
            res.end(null);
        }
        else
        {
            htmlhelp.respond200 (res, html);

            if (html)
                res.write ("<body><html><pre>");

            res.write (
                prefix(html) +
                'ldal:profile-'+uuid+' ;\n'+
                '  rdf:type saref:Profile ;\n'+
                '  saref:hasPrice '+
                    htmlhelp.link (html, 'ldal:device-'+uuid,
                             '/SAREF/device/'+uuid)+' ;\n'+
                '  saref:hasTime '+
                    htmlhelp.link (html, 'ldal:measurement-'+uuid,
                             '/SAREF/measurement/'+uuid)+' ;\n'+
                '  saref:isAbout '+
                    htmlhelp.link (html, 'ldal:property-'+uuid,
                             '/SAREF/property/'+uuid)+' ;\n');

            if (html)
                res.write ("</pre></html></body>");

            res.end();
        }
    })
}

function property (res, html, uuid)
{
    ubiworx.querySensor (uuid, function (node)
    {
        if (node == null)
        {
            htmlhelp.respond404 (res, html);
            res.end(null);
        }
        else
        {
            htmlhelp.respond200 (res, html);
            if (html)
                res.write ("<body><html><pre>");
            res.write (
                prefix(html) +
                'ldal:device-'+uuid+' ;\n'+
                '  saref:isMeasuredByDevice '+
                    htmlhelp.link (html, 'ldal:device-'+uuid,
                             '/SAREF/device/'+uuid)+' ;\n'+
                '  saref:relatesToMeasurement '+
                    htmlhelp.link (html, 'ldal:measurement-'+uuid,
                             '/SAREF/measurement/'+uuid)+' ;\n');

            if (html)
                res.write ("</pre></html></body>");

            res.end();
        }
    })
}

function measurement (res, html, uuidSensor, tsBegin, tsEnd)
{
    ubiworx.querySensor (uuidSensor, function (sensor)
    {
        if (sensor == null)
        {
            htmlhelp.respond404 (res, html);
            res.end(null);
        }
        else
        {
            ubiworx.queryDataMultiple (uuidSensor, tsBegin, tsEnd, function (data)
            {
                if (data == null)
                {
                    htmlhelp.respond404 (res, html);
                    res.end();
                }
                else
                {
                    htmlhelp.respond200 (res, html);
                    if (html)
                        res.write ("<body><html><pre>");
                    res.write (prefix(html));

                    for (var i = 0; i < data.length; i++)
                    {
                        res.write (
                            'ldal:measurement-'+uuidSensor+'-'+data[i].time+'\n'+
                            '  saref:isMeasuredIn om:'+sensor.units+' ;\n'+
                            '  saref:relatesToProperty '+
                                htmlhelp.link (html,
                                'ldal:property-'+uuidSensor,
                                '/SAREF/device/'+uuidSensor)+' ;\n'+
                            '  saref:hasTimeStamp "'+data[i].time+'"^^xsd:datetime ;\n'+
                            '  saref:hasValue "'+data[i].val+'"^^xsd:string .\n\n');
                    }

                    if (html)
                        res.write ("</pre></html></body>");

                    res.end();
                }
            })
        }
    })
}

function microRenewable (res, uuidSensor, tsBegin, tsEnd)
{
    htmlhelp.respond200 (res, html);
    res.write (prefix());
    res.write ('saref:accomplishes saref:EnergyEfficiency ;\n');
    res.end();
}

function meteringFunction (res, uuidSensor, tsBegin, tsEnd)
{
    htmlhelp.respond200 (res, html);
    res.write (prefix()+
        'rdf:type saref:MeteringFunction ;\n'+
        'hasCommand: saref:GetCurrentMeterValueCommand ;\n'+
        'hasMeterReading: saref:Measurement ;\n'+
        'hasMeterReadingType: saref:Property ;\n'+
        'rdfs:label \"Metering Function X\"^^xsd:string ;\n');
    res.end();
}

function powerUnit (res, uuidSensor, tsBegin, tsEnd)
{
    htmlhelp.respond200 (res, html);
    res.write (prefix()+
        'rdf:type saref:PowerUnit ;\n'+
        'rdfs:label "KiloWatt"^^xsd:string ;\n');
    res.end();
}

function meter (res, uuidSensor, tsBegin, tsEnd)
{
    htmlhelp.respond200 (res, html);
    res.write (prefix());
    res.write ('rdf:type saref:Meter ;\n');
    res.write ('saref:hasFunction saref:MeteringFunction ;\n');
    res.end();
}

function listSensors (res, html, uuidGateway)
{
    console.log ("saref gw="+uuidGateway);
    ubiworx.queryGateway (uuidGateway, function (gateway)
    {
        if (gateway == null)
        {
            htmlhelp.respond404 (res, html);
            res.end(null);
        }
        else
        {
            htmlhelp.respond200 (res, html);
            res.write ("<body><ul>");
            console.log("res="+util.inspect(gateway));
            for (var i = 0; i < gateway.sensors.length; i++)
            {
                res.write ("<li>"+htmlhelp.ref ("/SAREF/device/"+gateway.sensors[i]));
            }
            res.write ("</ul></body>");
            res.end();
        }
    });
}

function execute (response, html, endpoint, uuid, tsBegin, tsEnd)
{
    console.log ("saref prop="+endpoint);

    switch (endpoint)
    {
    /*  Implement some non SAREF endpoints for testing and human interactions */
    case "list":
        listSensors (response, html, uuid);
        break;
    case "dummy":
        dummy (response, uuid, tsBegin, tsEnd);
        break;

    /*  Implement the SAREF class endpoints */
    case "device":
        device (response, html, uuid);
        break;
    case "profile":
        profile (response, html, uuid);
        break;
    case "property":
        property (response, html, uuid);
        break;
    case "measurement":
        measurement (response, html, uuid, tsBegin, tsEnd);
        break;

    default:
        console.log("Didn't expect endpoint = "+endpoint);
        htmlhelp.respond404 (res, html);
        response.end(null);
        break;
    }
}

module.exports.execute = execute;
