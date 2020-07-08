// code is spaghetti so, here you go:

// 		Before playing against a player, type !challon to make challengeon variable true, then type !challengeme lichessUsername
//
//		you have 10-13 seconds to accept the challenge otherwise you have to type !challengeme lichessUsername again

//		!seek will create a game and play against a random player (to change time control look into function Challenge and gameStateChecker)

//		!createbotgame will create a game against StockFish, check function PlayVsBot to choose level and time control




const tmi = require('tmi.js'); // twitch API
const axios = require('axios'); // request library
const qs = require('querystring') // translating strings in request
const personalToken = 'YOUR_LICHESS_TOKEN'; // lichess token
var thegameid = '';
var moveswhite = 0;
var movesblack = 0;
var thevotedmove = '';
var isMyTurn;
var listofdoubles = [];
var howmanytimes = 0;


var allowedToUseCommands = ['xSplasher', 'ChatPlaysChess_TV'] // Users allowed to use Commands (case sensitive)


var streamer = 'fortunachesscoach'; // what channel you want the bot to join


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
var wrongMove = false;
var isMoveBeingPlayed = false;
var isPollOn = false;
var isgamecreatedcalled = false;
var isPlaying = false;
var justStarted = false;
var challengeon = false;

var votes = [];
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
        password: 'oauth:PUT_YOUR_AUTH_KEY_HERE', // Put your twitch token here, to get one visit: https://twitchapps.com/tmi/
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

        if (message == '!resign') {
            if (allowedToUseCommands.includes(user["display-name"])) {
                sayInChat('resigning the game...')
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
                            console.log(response.data['id']);
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



        // if (message == '!challenge') {
        //     if (user["display-name"] == 'xSplasher' || user["display-name"] == 'ChatPlaysChess_TV') {
        //         Challenge('just_a_nobody');
        //     }
        // }


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

            //setTimeout(client.action,6000,'xsplasher','bot game created, game id is: '+thegameid);

        }

        if (message == "!showgameid") {
            sayInChat('game id is: ' + thegameid+' || link is: https://lichess.org/'+thegameid);
        }

        // if (message == "!state") {

        //     axios.get('/api/board/game/stream/' + thegameid, {
        //         baseURL: 'https://lichess.org/',
        //         headers: {
        //             'Authorization': 'Bearer ' + personalToken
        //         },
        //         params: {
        //             nb: 1
        //         },
        //     }).then(function(response) {

        //         console.log(response.data['state']['status']);

        //     });
        // }

        if (message.includes("!")) { // handle move commands

            if (isPollOn) {

                if (message.length == 5 && message.charAt(2) > 0 && message.charAt(2) < 9 && message.charAt(4) > 0 && message.charAt(4) < 9 && !(message.charAt(1) == message.charAt(3) && message.charAt(2) == message.charAt(4))) {


                    if (votersname.includes(user["display-name"])) {
                        sayInChat(user["display-name"] + ': you already voted');
                    }


                    if (!votersname.includes(user["display-name"])) {
                        var ourmove = message.substr(1);

                        votersname.push(user["display-name"]);


                        if (ourmove in votes) { // if move exists already in votes
                            votes[ourmove]++;
                        }

                        if (!(ourmove in votes)) { // if move DO NOT exist
                            votes[ourmove] = 1;
                        }




                        //votes.push(ourmove); // pushing the vote to list
                        wrongMove = false;

                        sayInChat(user["display-name"] + ' voted for ' + ourmove);
                    }



                    //makemove(themessage);



                } else {
                    wrongMove = true;
                    console.log("Typed a wrong move");
                }
            }
        }

        // if (message == '!poll') {
        //     isPollOn = true;
        //     sayInChat('Poll started: 10 seconds');
        //     setTimeout(tellmethevote, 10000);
        //     //tellmethevote();
        // }

        // if (message == '!fpoll') {
        //     isPollOn = false;
        //     sayInChat('Poll ended');
        // }

    });
} catch (err) {
    console.log("ERROR: Move cant be played Outside");
}


