NPM Module Count
=

Just a simple node app the has a JSONP friendly API to return the total number of node modules published in the NPM registry.

Using jQuery...


    $.getJSON('http://npm-count.jit.su/get_npm_count', function(json){
        console.log(json.totalModules) // logs to the console an integer
    })

LICENSE
--

MIT