# ChessBot

## What is this ?
a twitch bot that gives you the ability to play against your twitch chat on lichess.

You (the streamer) will be playing on your Lichess account while Chat should be playing on another one.

## How can i play ?
First you need to install some stuff to make it work:

1. Download & Install nodejs on your computer (google that).
     

2. After doing that, now open cmd and install:

   - install twitch api library
     ``` npm install tmi.js ```

   - install axios request library
     ``` npm install axios ``` 
     




3. Now we need to set some variables:
    1. Twitch account that the bot will use (you can use your main one).
       - to give the bot control of your account we need a OAuth token, that you can get from [here](https://twitchapps.com/tmi/) (**DO NOT SHARE THIS TOKEN**)

    2. Lichess account that the chat will play on (i recommand that you create a new account)
       - we need a personal token to give the bot permission to use the Lichess account, get the token from [here](https://lichess.org/account/oauth/token)
       - create a new personal token and these are the permissions you should give it:
         - Read preferences
         - Create, accept, decline challenges
         - Play games with the board API
         - Play games with the bot API

    3. Go to the PastaChess.js file and replace:
       - ```YOUR_LICHESS_TOKEN``` with your Lichess token
       - ```oauth:PUT_YOUR_AUTH_KEY_HERE``` with your Twitch OAuth token, make sure to include the ```oauth:```



4. We need to tell the bot which channel it should join. to do that:
   - search for a variable named ```streamer``` and replace its value with the desired twitch channel

5. We need to tell the bot who can use the commands. to do that:
   - search for an array named ```allowedToUseCommands``` and add twitch usernames of the people who can use the commands. (IMPORTANT: usernames are case sensitive: if your twitch username apppears as ```aTwitchUSERNAMELOL``` in chat you should type it the same way in the array. meaning if you instead add ```atwitchusernamelol``` to the array, this will not let you execute bot commands in chat, because the bot won't recognize your name).


## I Did everything above. Now wot ?

Now you can run it by simply typing ```node PastaChess.js``` in ```cmd``` or however you want.

if everything works fine, you'll see ```Bot is Connected``` in your chat. otherwise, you can whisper me on [Twitch](https://www.twitch.tv/xsplasher) or DM me on discord xSplasher#3998 i'll help you.

### Quick Start

in chat type ```!challon``` then ```!challengeme LichessUsernameToBeChallenged``` you have 10-13 seconds to accept the challenge. 
enter moves in chat like this ```!a1a8``` ```!c1f4``` squares only.


### More Details

- __```!e2e4``` is how you vote, want to move the knight on g1 to f3 ? type ```!g1f3``` castle king side as white ? ```!e1g1```__

- __```!challon``` Make Challenge On__
  - after executing this everybody in chat can send a challenge

- __```!challoff``` Make Challenge Off__

- __```!challengeme LichessUsernameToBeChallenged``` Make chat play a casual game against someone on Lichess (You or a viewer, could be anybody on lichess)__
  - requires ```!challon```
  - you have 10-13 seconds to accept the challenge otherwise you have to type !challon again and execute !challengeme
  - if you want to change the game settings, like time control etc, check the function named ```Challenge```:
    - Clock: change ```clock``` variable to the desired value in seconds.
    - Color: change ```playercolor``` variable to ```white``` ```black``` or ```random```
    - Increment: change ```icr``` variable to the desired value in seconds.
    - Game Type: change ```rated``` variable to ```true``` to play a Rated game, or ```false``` for a Casual one (IMPORTANT: i do NOT recommand you to play a rated game, your account could be banned, please keep this variable always ```false``` unless you're willing to take the risk of getting banned).

- __```!createbotgame``` Make chat play a game against Stockfish__
  - if you want to change the AI game setting, check the function named ```PlayVsBot```:
    - Level: change ```lvl``` variable: 1-8 from easiest to hardest.
    - Color: change ```color``` variable to ```white``` ```black``` or ```random```
    - Increment: change ```icr``` variable to the desired value in seconds.
    


- __```!seek``` Make chat play against a random person on Lichess (Not heavily tested)__
  - if you want to change the game settings, like time control etc, check the function named ```SeekGame```:
    - Same as Challenge function except; Clock: change ```timeinMinutes``` variable to the desired value in minutes.
    
- __```!resign``` Resign the game currently playing__
   
- __```!cont``` to Continue a game already playing (if you stopped the bot in the middle game and want to continue)__

- __```!showgameid``` Shows game id and link to spectate the game.__
    
