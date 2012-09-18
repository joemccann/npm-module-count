/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'NPM Modules Count' })
};

exports.get_npm_count = function(req, res){
  getNpmCount(res)
};


function getNpmCount(res){
  // Fetch the page
  var request = require('request')
    , jsdom = require('jsdom')
    
    request.get('http://npmjs.org', function(e,r,b){
      if(e) return res.status(500).send('Something fuct up')
      if(r.statusCode > 399) return res.status(r.statusCode).message("Something not right")

      jsdom.env({
        html: b,
        scripts: [
          'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js'
        ]
      }, function(err, window){

        var $ = window.jQuery

        var count = parseInt( $('#index > p:first').text().replace('Total Packages: ', '') )
        
        console.log("Total number of modules:  " + count)
        
        res.json({totalModules: count})
        
        // https://github.com/tmpvar/jsdom/issues/226
        // window.close() // required to stop leaking. 
        
      })  // end env callback for jsdom
      
    })
}