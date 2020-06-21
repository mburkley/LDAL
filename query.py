#!/usr/bin/python
from rdflib import URIRef, BNode, Literal
from rdflib import Graph
from rdflib.namespace import DC, RDF, FOAF

# queryURI="http://www.burkley.net/LDAL/SAREF/measurement/de0a210e-bb2e-44a0-bc81-26af425e8413/2020-05-15T11:21:45/2020-05-15T11:22:45.03"
queryURI="http://localhost:8080/SAREF/measurement/de0a210e-bb2e-44a0-bc81-26af425e8413/2020-05-15T11:21:45/2020-05-15T11:22:45.03"

g = Graph()

g.parse(location=queryURI, format="turtle")
print (g.serialize(format="turtle"))

qres = g.query(
    """SELECT DISTINCT ?hasValue
    WHERE {
        ?a saref:isMeasuredIn <http://www.wurvoc.org/vocabularies/om-1.8/kilowatt> .
        ?a saref:hasValue ?hasValue .
    }""")

print("--- query ---")
for row in qres:
    print("has value %s" % row)


