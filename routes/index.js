var request = require('request')
  , jsdom = require('jsdom')
  , utils = require('./utils')
  , currentTotal
  , clients_awaiting_updates = [] // Update messages to send to each HTTP client
  , BROWSER_KEEPALIVE_INTERVAL = 40 // How often to send a 'comment' update to keep browsers connected. In seconds.
  , POLL_NPMJS_INTERVAL = 60 // How often to bother the poor NPMJS server

exports.index = function(req, res){
  res.render('index', { title: 'NPM Modules Count', currentTotal: currentTotal })
}

exports.addBrowserToQueue = function(req, res){
  console.log('Adding browser to queue awaiting npm count updates...')
  addBrowserToQueue(res)
}

exports.get_npm_count = function(req, res){
  console.log('Get npm count...')
  updateNPMCount(true,res)
}

// Requests for server side event updates. 
// We send headers, and write data, but we never end the response. This is how SSE streams work.
function addBrowserToQueue(response) {
  response.writeHead(200, { 
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  clients_awaiting_updates.push(response);
};

// Method that fetches the html from npmjs, scrapes it
// and either sends back json or sse
function updateNPMCount(isJsonP,res){
  console.log('Sending request to npmjs.org...')

  request.get('https://npmjs.org', function(e,r,b){
    
    console.log('Received npmjs.org response...')
    if(e) {
      console.error(e)
      return res.status(500).send('Something fuct up')
    }
    if(r.statusCode > 399) {
      console.log(r.statusCode + " is the status code greater than 399")
      return res.status(r.statusCode).message("Something not right")
    }
    jsdom.env({
      html: b,
      scripts: [
        'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js'
      ]
    }, function(err, window){
      
      console.log('Scraping response...')
      
      var $ = window.jQuery

      var count = $('#index > p:first').text().replace('Total Packages: ', '')
      
      console.log("Total number of modules:  " + count)
      console.log("Sending update to awaiting clients...")
      
      // In the case the the request is just a JSONP request...
      if(isJsonP){
        res.json({totalModules: count})
      }
      else{
        // Otherwise HTML5 SERVERSIDE EVENT STREAM!
        clients_awaiting_updates.forEach( function(response) {    
          utils.respondWithStream(response, {totalModules: count})
        })
      }
      
      currentTotal = count
      
      // https://github.com/tmpvar/jsdom/issues/226
      process.nextTick(function(){
        window.close() // required to stop leaking.
        delete window
      })  
      
    })  // end env callback for jsdom
    
  })
}

// Fire initially on booting up of app...
updateNPMCount()

// Now update on a fixed interval
setInterval(updateNPMCount, POLL_NPMJS_INTERVAL * 1000)

// Send 'keep alive' messages every so often so browsers stay connected 
setInterval(function(){
  clients_awaiting_updates.forEach( function(response) {    
    utils.respondWithStream(response, null, 'keepalive')
  });
}, BROWSER_KEEPALIVE_INTERVAL * 1000)



