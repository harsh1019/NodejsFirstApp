import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// import fs from "fs";
import path from "path";

// express nodejs framework or work as boiler plate
// easily server bangaya

// *************DATABASE*********
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"firstbackend",
}).then(()=>{
    console.log("Database Connected");
}).catch((e)=>{
   console.log(e);
});

// creating a Schema
const userSchema = mongoose.Schema({
    // in form of key value pair
    name:String,
    email:String,
    password:String,
});

// creating a Model
const User = mongoose.model("users",userSchema);

// *************

// instead of const server = express() ,we write app
const app = express();

// temporary array as database
// const users = [];

// *************************************************
// for static files,folder
// give absolute path using path
// express.static(path.join(path.resolve(),"public"));
// but above code dont work because it is middleware , so for middleware use app.use
 
//  using Middlewares 
 app.use(express.static(path.join(path.resolve(),"public")));
 app.use(express.urlencoded({extended:true}));
 app.use(cookieParser());
// *****************




   // *************************************************
// Setting up View Engine
// ya to set karo ya fir index.ejs extension de do
// koi bhi use kar sakte
app.set("view engine", "ejs");

// ******************* Authentication*******
const isAuthenticated = async(req,res,next) =>{
  
    const {token} = req.cookies;
    // or also can be written as const token = req.cookies.token
    
    if(token)
    {

        const decoded = jwt.verify(token,"sdsdfdvfdvfdvdfvdf");
        // req se user ki poora data store kar liya
        req.user = await User.findById(decoded._id);


        // agar token exist karta to usko logout dikhega
        // res.render("logout");
        next();
    }
    else
    {
        // agar token exist nhi karta to 
        // user login nhi hn to usko login wale page par bhejenge
        res.redirect("/login");
    }
};
 
// *******************

// an api that gets us the array of products
// app.get("/",(req,res,next)=>{
//     // res.sendStatus(200);
//     // *************************************************
    
//     // agar khud ka status bhejna ho
//     // res.status(400).send("mera status");
//     // *************************************************
    
//     // data send mostly json mei hi karte hn
//     // yeh jab use karnege jab frontend framework k saath
//     // kam kar rhe ,but jab nodejs se hi html data fetch karna to doosra tareeka hn
//     // res.json({
//     //     success:true,
//     //     products:[],
//     // });
//     // ************************************************* 
    
//     // 2nd method without frontend framework
//     //  res.sendFile("./index.html");
//     //  error de dega

  
//     //  const file = fs.readFileSync("./index.js");
//     //  res.sendFile(file);
//     // so,we use readFileSync, but this also give error
//     // how to give absolute path

//     // console.log(path.resolve());
//     // const pathLocation = path.resolve();
//     // console.log(path.join(pathLocation,"./index.html"));
//     // res.sendFile(path.join(pathLocation,"./index.html"));
//     // *************************************************
    
    
//     // but res.sendFile manlo abhi static file nhi bhejni yaha se koi variable bhejna file mei
//     // we use res.render
//     // ********EJS beginning************
//     res.render("index",{name:"Harshit"});
//     // specify engine ejs by using app.set

//     // working for static folder
//     // res.sendFile("inndex");
// });

// ********************* for login ******** 
// middleware made by us
app.get("/",isAuthenticated,(req,res) => {
    // console.log(req.cookies);
    // console.log(req.user);
    res.render("logout",{name:req.user.name});
});

app.get("/login",(req,res)=>{
    res.render("login");
 });


app.get("/register",(req,res)=>{
   res.render("register");
});



app.post("/login", async(req,res) => {
    
    const {password,email } = req.body;
    //  console.log(req.body);  

    // user agar exist karta hn to firse register nhi karega
    let user = await User.findOne({email});
    if(!user)
    {
    //    console.log("Register First");
       return res.redirect("/register");
    }

    // agar user exist karta to check password match karenge
    const isMatch = await bcrypt.compare(password,user.password);
    
    if(!isMatch)
    {
        return res.render("login",{email, message: "Incorrect Password"});
    }

    //  JWT token part -> ({id},secret key)
  const token = jwt.sign({
    _id:user._id},
    "sdsdfdvfdvfdvdfvdf"
  );
//   console.log(token);

// 
    res.cookie("token",token,{
       httpOnly:true,
       expires: new Date(Date.now() + 60*1000),
    });
    res.redirect("/");
});


app.post("/register", async(req,res) => {
    
    const {name,email,password} = req.body;
    //  console.log(req.body);  

    // user agar exist karta hn to firse register nhi karega
    let user = await User.findOne({email});
    if(user)
    {
    //    console.log("Register First");
        return res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(password,10);

    user = await User.create({
        name,
        email,
        password:hashedPassword,
    });

//  JWT token part -> ({id},secret key)
  const token = jwt.sign({
    _id:user._id},
    "sdsdfdvfdvfdvdfvdf"
  );
//   console.log(token);

// 
    res.cookie("token",token,{
       httpOnly:true,
       expires: new Date(Date.now() + 60*1000),
    });
    res.redirect("/");
});

app.get("/logout", (req,res) => {
    res.cookie("token",null,{
       httpOnly:true,
       expires: new Date(Date.now()),
    });
    res.redirect("/");
});


// ***********************************
// app.get("/add",async (req,res)=>{

//     await Message.create({
//         name:"Harsh1",
//         email:"harsh1rulaniya2001@gmail.com"
//     });
//     res.send("Nice Message added");
// });
// *************************

// ********************** for revision*******only
// specically success wala page chahiye ki jaise hi send button click ho naye
// page pe redirect ho
// app.get("/success", (req,res)=>{
    // simple render kar rhe to yeh route hn
    // res.render("success");
// });
// app.post("/contact",async (req,res)=>{
// // console.log(req.body.name);
// //   ab name mil gaya fir yeh name wagere database mei store kar sakte



// // **********************
// //  users.push({username:req.body.name ,email:req.body.email});
// // instead of pusing into array we push to database
// // const messageData =  {username:req.body.name ,email:req.body.email};
// // console.log(messageData);

// const {name,email} = req.body;
// await Message.create({name:name,email:email});

// // or
// // await Message.create({name:req.body.name,email:req.body.email});

// // ********************
// //  res.render("success");
// // agar naye page pe redirect karna hn
// res.redirect("/success");
// });

// app.get("/users",(req,res)=>{
//     // agar data send kar rhe to yeh api ki tarah hn
//     res.json({
//         users,
//    });
// });
// ************************ 
app.listen(5000,()=>{
 console.log("server is working");
});
