const express = require('express');
const app = express();
const hbs = require('express-handlebars');
const path = require('path');

app.engine('handlebars', hbs());
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

// Tell Express to listen for requests (start server)
app.listen(8080, () => {
    console.log('Server has started!');
});