//https://lichess.org/api/board/game/stream/{gameId}




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
                if (color == 'black') {
                    movesblack = movesblack + 4;
                }

                if (color == 'white') {
                    moveswhite = moveswhite + 4;
                }
                isMoveBeingPlayed = false;
            }).catch(function() {
                isPollOn = true;

                if (attempts >= attemptsToPlay) {
                    sayInChat('resigning...');
                    resign();
                }

                if (!nomoves) {
                    sayInChat("That's an illegal Move, Let's make a correct move. "+turnTime / 1000+" seconds.");
                    setTimeout(tellmethevote, turnTime);
                }

                if (nomoves && attempts < attemptsToPlay) {

                	if (!isPlayingBot) {
                		sayInChat(attemptsToPlay - attempts + " attempt(s) left before resigning the game. "+turnTime / 1000+" seconds.")
                	}
                    
                    nomoves = false;
                    setTimeout(tellmethevote, turnTime);
                }

            });

            //client.action('xsplasher', 'this bicth has it');
        } catch (err) {
            console.log("ERROR: Move cant be played");

        }
    }

    // else {
    //     console.log("cant play the move because it's wrong");
    //     isPollOn = true;
    //     sayInChat("Let's make a correct move: ");
    //     setTimeout(tellmethevote, 15000);
    // }
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
        //console.log(response.data['nowPlaying']);
        getcolor();
        if (!isgamecreatedcalled) {
            console.log('on going game: ' + thegameid);
        }

        if (isgamecreatedcalled) {
            sayInChat('bot game created, game id is: ' + thegameid)
        }

        if (isCalledFromChallenge && thegameid != '') {
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
        //thevotedmove = votes[0];
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
            //sayInChat('bot game created, game id is: '+thegameid);
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

//PlayVsBot(3,"black");

var gameStateChecker = setInterval(function() {
    if (thegameid != '' && isPlaying) {
        axios.get('/api/board/game/stream/' + thegameid, {
            baseURL: 'https://lichess.org/',
            headers: {
                'Authorization': 'Bearer ' + personalToken
            }
        }).then(function(response) {

            //console.log('i was here');
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

                    console.log('game ended bruh');
                    sayInChat('Game Ended !');

                }
            }

            if (isPlaying && !isMoveBeingPlayed && thegameid != '' && color != '' && typeof response.data['state'] !== 'undefined' && typeof response.data['state'] != 'undefined' && response.data['state']['status'] == 'started') {
                var x = response.data['state']['moves'].replace(/\s/g, '').length;

                //console.log('i was in turn');

                if (color == 'white' && !isMoveBeingPlayed) { // playing as white
                    if (x % 8 == 0) {
                        if ((x > moveswhite || moveswhite == '0') && !isPollOn) {
                            //console.log('in white'); // if it's our turn to move
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



                            
                            //console.log(x);
                            isMoveBeingPlayed = true;
                            isPollOn = true;                            
                            sayInChat("MAKE MOVES IN CHAT: (e.g: !e2e4) "+turnTime / 1000+" seconds.");
                            setTimeout(tellmethevote, turnTime);

                        }
                    }
                }

                if (color == 'black' && !isMoveBeingPlayed) {
                    if (x % 4 == 0) {
                        if (x > movesblack && !isPollOn && x > 3) {
                            //console.log('in black'); // if it's our turn to move
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


                            
                            //console.log(x);
                            isMoveBeingPlayed = true;
                            isPollOn = true;
                            sayInChat("MAKE MOVES IN CHAT: (e.g: !e2e4) "+turnTime / 1000+" seconds.");
                            setTimeout(tellmethevote, turnTime);

                        }
                    }
                }

            }


        }).catch(function(err) {
            console.warn(err);
        });
    }

}, 2100);

function Challenge(username, twitchusername, rated = false, clock = 2400, incr = 15, playercolor = 'random') {


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
            //getongoinggameID();
            //console.log("game created");
            //sayInChat('bot game created, game id is: '+thegameid);
        }).then(function() {
            //console.log('it worked');
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
            //getongoinggameID();
            //console.log("game created");
            //sayInChat('bot game created, game id is: '+thegameid);
        }).then(function() {
            //console.log('it worked');
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


//just_a_nobody

// var toPlayAMove = setInterval(function () {

//     if (isPlaying && thegameId != '' && color != '') {
//         if (color == 'white') {
//         	if (moves == '' && justStarted) {
//         		justStarted = false;
//         		//ask chat to play a move

//         		sayInChat('time to vote for moves');
//         		isPollOn = true;
//         		// modify vote handler command

//         	}



//         }
//     }
// }, 2100);
