///__________________________________________________________________________________________________
///INSTALL DEPENDENCIES
///__________________________________________________________________________________________________
const request = require('request');
const express = require('express');
const Discord = require('discord.js');
const app = express();
const PORT = process.env.PORT || 3000;
///__________________________________________________________________________________________________
///CREATE VARIABLES FOR INTERACTING WITH GIPHY AND DISCORD
///__________________________________________________________________________________________________
//create a new instance of discord for our bot
const giphybot = new Discord.Client();
//token for the bot     //Monthly Gaming token                                          //My Personal token
const DISCORD_TOKEN = 'MzU5NzkzOTE5ODA3OTc5NTIw.DKMLvA.R7eMuCX7mDUJ0n79JbuUNAPzwFY';//'MzU5Mzc0NzE4MzU0MDYzMzYw.DKGVIw.pHeB-w5vHLG2a2XC8dGXmDhWtbg';
//GIPHY API Endpoints and Authorization
const GIPHY_URL = 'https://api.giphy.com/v1/gifs/search?q='
const API_KEY = '&api_key=RvZNRm1VNydCeKs8b5RQHiyq9kTYIkb4'
const RATING = '&rating=pg13'
//variables to store last returned GIPHY data object and where we are in it
let dataObj = {};
let gifIndex = 0;
///__________________________________________________________________________________________________
///EVENT HANDLERS FOR DISCORD
///__________________________________________________________________________________________________
//event to listen for incoming messages
giphybot.on('message', message => {
    //So the bot doesn't reply to itself
    if(message.author.bot) return;

    //determines if the bot was mentioned
    if(message.isMentioned(giphybot.user)){

        const command = message.content.split(' ');

        if(command[1] === 'next' && command.length === 2){
            giphybot.getNextGif(message);
        }
        else{
            const searchTerm = message.content.substring(message.content.indexOf(' '));

            giphybot.searchGiphy(searchTerm, message);
        }
    }
});
///__________________________________________________________________________________________________
///GIPHY SEARCH HELPER METHODS
///__________________________________________________________________________________________________
//method that sends out an AJAX call to GIPHY to return a gif result
giphybot.searchGiphy = (searchTerm, message) => {
  //reset the iterator
  gifIndex = 0;
  //get rid of leading or trailing spaces
  searchTerm.trim();
  //check to make sure the user is really searching for something
  if(!searchTerm.length || searchTerm === ''){
    return -1;
  }
  //replace spaces in the search term with %20 to query url
  searchTerm = encodeURI(searchTerm);
  //concatenate the query
  const searchQuery = `${GIPHY_URL}${searchTerm}${API_KEY}${RATING}`;

  //send GET request to GIPHY and download JSON file
  let obj = {};
  request(searchQuery, (error, response, body) => {
    if(response.statusCode === 200){
      obj = JSON.parse(body);
      giphybot.processSearchResults(obj, message);
    }
  });
};

//method that processes the JSON object returned from searchGiphy()
giphybot.processSearchResults = (obj, message) => {
  //make sure there is no error and bail out if it broke
  if(obj.error){
    return -1;
  }

  //get the JSON object that is returned from GIPHY API
  dataObj = obj.data;
  //make sure we're getting at least 1 gif back
  if(!dataObj.length){
    return -1;
  }

  //lastly, return url of the gif
  message.reply(dataObj[gifIndex].embed_url);
};

//method that allows the user get the next gif
giphybot.getNextGif = message => {
  gifIndex++;
  if(gifIndex < dataObj.length){
    message.reply(dataObj[gifIndex].embed_url);
  }
  else {
    message.reply('Sorry, Ive already given you all of your gif options');
  }
};
///__________________________________________________________________________________________________
///CONNECT BOT TO DISCORD
///__________________________________________________________________________________________________
//bot login
giphybot.login(DISCORD_TOKEN);
app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
});
