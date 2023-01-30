const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.sendStatus(200);
});

app.listen(3000, function() {
    console.log('Server is up on port 3000!');
});
