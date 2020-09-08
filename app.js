const express = require('express');
const app = express();


app.set('view engine', 'hbs');
const port = process.env.PORT || 3000;

const publicDirectoryPath = __dirname + "/public";
app.use(express.static(publicDirectoryPath));

app.get('', (req, resp) => { 
    resp.render('index');
});
app.listen(port, () => console.log('Server is up on port ' + port));  