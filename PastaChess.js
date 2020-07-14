// code is spaghetti so, here you go:

// 		Before playing against a player, type !challon to make challengeon variable true, then type !challengeme lichessUsername
//
//		you have 10-13 seconds to accept the challenge otherwise you have to type !challengeme lichessUsername again

//		!seek will create a game and play against a random player (to change time control look into function Challenge and gameStateChecker)

//		!createbotgame will create a game against StockFish, check function PlayVsBot to choose level and time control




const tmi = require('tmi.js'); // twitch API
const axios = require('axios'); // request library
const qs = require('querystring'); // translating strings in request



var allowedToUseCommands = ['xSplasher', 'ChatPlaysChess_TV']; // Users allowed to use Commands (case sensitive)


var streamer = 'xSplasher'; // what channel you want the bot to join


var OAuthToken = 'oauth:PUT_YOUR_AUTH_KEY_HERE'// Put your twitch token here, to get one visit: https://twitchapps.com/tmi/


const personalToken = 'YOUR_LICHESS_TOKEN '; // lichess token (ChatPlaysChess)




var thegameid = '';
var moveswhite = 0;
var movesblack = 0;
var thevotedmove = '';
var isMyTurn;
var listofdoubles = [];
var howmanytimes = 0;
var turnTimer;
var isCalledFromForcedMove = false;

var attemptsToPlay = 4;
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
var justStarted = false;
var challengeon = false;


var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname +'/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    /*socket.on('message', (s) => {
        io.emit('msg_received',s+' BACK');
    });*/
});

