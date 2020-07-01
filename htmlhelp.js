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
//  This module contrains HTML helper functions to format output for either
//  turtle or html.  HTML output contains links as href links, encodes < and >,
//  etc.
//
// ==============================

function ref (item)
{
    return "<a href=\""+item+"\">"+item+"</a>";
}

module.exports.ref = ref;

function respond200 (res, html)
{
    if (html)
        res.writeHead(200, {'Content-Type': 'text/html'});
    else
        res.writeHead(200, {'Content-Type': 'text/turtle'});
}

module.exports.respond200 = respond200;

function respond404 (res, html)
{
    if (html)
        res.writeHead(404, {'Content-Type': 'text/html'});
    else
        res.writeHead(404, {'Content-Type': 'text/turtle'});
}

module.exports.respond404 = respond404;

function link (html, text, link)
{
    var result = "";

    if (html)
        result += "<a href=\""+link+"\">";

    result += text;

    if (html)
        result += "</a>";

    return result;
}


module.exports.link = link;

function formatUrl (html, url)
{
    var result = ""

    if (html)
        result += "&lt;";
    else
        result += "<";

    result += url;

    if (html)
        result += "&gt;";
    else
        result += ">";

    return result;
}

function prefix (html, prefix, url)
{
    return ('@prefix '+prefix+': '+
            formatUrl (html, url)+
            ' .\n');
}

module.exports.prefix = prefix;

