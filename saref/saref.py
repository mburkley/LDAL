#!/usr/bin/python
from rdflib import URIRef, BNode, Literal
from rdflib import Graph
from rdflib.namespace import DC, RDF, FOAF

s=Graph()
s.parse("saref.ttl", format="turtle")
for namespace in s.namespaces():
    print namespace
print("creating temp")
garageTemp = BNode()
value = Literal(76.5) # passing a python float
print (s.serialize())
# from saref.namespace import Measurement

n = Graph()
saref = Namespace("https://w3id.org/saref#")
n.add(garageTemp, s.hasValue, value)
