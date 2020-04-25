var http = require('http');
var url = require('url');
var request = require("request");

http.createServer(function (req, res) {
  if (url)
  {
      var q = url.parse (req.url, true);
      var qdata = q.query;
      console.log ("mthod="+req.method);
      console.log ("url="+req.url);
      console.log (qdata);
  }

  var rawData = '';
  req.on('data', (chunk) => { rawData += chunk; });
  req.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      console.log(parsedData);
    } catch (e) {
      console.error(e.message);
    }
  });


    var user="mark.burkley@ubiworx.com";
    var pass="HcrZ4IITFlg5";
    var url="https://"+user+":"+pass+
        "@staging.ubiworx.com/v2/sensors/159df0e4-860a-4c14-8ee1-516c39c0ef10/data?filter=last";

    var temp_time;
    var temp_val;

    request({
        url: url,
        json: true

    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("Got this:"+body);
            console.log(body); // Print the json response

            // try {
                // console.log("Parsing this: "+body);
                // const parsed = JSON.parse(body);
                // console.log(parsed);
                temp_time = body.result[0].time;
                temp_val = body.result[0].val;
                console.log("time="+temp_time);
            // } catch (e) {
            //     console.log("Nope");
            //     console.error(e.message);
            // }
        }

        var text=
            '@prefix\n'+
            'geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .\n'+
            'owl: <http://www.w3.org/2002/07/owl#> .\n'+
            'rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n'+
            'rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n'+
            'saref: <https://w3id.org/saref#> .\n'+
            'saref-ts: <http://ontology.tno.nl/saref/tempsensor#> .\n'+
            'time: <http://www.w3.org/2006/time#> .\n'+
            'xsd: <http://www.w3.org/2001/XMLSchema#> .\n'+
            '<http://ontology.tno.nl/saref/tempsensor>\n'+
            'rdf:type owl:Ontology ;\n'+
            'owl:imports <https://w3id.org/saref> ;\n'+
            '\n'+
            'saref-temp:BuildingSpace_EntranceHall\n'+
            'rdf:type saref:BuildingSpace ;\n'+
            'rdfs:label "Entrance Hall"^^xsd:string ;\n'+
            'geo:lat "39.531445"^^xsd:string ;\n'+
            'geo:long "2.729344"^^xsd:string ;\n'+
            'saref:hasSpaceType "Entrance Hall"^^xsd:string ;\n'+
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
            'saref:hasValue "'+temp_val+'"^^xsd:string ;\n'+
            // 'saref:hasTimestamp "2019-03-31T15:52:21.871725Z"^^xsd:dateTime ;\n'+
            'saref:hasTimestamp "'+temp_time+'"^^xsd:dateTime ;\n'+
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
        res.writeHead(200, {'Content-Type': 'text/txt'});
        res.end(text);
    });
}).listen(8080);
// }).on('error', (e) => {
// console.error(`Got error: ${e.message}`);
// });
