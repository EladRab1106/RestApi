const app = require('./server');
const port = process.env.PORT;
app.listen(port, () => {
     console.log(`Server is running at http://localhost:${port}`);
     });
 module.exports = app;