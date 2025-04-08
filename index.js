import express from 'express';


const app = express();
const PORT = 3000;
 

app.get('/' , (req,res)=>{
    console.log(req.body)
    res.send("Hello Bot!")
})

app.post('/' , (req,res)=>{
    console.log(req.body)
    res.send("Hello Bot!")
})

app.listen(PORT , ()=>{
    console.log("Server is running on PORT:" , PORT)
})