var app = require('connect')();
var serveStatic = require('serve-static');
var cors = require('cors');

app.use(cors());

app.use('/api', serveStatic('mock-api', {
  'index': false,
  'setHeaders': setJsonHeaders
}));

function setJsonHeaders(res, path) {
  res.setHeader('Content-Type', 'application/json');
}

app.use('/', serveStatic('public', { 'index': ['index.html', 'index.htm'] }));

app.listen(8888, function () {
  console.log('Acesse: http://localhost:8888');
});