http.listen(7777, () => {
  console.log('listening on *:7777');
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
    channels: [streamer],
};

const client = new tmi.client(options);

client.connect();

client.on('connected', (address, port) => {
    sayInChat('Bot is Connected');
});
try {
    client.on('chat', (channel, user, message, self) => {


        if (message.includes('!closepoll')) {
            if (allowedToUseCommands.includes(user["display-name"])) {
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
            if (allowedToUseCommands.includes(user["display-name"])) {
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
            if (allowedToUseCommands.includes(user["display-name"])) {
                sayInChat('resigning the game...');
                resign();
            }
        }


        if (message == '!challon') {
            if (allowedToUseCommands.includes(user["display-name"])) {
                challengeon = true;
                sayInChat('Challenge ON');
            }
        }


        if (message == '!challoff') {
            if (allowedToUseCommands.includes(user["display-name"])) {
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


        if (message == '!seek') {
            if (allowedToUseCommands.includes(user["display-name"])) {
                SeekGame();
            }
        }


        if (message == '!cont') {
            if (allowedToUseCommands.includes(user["display-name"])) {
                isColorSet = false;
                isCalledFromCont = true;
                getongoinggameID();



            } else {
                sayInChat('error');
            }
        }


        if (message == '!updategameid') {

            if (allowedToUseCommands.includes(user["display-name"])) {
                getongoinggameID();
            }
        }

        if (message == '!createbotgame') {

            if (allowedToUseCommands.includes(user["display-name"])) {
                PlayVsBot();
            }
        }

        if (message == "!showgameid") {
            sayInChat('game id is: ' + thegameid+' || link is: https://lichess.org/'+thegameid);
        }


        if (message.includes("!")) { // handle move commands

            if (isPollOn) {

                if (message.length == 5 && message.charAt(2) > 0 && message.charAt(2) < 9 && message.charAt(4) > 0 && message.charAt(4) < 9 && !(message.charAt(1) == message.charAt(3) && message.charAt(2) == message.charAt(4))) {


                    if (votersname.includes(user["display-name"])) {
                        sayInChat(user["display-name"] + ': you already voted');
                    }


                    if (( !votersname.includes(user["display-name"])  )) { //TO BE REMOVED
                        var ourmove = message.substr(1);

                        votersname.push(user["display-name"]);


                        if (ourmove in votes) { // if move exists already in votes
                            votes[ourmove]++;
                            io.emit('existing_move',votes);
                        }

                        if (!(ourmove in votes)) { // if move DO NOT exist
                            votes[ourmove] = 1;
                            io.emit('new_move',votes);
                        }


                        sayInChat(user["display-name"] + ' voted for ' + ourmove);
                    }


                } else {
                }
            }
        }



    });
} catch (err) {
    console.log("ERROR: Move cant be played Outside");
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

                    io.emit('illegal_move_made', turnTime);

                    if (isCalledFromForcedMove) {
                        sayInChat("That's an illegal Move.");
                        isCalledFromForcedMove = false;
                    }
                    else{
                        sayInChat("That's an illegal Move, Let's make a correct move. "+turnTime / 1000+" seconds.");
                        turnTimer = setTimeout(tellmethevote, turnTime);   
                    }                                     
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
            sayInChat('bot game created, game id is: ' + thegameid)
        }

        if (isCalledFromChallenge && thegameid != '') {
            votes = {};
            votersname = [];
            listofdoubles = [];
            howmanytimes = 0;
            sayInChat('Challenge Accepted !');
        }

        if (isCalledFromChallenge && thegameid == '') {
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
                        	console.log('ERROR from getongoinggameID => isMyTurn Interval !!!!!!!!!!!!!!!!!!!!');
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
            console.log("######## there's no ongoing at the moment => getongoinggameID");
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
        	if (!isPlayingBot) {
        		attempts++;
        	}
            
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


function PlayVsBot(lvl = 8, color = "random", clock = none, incr = 15) {
    // wait some seconds for game id to be generated 

    isPlayingBot = true;
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
            justStarted = true;
            isPlaying = true;
            getongoinggameID();
            console.log("game created");
        }).then(function() {
            console.log('it worked');
        })
        .catch(err => console.warn(err));

}


function sayInChat(mymessage) {
    client.action(streamer, mymessage);
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
            if (typeof response.data['white'] != 'undefined' && typeof response.data['white'] !== 'undefined' && response.data['white']['id'] == 'chatplayschess') {
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
            if (typeof response.data['black'] != 'undefined' && typeof response.data['black'] !== 'undefined' && response.data['black']['id'] == 'chatplayschess') {
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

            if (typeof response.data['state'] !== 'undefined' && typeof response.data['state'] != 'undefined' && typeof response.data['state']['status'] !== 'undefined' && typeof response.data['state']['status'] != 'undefined' && response.data['state']['status'] != 'started') { // if game ended

                if (response.data['state']['status'] == 'resign') {
                    thegameid = '';
                }

                if (thegameid != '') {

                    isPlaying = false;
                    isColorSet = false;
                    attempts = 0;

                    if (isCalledFromChallenge) {
                        isCalledFromChallenge = false;
                        challengeon = true;
                    }

                    io.emit('game_ended');

                    console.log('game ended bruh');
                    sayInChat('Game Ended !');

                }
            }

            if (isPlaying && !isMoveBeingPlayed && thegameid != '' && color != '' && typeof response.data['state'] !== 'undefined' && typeof response.data['state'] != 'undefined' && response.data['state']['status'] == 'started') {
                var x = response.data['state']['moves'].replace(/\s/g, '').length;

                if (color == 'white' && !isMoveBeingPlayed) { // playing as white
                    if (x % 8 == 0) {
                        if ((x > moveswhite || moveswhite == '0') && !isPollOn) { // if it's our turn to move
                            
                            moveswhite = x;
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

                            sayInChat("MAKE MOVES IN CHAT: (e.g: !e2e4) "+turnTime / 1000+" seconds.");
                            turnTimer = setTimeout(tellmethevote, turnTime);

                        }
                    }
                }

                if (color == 'black' && !isMoveBeingPlayed) {
                    if (x % 4 == 0) {
                        if (x > movesblack && !isPollOn && x > 3) { // if it's our turn to move
                            
                            movesblack = x;

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


        }).catch(function(err) {
            console.warn(err);
        });
    }

}, 2100);

function Challenge(username, twitchusername, rated = false, clock = 6000, incr = 15, playercolor = 'random') {


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
            setTimeout(getongoinggameID, 13000);
        })
        .catch(err => console.warn(err));

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
        .catch(err => console.warn(err));
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
            })
            .catch(err => console.warn(err));
    }

    if (thegameid == '') {
        console.log('no onegoing games to resign');
        sayInChat('no onegoing games to resign');
    }


}
