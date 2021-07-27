'use strict';

const express = require('express');
var bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');

require('dotenv').config();

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

sgMail.setApiKey(process.env.SG_TOKEN)

// App
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.post('/api/cart', (req, res) => {
	console.log(req.body);
	res.json({});
	
	sendMail(process.env.TARGET_MAIL,req.body);
	
});

app.get("/api/articles", (req,res)=>{
	res.json(JSON.parse(fs.readFileSync('articles.json')));
})

function sendMail(email,content){
	try{
		var details = cartToDetails(content.cart);
		sgMail
		.send({
		  to: email, // Change to your recipient
		  from: 'bot@aecorp.tech', // Change to your verified sender
		  subject: 'Command Receive',
		  text: 'Nouvelle commande de '+content.pseudo,
		  html: '<strong>Nouvelle commande de '+content.pseudo+'</strong><br><strong>Discord: </strong><span>'+content.discord+'</span><br/><strong>Détails :</strong><br/>'+details,
		})
		.then(() => {
			console.log('Email sent');
		})
		.catch((error) => {
			console.error(error);
		})
	}catch(e){
		console.log(e);
		sgMail
		.send({
		  to: "romainamiet@gmail.com", // Change to your recipient
		  from: 'bot@aecorp.tech', // Change to your verified sender
		  subject: 'Command error',
		  text: JSON.stringify(content),
		  html: JSON.stringify(content),
		})
		.then(() => {
			console.log('Email sent');
		})
		.catch((error) => {
			console.error(JSON.stringify(error));
		})
	}
}

function cartToDetails(cart){
	var articles = JSON.parse(fs.readFileSync('articles.json'))
	
	var details = "<ul>";
	var cart = JSON.parse(cart)
	var total = 0;
	for(var i in cart){
		var article = null;
		for(var j in articles){
			if(cart[i]["id"]==articles[j]["id"])
				article = articles[j]
		}
		if(article!=null){
			details+="<li>"+cart[i]["quantity"]+" x "+article["title"]+" <strong>- "+article["price"]*cart[i]["quantity"]+"$</strong></li>";
			total += article["price"]*cart[i]["quantity"];
		}else{
			details+="<li>"+cart[i]["quantity"]+" x "+cart[i]["id"]+"</li>";
		}
	}
	return details+"</ul><br/><strong>Total : "+total+"$</strong>";
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
