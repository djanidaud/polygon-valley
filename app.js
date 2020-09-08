const express = require('express');
const app = express();

app.set('view engine', 'hbs');


const publicDirectoryPath = __dirname + "/public";
app.use(express.static(publicDirectoryPath));

app.get('', (req, resp) => { 
    resp.render('index');
});
app.listen(3000);  