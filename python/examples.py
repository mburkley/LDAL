#!/usr/bin/python
from rdflib import URIRef, BNode, Literal
from rdflib import Graph
from rdflib.namespace import DC, RDF, FOAF

bob = URIRef("http://example.org/people/Bob")
linda = BNode() # a GUID is generated

name = Literal('Bob') # passing a string
age = Literal(24) # passing a python int
height = Literal(76.5) # passing a python float

print ('name='+name)
print ('bob='+bob)
print ('linda='+linda)

g = Graph()

g.add( (bob, RDF.type, FOAF.Person) )
g.add( (bob, FOAF.name, name) )
g.add( (bob, FOAF.knows, linda) )
g.add( (linda, RDF.type, FOAF.Person) )
g.add( (linda, FOAF.name, Literal('Linda') ) )

print("--- printing raw triples ---")
for s, p, o in g:
    print((s, p, o))

print("--- printing turtle ---")
print g.serialize(format='turtle')

# Bind a few prefix, namespace pairs for more readable output
g.bind("dc", DC)
g.bind("foaf", FOAF)

print("--- printing n3 ---")
ser = g.serialize(format='n3')
print(ser)

g2 = Graph()
# g2.parse (ser)

print g2.serialize()

saref=Graph()
saref.parse("saref.ttl", format="turtle")

print (saref.serialize())


