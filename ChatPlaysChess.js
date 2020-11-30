//      The variables allowedToUseCommands, channelsToJoin,  OAuthToken and personalToken must be changed

//      to play against a player on lichess, type !challon to make challengeon variable true, then type !challengeme lichessUsername
//
//      you have 10-13 seconds to accept the challenge otherwise you have to redo the process

var args = process.argv.slice(2);
//console.log(args);

const tmi = require('tmi.js'); // twitch API
const axios = require('axios'); // request library
const qs = require('querystring'); // translating strings in request



var allowedToUseCommands = ['xSplasher','ChatPlaysChess_TV']; // Users allowed to use Commands (case sensitive)


var channelsToJoin = ['xSplasher']; // what channel you want the bot to join, you can as many as you want in this list.


var OAuthToken = 'oauth:PUT_YOUR_AUTH_KEY_HERE'// Put your twitch token here, to get one visit: https://twitchapps.com/tmi/


var personalToken = 'YOUR_LICHESS_TOKEN '; // lichess token (ChatPlaysChess)




if (args.length != 0) {

    //  Channels to join
    if (typeof args[0] !== 'undefined' && args[0]) {
        console.log("\n\n\n \t Joning Channel(s): "+args[0].split(',')+"");
        channelsToJoin = args[0].split(',');
    }

    // Power User(s)
    if (typeof args[1] !== 'undefined' && args[1]) {
        console.log("\n\n\n \t Power User(s): "+args[1].split(',')+"\n\n\n");
        allowedToUseCommands = args[1].split(',');
    }

    //  Lichess Token
    if (args[2] !== 'undefined' || args[2] != 'undefined' || args[2] != '') {
        personalToken = args[2];
    }

    // Twitch OAuth Key
    if (typeof args[3] !== 'undefined' && args[3]) {
        OAuthToken = args[3];
    }  
}


// ######################################################################################################
// ######################################################################################################
// ######################################################################################################




var lichessIDusername = ''; 
axios.get('/api/account' , {    
    baseURL: 'https://lichess.org/',    
    headers: {  
        'Authorization': 'Bearer ' + personalToken  
    }   
}).then(function(response) {    
    lichessIDusername = response.data['id'];    
}).catch(function(err) {    
    //console.log(err); 
});


//string_list = ["a", "B", "C"]
for (var i = 0; i < allowedToUseCommands.length; i++) {
    allowedToUseCommands[i] = allowedToUseCommands[i].toLowerCase();
}

    

var theretards = [];
var thegameid = '';
var theresponse = '';
var moveswhite = 0;
var movesblack = 0;
var thevotedmove = '';
var isMyTurn;
var listofdoubles = [];
var howmanytimes = 0;
var turnTimer;
var isCalledFromForcedMove = false;

var attemptsToPlay = 3;
var attempts = 0;
var color = '';
var turnTime = 60000;


var isPlayingBot = false;
var isCalledFromCont = false;
var isColorSet = false;
var isCalledFromChallenge = false;
var isbeingcalledfromGETCOLOR = false;
var nomoves = false;
var isMoveBeingPlayed = false;
var isPollOn = false;
var isgamecreatedcalled = false;
var isPlaying = false;
var justStarted = true;
var challengeon = false;
var isMyTurntoPlay = false;
var dontSurrenderPlease = ["Every moment you decide not to quit, you grow stronger.",
        "You must do the thing you think you can't do.",
        "Winners never quit and quitters never win.",
        "When you feel like quitting, think about why you started.",
        "You already know where giving up takes you, try not giving up."];


var tooLateBro = ["a mistake is only a mistake when you don't learn from it. otherwise it's a lesson.",
        "Mistakes have the power to turn you into something better than you were before.",
        "You can't go back in time and undo your actions, but you can learn from them.",
        "Don't waste a good mistake...learn from it.",
        "You don't need a coach to become better, you need to learn how to learn from mistakes."];


var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname +'/index.html');
});

io.on('connection', (socket) => {
    console.log(' "Show Moves" Page is connected to the browser successfully !');

    /*socket.on('message', (s) => {
        io.emit('msg_received',s+' BACK');
    });*/
});

http.listen(7777, () => {
  console.log('listening on port :7777');
});


var votes = {};
var votersname = [];

getongoinggameID();

var listofvoters = [];

