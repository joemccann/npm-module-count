var request = require('request')
  , jsdom = require('jsdom')
  , currentTotal = 14888 // eventually change it so when we boot the app, it fetches and stashes it

exports.index = function(req, res){
  res.render('index', { title: 'NPM Modules Count', currentTotal: currentTotal })
}

exports.get_npm_count = function(req, res){
  console.log('Get npm count...')
  getNpmCount(res)
}


function getNpmCount(res){

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

      var count = parseInt( $('#index > p:first').text().replace('Total Packages: ', '') )
      
      console.log("Total number of modules:  " + count)
      
      res.json({totalModules: count})
      
      currentTotal = count
      
      // https://github.com/tmpvar/jsdom/issues/226
      process.nextTick(function(){
        window.close() // required to stop leaking.
        delete window
      })  
      
    })  // end env callback for jsdom
    
  })
}