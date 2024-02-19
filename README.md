<b>Got Your Card</b> is a multiplayer social deduction game where you and a group of people you know well (or <i>think</i> you do) ask questions anonymously, then each player answers the others' questions.

Finally you have to match each answer to your question with the player you think gave said answer. You get a point for each correct match.

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