const options = {
    options: {
        debug: true,
    },
    connection: {
        cluster: 'aws',
        reconnect: true,
    },
    identity: {
        username: 'BOT',
        password: OAuthToken, // Put your twitch token here, to get one visit: https://twitchapps.com/tmi/
    },
    channels: channelsToJoin,
};

const client = new tmi.client(options);

client.connect();

client.on('connected', (address, port) => {
    sayInChat('Bot is Connected');
});
try {
    client.on('chat', (channel, user, message, self) => {


        

        if (message.includes('!free')) {
            if (allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                message = message.toLowerCase();
                message = message.substr(6);
                theretards = theretards.filter(e => e !== message)
                sayInChat(message+" you're free PogChamp you can make moves now.");
            }
        }

        if (message.includes('!jail')) {
            if (allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                message = message.toLowerCase();
                message = message.substr(6);
                theretards.push(message);
                sayInChat(message+" i hope you enjoy your time in jail :)");
            }
        }



        if (message == '!closepoll') {
            if (allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                if (message.length == 10) {
                    if (isMoveBeingPlayed) {
                        io.emit('poll_closed');
                        sayInChat('Poll closed!');
                        clearTimeout(turnTimer);
                        tellmethevote();
                    }
                }
            }
        }




        if (message.includes('!move')) {
            if (allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                if (message.length == 10) {

                    if (isMoveBeingPlayed) {
                        isCalledFromForcedMove = true;

                        ourMove = message.substr(6, 4);
                        
                        makemove(ourMove);

                    }
                    else{
                        sayInChat("it's not our turn yet");
                    }                    
                }                               
            }
        }

        if (message == '!resign') {
            if (allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                sayInChat('resigning the game...');
                resign();
            }
        }


        if (message == '!challon') {
            if (allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                challengeon = true;
                sayInChat('Challenge ON');
            }
        }


        if (message == '!challoff') {
            if (allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                challengeon = false;
                sayInChat('Challenge OFF');
            }
        }



        if (message.includes('!challengeme')) { // Looking to be challenged

            if (challengeon && !isPlaying) {

                challengeon = false;

                var yes = message.slice(0, 12);
                if (yes == '!challengeme') {
                    var lichessusername = message.slice(13, message.length);
                    //console.log(lichessusername);

                    axios.get('/api/user/' + lichessusername, {
                        baseURL: 'https://lichess.org/',
                        headers: {
                            'Authorization': 'Bearer ' + personalToken
                        }
                    }).then(function(response) {

                        if (typeof response.data['id'] !== 'undefined' && typeof response.data['id'] != 'undefined' && typeof response.data !== 'undefined' && typeof response.data != 'undefined' && response.data['id'] != '') {
                            //console.log(response.data['id']);   
                            Challenge(lichessusername, user["display-name"]);
                        }

                    }).catch(function(err) {
                        console.log('username not found');
                        sayInChat(user["display-name"] + ", your Lichess username doesn't exist.");
                        challengeon = true;
                    });
                }
            }
        }

        if(message == '!takeback' || message == 'takeback'){
            if (!allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                var youcantgoback = tooLateBro[Math.floor(Math.random() * tooLateBro.length)];
                sayInChat(user["display-name"] + " " + youcantgoback)
            }            
        }

        if(message == '!resign' || message == 'resign'){
            if (!allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                var pleasedont = dontSurrenderPlease[Math.floor(Math.random() * dontSurrenderPlease.length)];
                sayInChat(user["display-name"] + " " + pleasedont)
            }            
        }


        if (message == '!seek') {
            if (allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                SeekGame();
            }
        }


        if (message == '!cont') {
            if (allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                isColorSet = false;
                isCalledFromCont = true;
                getongoinggameID();



            } else {
                //sayInChat('error');
            }
        }


        if (message == '!updategameid') {

            if (allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                getongoinggameID();
            }
        }

        if (message == '!createbotgame') {

            if (allowedToUseCommands.includes(user["display-name"].toLowerCase())) {
                PlayVsBot();
            }
        }

        /*if (message == "!showgameid") {
            sayInChat('game id is: ' + thegameid+' || link is: https://lichess.org/'+thegameid);
        }*/


        if (message.length == 4) { // handle move commands

            if (isPollOn) {

                message = message.toLowerCase();

                if ((!theretards.includes(user["display-name"].toLowerCase())) && message.charAt(1) > 0 && message.charAt(1) < 9 && message.charAt(3) > 0 && message.charAt(3) < 9 && !(message.charAt(0) == message.charAt(2) && message.charAt(1) == message.charAt(3))) {


                    if (votersname.includes(user["display-name"].toLowerCase())) {
                        sayInChat(user["display-name"] + ': you already voted');
                    }


                    if (( !votersname.includes(user["display-name"].toLowerCase())  )) {
                       
                        votersname.push(user["display-name"].toLowerCase());


                        if (message in votes) { // if move exists already in votes
                            votes[message]++;
                            io.emit('existing_move',votes);
                        }

                        if (!(message in votes)) { // if move DO NOT exist
                            votes[message] = 1;
                            io.emit('new_move',votes);
                        }


                        sayInChat(user["display-name"] + ' voted for ' + message);
                    }


                } else {
                }
            }
        }



    });
} catch (err) {
    console.log("ERROR: Move cant be played");
}





