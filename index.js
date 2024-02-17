const express = require("express");
const app = express();
const methodOveride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("mongoose");
const ExpressError = require("./views/utilities/ExpressError");
const tailwind = require("tailwindcss");
const axios = require("axios");
const fs = require("fs");
const Contacts = require("./model/sendmsg");
// Replace with your Namecheap API credentials
const apiKey = "cb839aa178c341898fd81c36924005a9";
const userName = "zlivehe55";
const apiEndpoint = "https://api.namecheap.com/xml.response";
const nodemailer = require("nodemailer");

// const homeRoute = require('./routes/homeRoutes')

const sessionConfig = {
  secret: "thisshouldbebetter",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 100 * 60 * 60 * 24 * 7,
    maxAge: 200 * 60 * 60 * 24 * 7,
  },
};

dbUrl = "mongodb+srv://zlivhe:pVGMDmaGmxRCenYU@gukari.w3j3o1v.mongodb.net/";
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })

  .then(() => {
    console.log("open");
  })
  .catch((err) => {
    console.log("Oh no");
    console.log(err);
  });

app.set("views engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.json());

app.use(methodOveride("_method"));
app.use(express.static("layouts"));
app.use(express.static("js"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(flash());

// app.use('/',homeRoute)

 app.use((req, res, next) => {   
    const routes =  req.route
    res.locals.currentUser = req.session.user
   //  console.log(req.session)
    next();
 })
 


 app.get('/',(req,res)=>{
    res.render('./view/index.ejs',{page:'home'})
 })

 app.get('/home',(req,res)=>{
  res.render('index.ejs',{page:'home'})
})
 
 app.get('/about',(req,res)=>{
  res.render('index.ejs',{page:'about'})
})
app.get('/career',(req,res)=>{
  
  res.render('careers.ejs',{page:'careers'})
})
app.get('/service',(req,res)=>{
  res.render('index.ejs',{page:'service'})  
})
app.get('/contact',(req,res)=>{
  res.render('./view/request-demo.ejs',{page:'contact'})
})

app.get('/atom.xml', async (req, res) => {
   try {
     const baseUrl = 'https://awolae.com'; // Update with your website's base URL
     const currentDate = new Date().toISOString();
 
     // Generate the sitemap XML dynamically
     let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
     sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
 
     // Add URLs dynamically from your website
     sitemap += `<url>
       <loc>${baseUrl}/</loc>
       <lastmod>${currentDate}</lastmod>
       <priority>1.0</priority>
     </url>\n`;

    sitemap += "</urlset>";

    // Save the generated sitemap XML to a file
    const filePath = path.join(__dirname, "public", "sitemap.xml");
    fs.writeFileSync(filePath, sitemap, "utf8");
    console.log(filePath);
    // Set the content type header and send the file as the response
    res.header("Content-Type", "application/xml");
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/files", (req, res) => {
  res.send("sitemap.ejs");
});

app.get("/getstarted", (req, res) => {
  res.render("view/home.ejs");
});
app.get("/appointments", async (req, res) => {
  const appoiments = await Contacts.find({});
  res.render("view/appoiments.ejs", { appoiments });
});
function validateEmailFormat(email) {
   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return regex.test(email);
 }

app.post('/submit-form', async (req, res) => {
   try {
       // Check if a document with the same data already exists
       const existingContact = await Contacts.findOne(req.body);

       const userEmail = req.body.email
       if (existingContact) {
           // If a duplicate is found, do not save and respond accordingly
           res.status(400).json({ error: 'Duplicate entry. Contact already exists.' });
       } else {
           // Create a new contact document using the Contact model
           const newContact = new Contacts(req.body);

               // Create a reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'awolaw@gmail.com',
        pass: 'ogrf qiks kcoi hjtx',
      },
    });

    // Check if the email is in a valid format
    if (validateEmailFormat(userEmail)) {
      const mailOptions = {
        from: 'awolaw@gmail.com',
        to: userEmail,
        subject: 'Thanks for your appoiments ',
        html: `
          <p>Hello ${req.body.name},</p>
        
        `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        console.log("Welcome email sent successfully");
      } else {
        console.error(`Invalid email format for user: ${user._id}`);
      }

      // Save the contact document to the database
      const savedContact = await newContact.save();
      console.log(savedContact);
      // Respond with the saved contact document
      res.status(202).json(savedContact);
    }
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//            // Save the contact document to the database
//            const savedContact = await newContact.save();
//     console.log(savedContact)
//            // Respond with the saved contact document
//            res.status(202).json(savedContact);
//        }
//    } catch (error) {
//        console.error('Error saving contact:', error);
//        res.status(500).json({ error: 'Internal Server Error' });
//    }
// });


// 404 page not found route
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});
// error hadling
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error.ejs", { err });
});
//server
app.listen(5000, () => {
  console.log("Serving on port 5000");
});
