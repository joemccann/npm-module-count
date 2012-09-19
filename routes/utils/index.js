// Send some data on the response as an SSE stream (using JSON for the data)
// See http://www.html5rocks.com/en/tutorials/eventsource/basics/

// Message ID used for server sent events
var message_id = 0;

// How long for browsers to wait if the server doesn't respond to our request for messages. In ms.
var SSE_ERROR_RETRY = 5000;

exports.respondWithStream = function(response, data, comment) {
  var response_contents = {
    id: message_id,
    retry: SSE_ERROR_RETRY,
    data: JSON.stringify(data)
  }
  var response_contents_flattened = '';
  if ( comment ) {
    response_contents_flattened += ':'+comment+'\n';
  }
  for ( var key in response_contents ) {
    response_contents_flattened += key+': '+response_contents[key]+'\n';
  }
  response.write(response_contents_flattened += '\n'); // Not end.
  message_id += 1;
}