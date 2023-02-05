const express = require('express');
const app = express();
const port = 5000;

const routes = require('./routes/routes');
require('./db/db');

app.use(routes);

app.listen(port, () => console.log(`App running at port ${port}`));
