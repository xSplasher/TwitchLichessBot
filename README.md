## What is this ?
a twitch bot that gives you the ability to play against your twitch chat on lichess.

You (the streamer) will be playing on your Lichess account while Chat should be playing on another one.

Chat is going to vote for moves in twitch chat, the most voted move is played by the bot.

## What things can i do with it ?
 - Twitch channel vs 1 person: 1 bot needed
 - Twitch channel vs Twitch channel: 2 bots playing against each other (can be the same channel to have chat play against itself)
 - Many twitch channels vs 1 person: 1 bot needed (read step 4)
 - Many twitch channels vs 1 Twitch channel: 2 bots playing against each other
 - Many twitch channels vs Many twitch channels: 2 bots playing against each other

## How can i play ?
First you need to install some stuff to make it work:

1. Download & Install nodejs on your computer (google that).
     

2. After doing that, now open cmd and install:

   - install twitch api library
     ``` npm install tmi.js ```

   - install axios request library
     ``` npm install axios ```
     
   - install express web framework library
     ``` npm install express ```
     
   - install socket.io websockets library
     ``` npm install socket.io ```




3. Now we need to set some variables:
    1. Twitch account that the bot will use (you can use your main one).   
       - account will only be used to send messages in chat (should have streamer, mod or vip privilege to avoid "you're sending too many messages quickly" twitch problem) 
       - to give the bot control of your account we need a OAuth token, that you can get from [here](https://twitchapps.com/tmi/) 
       
       (**DO NOT SHARE THIS TOKEN**)

    2. Lichess account that the chat will play on (i recommend that you create a new account)
       - we need a personal token to give the bot permission to use the Lichess account, get the token from [here](https://lichess.org/account/oauth/token)
       - create a new personal token and these are the permissions you should give it:
         - Read preferences
         - Create, accept, decline challenges
         - Play games with the board API

    3. Go to the ```ChatPlaysChess.js``` file and replace:
       - ```YOUR_LICHESS_TOKEN``` with your Lichess token
       - ```oauth:PUT_YOUR_AUTH_KEY_HERE``` with your Twitch OAuth token, make sure to include the ```oauth:```



4. We need to tell the bot which channel it should join. to do that:
   - search for an array named ```channelsToJoin``` and replace its value with the desired twitch channel
   - can be many channels and the bot will join all of them and gather moves from them (multiple twitch channels vs 1 person)

5. We need to tell the bot who can use the commands (should be you and/or the mods). to do that:
   - search for an array named ```allowedToUseCommands``` and add twitch usernames of the people who can use the commands. these people are going to be able to create a game or resign it, you should put your twitch username here and your mods, no more, unless you want chaos.


## I Did everything above. Now wot ?

Now you can run it by simply typing ```node ChatPlaysChess.js``` in ```cmd``` or however you want.

if everything works fine, you'll see ```Bot is Connected``` in your chat, if you just created the lichess account, you'll probably get a token error, in that case just give it some time. any other question you can whisper me on [Twitch](https://www.twitch.tv/xsplasher) or DM me on discord xSplasher#3998 .

### Quick Start

in chat type ```!challon``` then ```!challengeme LichessUsernameToBeChallenged``` the challenged player has 10-13 seconds to accept the challenge. 

to vote for moves type ```a1a8``` or ```c1f4``` in chat, squares only.


### More Details

- __```e2e4``` is how you vote, want to move the knight on g1 to f3 ? type ```g1f3``` castle king side as white ? ```e1g1```__
  - accessible by chat only when it's chat's turn to play

- __```!challon``` Make Challenge On__
  - after executing this everybody in chat can send a challenge

- __```!challoff``` Make Challenge Off__

- __```!challengeme LichessUsernameToBeChallenged``` Make chat play a casual game against someone on Lichess__
  - requires executing ```!challon``` to work
  - the challenged player has 10-13 seconds to accept the challenge
  - if you want to change the game settings, like time control etc, check the function named ```Challenge```:
    - Clock: change ```clock``` variable to the desired value in seconds.
    - Color: change ```playercolor``` variable to ```white``` ```black``` or ```random```
    - Increment: change ```icr``` variable to the desired value in seconds.
    - Game Type: change ```rated``` variable to ```true``` to play a Rated game, or ```false``` for a Casual one (IMPORTANT: i do NOT recommend you to play a rated game, your account could be banned, please keep this variable always ```false``` unless you're willing to take the risk of getting banned).

- __```!seek``` Make chat play a casual game against a random person on Lichess (Not heavily tested)__
  - if you want to change the game settings, like time control etc, check the function named ```SeekGame```:
    - Same as Challenge function except; Clock: change ```timeinMinutes``` variable to the desired value in minutes.
    
- __```!resign``` Resign the game currently playing__
   
- __```!cont``` to Continue a game already playing (if you stopped the bot in the middle of the game and want to continue)__
  
- __```!move e1e2``` Forces a move to be played.__

- __```!closepoll``` immediately closes the poll and plays the most voted move.__

- __```!jail TwitchUserName``` after executing this command, the bot will start rejecting ```TwitchUserName```'s votes. (if somebody is trolling, use this command to jail them)__

- __```!free TwitchUserName``` the bot will start accepting ```TwitchUserName```'s votes.__


## Want to show the voted moves on stream ?

after you start the bot, open obs in your 'Sources' add a 'Browser' and put ``` http://localhost:7777/ ``` as the URL.

make sure ``` index.html ``` is in the same directory as ```ChatPlaysChess.js``` file.

it will start showing moves when it's chat's turn to move.
