<b>Got Your Card</b> is a multiplayer social deduction game where you and a group of people you know well (or <i>think</i> you do) ask questions anonymously, then each player answers the others' questions.

Finally you have to match each answer to your question with the player you think gave said answer. You get a point for each correct match.

# How To Play
The game consists of 3 phases (Question, Answer, and Match). After setting your username and creating/joining a room, all players enter the question phase.

## Question Phase
Each player submits a question that they think every other player would answer in a way that gives them a clue as to gave that particular answer. Once
every player submits a question, the game moves to the Answer Phase.

## Answer Phase
Each player answers all questions but their own. Once all players answer all their given questions, the game moves to the Match Phase.

## Match Phase
Each player is shown every answer given to their own question and must match each answer to which player they think gave it. 1 point is awarded for each
correct match. After all matches are submitted the game transitions into a results screen where players can see the final scores as well as which questions were asked and who gave
which answer.

# Deployment
The backend and frontend have their own package.json to be run independently with the command "npm run start".
The following environment variables need to be defined in order for the frontend and backend to run:
## Frontend
If hosting the game server via https, change "ws" to "wss"
```
VITE_GAME_SERVER=ws://example.com
```

## Backend
CLIENT_ORIGIN is used for <a href="https://aws.amazon.com/what-is/cross-origin-resource-sharing/#:~:text=Cross%2Dorigin%20resource%20sharing%20(CORS,resources%20in%20a%20different%20domain.">CORS</a>. Set
it to the domain your frontend is served from.
```
CLIENT_ORIGIN=http://example.com
MONGODB_URL=mongodb://example.com/database
```


