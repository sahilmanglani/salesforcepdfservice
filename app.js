const express = require('express');
const app = express();
const bodyParser= require('body-parser');

const PORT = process.env.PORT || 3000 ;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    const str="I AM AN ENDPOINT FOR YOUR SALESFORCE APPLICATION";
    res.send(str);
});


app.post('/', (req, res) => {
   
    console.log(req.body);
    const data=req.body;
    if(JSON.stringify(data) != '{}'){
        res.send(data);
        //echoing the request data back as response
    }
    else{
        res.send('No data Received');
    }
});


app.listen(PORT, () => {
    console.log(`Listening on ${ PORT }`);
});