function makemove(themove) {
    //calling Lichess API to make a move

    if (thegameid != '' && typeof themove != 'undefined' && typeof themove !== 'undefined' && isPlaying) {

        try {
            axios.post('https://lichess.org/api/board/game/' + thegameid + '/move/' + themove, null, {
                    headers: {
                        'Authorization': 'Bearer ' + personalToken
                    },
                },

            ).then(function(response) {
                console.log('Move: ' + themove + ' is Played!');
                sayInChat('Move: ' + themove + ' is Played!');

                io.emit('move_made',themove);

                if (color == 'black') {
                    movesblack = movesblack + 4;
                }

                if (color == 'white') {
                    moveswhite = moveswhite + 4;
                }
                isMoveBeingPlayed = false;

                if (isCalledFromForcedMove) {

                    clearTimeout(turnTimer);
                    // reseting turn variables
                    isPollOn = false;
                    votes = {};
                    votersname = [];
                    listofdoubles = [];
                    howmanytimes = 0;

                    isCalledFromForcedMove = false;
                }

            }).catch(function() {
                isPollOn = true;

                if (attempts >= attemptsToPlay) {
                    sayInChat('resigning...');
                    resign();
                }

                if (!nomoves) { // if move is illegal
                    if (isCalledFromForcedMove) {
                        sayInChat("That's an illegal Move.");
                        isCalledFromForcedMove = false;
                    }
                    else{
                        sayInChat("That's an illegal Move, Let's make a correct move. "+turnTime / 1000+" seconds.");
                        turnTimer = setTimeout(tellmethevote, turnTime);   
                    }  


                    io.emit('illegal_move_made', turnTime);

                    
                                                       
                }

                if (nomoves && attempts < attemptsToPlay) { // if there's no moves

                    var theAttemptsLeft = attemptsToPlay - attempts;

                    io.emit('no_moves_submitted', turnTime,theAttemptsLeft);

                    sayInChat(theAttemptsLeft + " attempt(s) left before resigning the game. "+turnTime / 1000+" seconds.")
                    
                    
                    nomoves = false;
                    turnTimer = setTimeout(tellmethevote, turnTime);
                }

            });
         
        } catch (err) {
            console.log("ERROR: Move cant be played");

        }
    }

}




