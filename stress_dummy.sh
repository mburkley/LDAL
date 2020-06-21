#!/bin/bash
for i in {1..1000}
do
    curl -s localhost:8080/SAREF/dummy/de0a210e-bb2e-44a0-bc81-26af425e8413 > /dev/null
done
