var restify = require('restify');
var less = require('less-middleware');

//create the http server
var server = restify.createServer();

//use less to extend css
server.use(less({
    src: __dirname + '/public',
    compress: true
}));

//serve static content
server.get(/\/.*/, restify.serveStatic({
    directory: './public',
    default: 'index.html'
}));

//routing
//server.get('/hello/:name', respond);

//start the http server
server.listen(8000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