function getongoinggameID() {

    axios.get('/api/account/playing', {
        baseURL: 'https://lichess.org/',
        headers: {
            'Authorization': 'Bearer ' + personalToken
        },
        params: {
            nb: 1
        },
    }).then(function(response) {
        thegameid = response.data['nowPlaying'][0]["fullId"];
        getcolor();
        if (!isgamecreatedcalled) {
            console.log('on going game: ' + thegameid);
        }

        if (isgamecreatedcalled) {
            sayInChat('bot game created, game id is: ' + thegameid);
        }

        if (isCalledFromChallenge && thegameid != '') {
            votes = {};
            votersname = [];
            listofdoubles = [];
            howmanytimes = 0;
            sayInChat('Challenge Accepted !');
        }

        if (isCalledFromChallenge && thegameid == '') {
            isCalledFromChallenge = false;
            challengeon = true;
            isPlaying = false;
            sayInChat("Challenge wasn't accepted by the receiver");
        }

        if (isCalledFromCont) {
            isMyTurn = response.data['nowPlaying'][0]['isMyTurn'];
            if (thegameid != '') {

                if (!isMyTurn) {
                    isMoveBeingPlayed = true;

                    var tocheckthemove = setInterval(function() {
                        axios.get('/api/account/playing', {
                            baseURL: 'https://lichess.org/',
                            headers: {
                                'Authorization': 'Bearer ' + personalToken
                            },
                            params: {
                                nb: 1
                            },
                        }).then(function(response) {
                            if (response.data['nowPlaying'][0]['isMyTurn']) {
                                isMyTurn = true;
                                isMoveBeingPlayed = false;
                                isCalledFromCont = false;
                                isPlaying = true;
                                clearInterval(tocheckthemove);
                                votes = {};
                                votersname = [];
                                listofdoubles = [];
                                howmanytimes = 0;
                            }
                        }).catch(function(err) {
                            console.log('ERROR from getongoinggameID() => isMyTurn -> tocheckthemove Interval !!!!!!!!!!!!!!!!!!!!');
                        });
                    }, 2100)
                }

                if (isMyTurn) {
                    isPlaying = true;
                }


            }
            if (thegameid == '') {
                sayInChat("there's no ongoing game.");
            }
        }

    }).catch(function(err) {
        if (thegameid != '') {
            console.warn(err);
        } else {
             if (isCalledFromChallenge && thegameid == '') {    
                isCalledFromChallenge = false;  
                challengeon = true; 
                isPlaying = false;  
                sayInChat("Challenge wasn't accepted by the receiver"); 
            }   
            else{   
                sayInChat("i can't see any live game to join");
                console.log("######## there's no ongoing at the moment => getongoinggameID");   
            }
        }
    });
}


function tellmethevote() {
    isPollOn = false;
    var xad = 'No Move';
    if (isPlaying) {


        if (Object.keys(votes).length > 0) {

            pap = Object.keys(votes).reduce(function(a, b) {
                return votes[a] > votes[b] ? a : b
            });

            for (var key in votes) {
                if (votes[key] == votes[pap]) {
                    listofdoubles.push(key)                 
                    howmanytimes++;
                }
            }

            if (howmanytimes > 1) {
                var item = listofdoubles[Math.floor(Math.random() * listofdoubles.length)];
                sayInChat('the vote is: ' + item);
                xad = item;             
            }

            if (howmanytimes == 1) {
                sayInChat('the vote is: ' + pap);
                xad = pap;
            }
            
            attempts = 0;
        } else { // if no votes
            attempts++;
            sayInChat('No votes were submited.');
            nomoves = true;
        }

        makemove(xad);
        votes = {};
        votersname = [];
        listofdoubles = [];
        howmanytimes = 0;

    }
}


function PlayVsBot(lvl = 8, color = "random", clock = 1800, incr = 60) {
    // wait some seconds for game id to be generated 

    isPlayingBot = true;
    justStarted = true;
    isgamecreatedcalled = true
    const requestBody = {
        'level': lvl,
        'clock.limit': clock,
        'clock.increment': incr,
        'days': 12,
        'color': color
    }

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + personalToken
        }
    }

    axios.post("https://lichess.org/api/challenge/ai", qs.stringify(requestBody), config)
        .then((result) => {
            // Do somthing

            isPlaying = true;
            getongoinggameID();
            console.log("game created");
        }).then(function() {
            //console.log('it worked');
        })
        .catch(err =>{  
            justStarted = false;    
            //console.warn(err);    
            sayInChat('the Lichess token provided is incorrect.');  
        } );

}


function sayInChat(mymessage) {
    channelsToJoin.forEach(b => client.action(b, mymessage));   
}

function getcolor() {

    var thevariable = setInterval(function() {
        axios.get('/api/board/game/stream/' + thegameid, {
            baseURL: 'https://lichess.org/',
            headers: {
                'Authorization': 'Bearer ' + personalToken
            }


        }).then(function(response) {
            isbeingcalledfromGETCOLOR = true;
            if (typeof response.data['white'] != 'undefined' && typeof response.data['white'] !== 'undefined' && response.data['white']['id'] == lichessIDusername) {
                console.log('playing as white');
                if (isbeingcalledfromGETCOLOR && !isColorSet) {
                    isColorSet = true;
                    sayInChat('playing as white');
                    isbeingcalledfromGETCOLOR = false;
                }

                color = 'white';
                if (isgamecreatedcalled) {
                    isgamecreatedcalled = false;
                }
                clearInterval(thevariable);
            }
            if (typeof response.data['black'] != 'undefined' && typeof response.data['black'] !== 'undefined' && response.data['black']['id'] == lichessIDusername) {
                console.log('playing as black');
                if (isbeingcalledfromGETCOLOR && !isColorSet) {
                    isColorSet = true;
                    sayInChat('playing as black');
                    isbeingcalledfromGETCOLOR = false;
                }

                color = 'black';
                if (isgamecreatedcalled) {
                    isgamecreatedcalled = false;
                }
                clearInterval(thevariable);
            }

        }).catch(function(err) {
            console.warn(err);
        });

    }, 2100);
}


