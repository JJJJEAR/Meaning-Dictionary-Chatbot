const line = require('@line/bot-sdk');
const express = require('express');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;
const axios = require('axios').default;
const app = express();
const langdetect = require('langdetect');

const lineConfig = {
  channelAccessToken: env.ACCESS_TOKEN,
  channelSecret: env.SECRET_TOKEN
};

const client = new line.Client(lineConfig);

app.get('/' ,(req,res) => {
   res.json({status:'OK'})
});

app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    await Promise.all(events.map(item => handleEvent(item)));
    res.status(200).send("OK");
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

const handleEvent = async (event) => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    replyMessage = 'Please enter any words.';
  } else if (event.type === 'message') {
    try {
      replyMessage = await DictionaryAPI(event.message.text);
    } catch (err) {
      console.log(err);
      replyMessage = err.message;
    }
  }
  return client.replyMessage(event.replyToken, { type: 'text', text: replyMessage });
}

async function DictionaryAPI(word) {
  try {
    
    if(langdetect.detectOne(word) =='th')  {
      return 'Please type English word';
    }else{
    const response = await axios.get('https://api.dictionaryapi.dev/api/v2/entries/en/' + word);
    let Msg = '';
    if (response.data && response.data.length > 0) {
      const meanings = response.data[0].meanings;
      meanings.forEach((meaning) => {
        const partOfSpeech = meaning.partOfSpeech;
        const definition = meaning.definitions[0].definition;
        Msg += `● ${partOfSpeech} : ${definition}\n`;
      });
      
    } else {
      return 'No definition found.';
    }
    
    console.log(Msg);
    return Msg;
  }
  } catch (err) {
    console.error(err);
    return 'Please Enter a word';
  }
}

const port = 8080;
app.listen(port, () => {
  console.log('Listening on port '+ port);
});

module.exports = app;
