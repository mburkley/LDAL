var url = require('url');
var http = require('http');
var request = require("request");
var fs = require('fs');
var sosa = require('./sosa');
var saref = require('./saref');
var htmlhelp = require('./htmlhelp');

function listGateways (res)
{
    var text=
        '<body>'+
        '<ul>'+
        '<li>Environmental Monitoring Gateway'+
            '<ul><li>SAREF '+
                htmlhelp.ref ('/SAREF/list/dddaca2b-27df-49c7-98cf-4e4ae09a526d')+
                '</li>'+
            '<li>SOSA/SSN '+
                htmlhelp.ref ('/SOSA/list/dddaca2b-27df-49c7-98cf-4e4ae09a526d')+
                '</li>'+
            '</ul></li>'+
        '<li>Solar Energy Gateway'+
            '<ul><li>SAREF '+
                htmlhelp.ref ('/SAREF/list/1531bee7-530e-4c38-8764-45fb3a13dd32')+
                '</li>'+
            '<li>SOSA/SSN '+
                htmlhelp.ref ('/SOSA/list/1531bee7-530e-4c38-8764-45fb3a13dd32')+
                '</li>'+
            '</ul></li>'+
        '<li>Machine Monitoring Gateway'+
            '<ul><li>SAREF '+
                htmlhelp.ref ('/SAREF/list/797f7f5d-e8e0-416c-9a36-36575ed4f4ce')+
                '</li>'+
            '<li>SOSA/SSN '+
                htmlhelp.ref ('/SOSA/list/797f7f5d-e8e0-416c-9a36-36575ed4f4ce')+
                '</li>'+
            '</ul></li>'+
        '<li>Sample Data'+
            '<ul><li>SAREF '+
                htmlhelp.ref ('/SAREF/measurement/'+
                              'de0a210e-bb2e-44a0-bc81-26af425e8413/'+
                              '2020-05-10T00:00:00/2020-05-20T00:00:00')+
                '</li>'+
            '<li>SOSA '+
                htmlhelp.ref ('/SOSA/observation/'+
                              'de0a210e-bb2e-44a0-bc81-26af425e8413/'+
                              '2020-05-10T00:00:00/2020-05-20T00:00:00')+
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

        /*
        {
            var text=
                prefix() +
            '\n'+
            'saref-temp:SenseTemperature rdf:type saref:Service ;\n'+
            'rdfs:label "Sense temperature"^^xsd:string ;\n'+
            'saref:hasInputParameter saref-temp:Temperature ;\n'+
            'saref:hasOutputParameter saref-temp:Temperature ;\n'+
            '\n'+
            'saref:isOfferedBy saref-temp:TemperatureSensor_TEMP01 ;\n'+
            'saref:represents saref-temp:SensingFunction ;\n'+
            '\n'+
            'saref-temp:SensingFunction\n'+
            'rdf:type saref:SensingFunction ;\n'+
            'rdfs:label "Sensing function"^^xsd:string ;\n'+
            'saref:hasCommand saref-temp:GetSensingDataCommand ;\n'+
            'saref:hasSensorType "Temperature"^^xsd:string ;\n'+
            '\n'+
            'saref-temp:Temperature\n'+
            'rdf:type saref:Temperature ;\n'+
            'rdfs:label "Temperature"^^xsd:string ;\n'+
            // 'saref:hasValue "18.2"^^xsd:string ;\n'+
            // 'saref:hasValue "'+temp_val+'"^^xsd:string ;\n'+
            // 'saref:hasTimestamp "2019-03-31T15:52:21.871725Z"^^xsd:dateTime ;\n'+
            // 'saref:hasTimestamp "'+temp_time+'"^^xsd:dateTime ;\n'+
            '\n'+
            'saref-temp:TemperatureSensor_TEMP01\n'+
            'rdf:type saref:TemperatureSensor ;\n'+
            'rdfs:label "Temperature sensor TEMP01"^^xsd:string ;\n'+
            'saref:IsUsedFor saref-temp:Temperature ;\n'+
            'saref:hasCategory saref:Sensor ;\n'+
            'saref:hasDescription "Temperature sensor TEMP01"^^xsd:string ;\n'+
            'saref:hasFunction saref-temp:SensingFunction ;\n'+
            'saref:hasManufacturer "Oregon Scientific"^^xsd:string ;\n'+
            'saref:hasModel "THGR810"^^xsd:string ;\n'+
            'saref:isLocatedIn saref-temp:BuildingSpace_EntranceHall ;\n'+
            'saref:offers saref-temp:SenseTemperature ;\n'
        }
        res.writeHead(200, {'Content-Type': 'text/turtle'});
        */
}).listen(8080);

