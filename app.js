const express = require('express');
const router = express.Router();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');

const indexRouter = require('./routes/index');
const port = process.env.PORT || 3033;
const app = express();
app.listen(port, function () {
    console.log('App running on http://localhost:' + port);
});

app.use(express.json())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(cors());
app.use(compression());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', {title: 'Pedersen IT | Feil'})  
});
app.use(router);
module.exports = app;