var gameStateChecker = setInterval(function() {
    if (thegameid != '' && isPlaying) {
        axios.get('/api/board/game/stream/' + thegameid, {
            baseURL: 'https://lichess.org/',
            headers: {
                'Authorization': 'Bearer ' + personalToken
            }
        }).then(function(response) {
            theresponse = response;
            //console.log(response.data);
            axios.get('/api/account/playing', {
                baseURL: 'https://lichess.org/',
                headers: {
                    'Authorization': 'Bearer ' + personalToken
                },params: {
                    nb: 1
                }
            }).then(function(response1) {
                
                    //console.log('we found ismyturn');

                    if (typeof theresponse.data['state'] !== 'undefined' && typeof theresponse.data['state'] != 'undefined' && typeof theresponse.data['state']['status'] !== 'undefined' && typeof theresponse.data['state']['status'] != 'undefined' && theresponse.data['state']['status'] != 'started') { // if game ended

                        if (thegameid != '' || response.data['state']['status'] == 'resign') {
                    
                            isColorSet = false;
                            isCalledFromChallenge = false;
                            isPollOn = false;
                            isPlaying = false;
                            isMoveBeingPlayed = false;
                            thegameid = '';
                            moveswhite = 0;
                            movesblack = 0;
                            isPlayingBot = false;
                            justStarted = true;     
                            attempts = 0;
                            color = '';
                            isMyTurntoPlay = false;
                            theresponse = '';
                    
                            clearTimeout(turnTimer);
                    
                            if (isCalledFromChallenge) {
                                isCalledFromChallenge = false;
                                challengeon = true;
                            }
                    
                            io.emit('game_ended');
                            //console.log('ID NOT EMPTY');
                            console.log('game ended bruh');
                            sayInChat('Game Ended !');
                    
                        }
                    }

                if(typeof response1.data['nowPlaying'][0] != 'undefined' && typeof response1.data['nowPlaying'][0] !== 'undefined' && response1.data['nowPlaying'][0] !== 'undefined' && response1.data['nowPlaying'][0] != 'undefined') {
                    isMyTurntoPlay = response1.data['nowPlaying'][0]['isMyTurn'];
                    //console.log('game state checker');
                    //console.log('isPlaying: '+isPlaying+' | !isMoveBeingPlayed: '+isMoveBeingPlayed+' | thegameid: '+thegameid+' | color: '+color+" | "+(typeof response.data['state'] !== 'undefined' && typeof response.data['state'] != 'undefined' && response.data['state']['status'] == 'started'));
                    //console.log(response.data);
                    if (isPlaying && !isMoveBeingPlayed && thegameid != '' && color != '' && typeof theresponse.data['state'] !== 'undefined' && typeof theresponse.data['state'] != 'undefined' && theresponse.data['state']['status'] == 'started') {
                        var x = theresponse.data['state']['moves'].replace(/\s/g, '').length;
                        //console.log('this is the x: '+x);
                        justStarted = false;
                    
                        if (color == 'white' && !isMoveBeingPlayed && !isPollOn && isMyTurntoPlay) { // playing as white
                            if (true) {//x % 8 == 0
                                if (true){ //(x > moveswhite || moveswhite == '0') && !isPollOn  // if it's our turn to move
                                    //console.log('white: '+moveswhite);
                                    //moveswhite = x;
                                    //console.log('x in white: '+x);
                                    //console.log('my color: '+color);
                                    
                                    if (x < 56 ) { // from 1st to 7th move
                                        turnTime = 30000; // 30seconds
                                    }
                    
                                    if (x >= 56 && x <= 80) { // 7th and 10th move
                                        turnTime = 45000;
                                    }
                    
                                    if (x > 80 && x <= 160) { // 10th ahd 20th
                                        turnTime = 60000;
                                    }
                    
                                    if (x > 160) {
                                        turnTime = 75000;
                                    }
                    
                                    isMoveBeingPlayed = true;
                                    isPollOn = true;
                    
                                    io.emit('our_turn',turnTime);
                    
                                    sayInChat("MAKE MOVES IN CHAT: (e.g: e2e4) "+turnTime / 1000+" seconds.");
                                    turnTimer = setTimeout(tellmethevote, turnTime);
                    
                                }
                            }
                        }
                    
                        if (color == 'black' && !isMoveBeingPlayed && !isPollOn && isMyTurntoPlay) {
                            if (true) { //x % 4 == 0
                                if (true){ //x > movesblack && !isPollOn && x > 3 // if it's our turn to move
                                    //console.log('black: '+movesblack);
                                    movesblack = x;
                                    //console.log('x in black: '+x);
                                    
                    
                                    if (x < 56 ) { // 7th move
                                        turnTime = 30000;
                                    }
                    
                                    if (x >= 56 && x <= 80) { // 7th and 10th move
                                        turnTime = 45000;
                                    }
                    
                                    if (x > 80 && x <= 160) { // 10th ahd 20th
                                        turnTime = 60000;
                                    }
                    
                                    if (x > 160) {
                                        turnTime = 75000;
                                    }
                                    
                                    isMoveBeingPlayed = true;
                                    isPollOn = true;
                    
                                    io.emit('our_turn',turnTime);
                    
                                    sayInChat("MAKE MOVES IN CHAT: (e.g: !e2e4) "+turnTime / 1000+" seconds.");
                                    turnTimer = setTimeout(tellmethevote, turnTime);
                    
                                }
                            }
                        }
                    
                    }
                }
                
                //console.log('yo');
            })
            .catch(err => {
                console.log('some error bruh, check line 875');
                //console.log(err);
                //sayInChat('the Lichess token provided is incorrect.');
            });




        }).catch(function(err) {
            console.warn(err);
        });
    }

}, 2100);

