// ==============================
//
//    HTML helper functions
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

