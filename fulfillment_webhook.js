// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
var https = require ('https');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}

  function railwaysquery(agent) {
    const parameters = request.body.queryResult.parameters;
    var src = parameters.sourceStation;
    src = src.replace(" ","%20");
    var dstn = parameters.destinationStation;
    dstn = dstn.replace(" ","%20");
    var date = parameters.travelDate;
    var yyyy = date.substr(0,4);
    var mm = date.substr(5,7);
    var dd = date.substr(8,10);
    var date1 = dd+"-"+mm+"-"+yyyy;
    var apikey = "pi9h941fgc";
    var code_src = getStationCode(apikey, src);
    code_src = code_src.replace(" ","%20");
    var code_dstn = getStationCode(apikey, dstn);
    code_dstn = code_dstn.replace(" ","%20");
    var ans = getInfo(apikey, code_src, code_dstn, date1);
    //response.send(JSON.stringify({"fulfillmentText":ans}));
    agent.add("Available trains - "+ans);
  }

function getStationCode(apikey, station) {
    var pathString = "/v2/name-to-code/station/"+station+"/apikey/"+apikey+"/";
    var stationCode;
    var request = https.get({
		host: "api.railwayapi.com",
		path: pathString,
	}, function (response) {
		var json = "";
		response.on('data', function(chunk) {
			console.log("received JSON response: " + chunk);
			json += chunk;
		});

		response.on('end', function(){
			var jsonData = JSON.parse(json);
		    stationCode = jsonData.stations[0].code;
			//console.log ("code is:" + stationCode);
		});
    });
    return Promise.resolve(stationCode);
}

function getInfo(apikey, code_src, code_dstn, date) {
    var pathString = "/v2/between/source/"+code_src+"/dest/"+code_dstn+"/date/"+date+"/apikey/"+apikey+"/";
    var trainName;
    var request = https.get({
        host: "api.railwayapi.com",
        path: pathString,
	}, function (response) {
		var json = "";
		response.on('data', function(chunk) {
			console.log("received JSON response: " + chunk);
			json += chunk;
		});

		response.on('end', function(){
			var jsonData = JSON.parse(json);
			trainName = jsonData.trains[0].name;
			//console.log ("train is:" + trainName);
		});
    });
    return Promise.resolve(trainName);
}

    

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Railways Query Intent', railwaysquery);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