function Challenge(username, twitchusername, rated = false, clock = 1800, incr = 60, playercolor = 'random') {


    isPlaying = true;
    const requestBody = {
        'rated': rated,
        'clock.limit': clock,
        'clock.increment': incr,
        'days': 12,
        'color': playercolor
    }

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + personalToken
        }
    }

    axios.post("https://lichess.org/api/challenge/" + username, qs.stringify(requestBody), config)
        .then((result) => {
            // Do something
            justStarted = true;
            isColorSet = false;
            sayInChat('sending challenge to ' + username + ' submitted by ' + twitchusername);            
        }).then(function() {

            isCalledFromChallenge = true;
            thegameid='';
            setTimeout(getongoinggameID, 13000);
        })
        .catch(err => { 
            //console.warn(err);    
            sayInChat('the Lichess token provided is incorrect.');  
        }); 

}


function SeekGame(rated = false, timeinMinutes = 10, incr = 15, playercolor = 'random') {

    const requestBody = {
        'rated': rated,
        'time': timeinMinutes,
        'increment': incr,
        'color': playercolor
    }

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + personalToken
        }
    }

    axios.post("https://lichess.org/api/board/seek", qs.stringify(requestBody), config)
        .then((result) => {
            // Do something
            justStarted = true;
            isPlaying = true;            
        }).then(function() {
            getongoinggameID();
        })
        .catch(err => { 
            //console.warn(err);    
            sayInChat('the Lichess token provided is incorrect.');  
        });
}


function resign() {

    if (thegameid != '' && isPlaying) {

        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + personalToken
            }
        }

        axios.post("https://lichess.org/api/board/game/" + thegameid + "/resign", null, config)
            .then((result) => {
                // Do something            
            }).then(function() {
                clearTimeout(turnTimer); 
                io.emit('game_ended');                               
                sayInChat('game resigned.');
                isColorSet = false;
                isCalledFromChallenge = false;
                isPollOn = false;
                isPlaying = false;
                isMoveBeingPlayed = false;
                thegameid = '';
                moveswhite = 0;
                movesblack = 0;
                isPlayingBot = false;
                justStarted = true;
                attempts = 0;
                color = '';
                isMyTurntoPlay = false;
                theresponse = '';    
            })
            .catch(err => console.warn(err));
    }

    if (thegameid == '') {
        console.log('no onegoing games to resign');
        sayInChat('no ongoing games to resign');
    }


}

// i made this project to prove to myself that i can make anything i can imagine knowing only the language's basics with my best friend, google.
// spent 30mins learning how to do loops, if statement in javasript and how to start a basic http server with express. 
// it took ~60hours to make this from scratch.
