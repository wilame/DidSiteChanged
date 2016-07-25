//------------------------------------------------------------------------------
//REQUIRED ELEMENTS
//Remember installing the xmlhttprequest module: "npm install xmlhttprequest"
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//Enables file manipulation - http://www.devdungeon.com/content/file-manipulation-nodejs
var fs = require('fs');

//Enables telegram-bot-api - https://www.npmjs.com/package/telegram-bot-api
var telegram = require('telegram-bot-api');
var util = require('util');
var api = new telegram({token: <YOUR TELEGRAM TOKEN HERE>});

//------------------------------------------------------------------------------
var newSnapshot;
var oldSnapshot;
//Put in here the path to the file where you will record the snapshot of the page
var filePath = <PATH GOES HERE>;
var chatID = <GET THE CHAT ID AND PUT IN HERE>


//------------------------------------------------------------------------------
//INIT

setInterval(function(){
  check("http://www.hbo.com/game-of-thrones/episodes/index.html", "Game Of Thrones");
}, 3600*24*1000);


//------------------------------------------------------------------------------
//FUNCTIONS
function check(websiteURL, show)
{
  navigateTo(websiteURL);
  cutString()
  readOldSnapshot(filePath);

  if(newSnapshot.length != oldSnapshot.length){
      console.log("Snapshots are different.")
        //Send Telegram Message
        api.sendMessage({
          chat_id: chatID,
          text: 'It seems that the page of ' + show + ' has been updated!'
        })
        .then(function(data)
        {
  	       console.log(util.inspect(data, false, null));
        })
        .catch(function(err)
        {
        	console.log(err);
        });
      writeNewSnapshotToOldFile(filePath)
    } else {
      console.log("Snapshots are equal. Message not sent.")
    }
}


//----------------------------------
function navigateTo(URL){
  var page = new XMLHttpRequest();
  page.open( "GET", URL, false );
  page.send();
  newSnapshot = String(page.responseText);
}

//----------------------------------
function cutString(){
  var str = newSnapshot;

  //Here, I only check what's inside the content-primary div
  str = str.split("content-primary").pop();
  str = str.substring(0, str.indexOf("upcomingSchedule upcomingSchedule--secondary"));
  newSnapshot = str.trim()

  //Clean whitespaces
  newSnapshot = newSnapshot.replace(/ /g, "");
  newSnapshot = newSnapshot.replace(/	/g, "");
}

//----------------------------------
function readOldSnapshot(filePath){
  oldSnapshot = fs.readFileSync(filePath,'utf8')
}

//----------------------------------
function writeNewSnapshotToOldFile(filePath){
  fs.writeFile(filePath, newSnapshot, function(err) {
    if (err) throw err;
  })
}
