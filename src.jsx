class Initialize extends React.Component {
    constructor(props) {
        super(props);
        this.state = {players: props.players};
        this.handleChange = this.handleChange.bind(this);
        this.startTournament = this.startTournament.bind(this);
    }
    
    handleChange(event) {
        this.setState({newPlayer: event.target.value});
    }
    
    addPlayer() {
        let players = this.state.players;
        players.push({name: this.state.newPlayer, wins: 0, ties: 0, losses: 0, played: []});
        this.setState({players});
    }
    
    startTournament() {
        ReactDOM.render(
            <Pairings players={players} pairings={pairings}/>,
            document.getElementById('root')
        );
    }
    
    render() {
        let players = this.state.players;
        return (
            <div>
                <input onChange={this.handleChange} />
                <button onClick={() => this.addPlayer()}>Enter Player</button>
                <button onClick={() => this.startTournament()}>Start Tournament</button>
                <ul>
                    {players.map(p => <li key={p.name}>{p.name}</li>)}
                </ul>
            </div>
        );
    }
}

class GeneratePairings extends React.Component {
        constructor(props) {
            super(props);
            this.state = {players: props.players};
            let tempPlayers = JSON.parse(JSON.stringify(props.players));

            while (tempPlayers.length > 0) {
                let firstPlayerPos = Math.floor(Math.random() * tempPlayers.length);
                let firstPlayer = findPlayer(tempPlayers[firstPlayerPos].name);
                tempPlayers.splice(firstPlayerPos, 1);

                // This is where we manipulate the bye
                if (tempPlayers.length == 0) {
                    firstPlayer.wins++;
                    pairings.push({first: firstPlayer, second: "bye"});
                }
                
                else {
                    let secondPlayerPos = Math.floor(Math.random() * tempPlayers.length);
                    let secondPlayer = findPlayer(tempPlayers[secondPlayerPos].name);
                    tempPlayers.splice(secondPlayerPos, 1);

                    pairings.push({first: firstPlayer, second: secondPlayer});
                }
            }

            this.displayPlayer = this.displayPlayer.bind(this);
            this.handleClick = this.handleClick.bind(this);
        }
    
        displayPlayer(p) {
            if (p == "bye")
                return <div class="col-sm" id="bye">BYE</div>;
            return (
                <div class="col-sm" id={p.name} onClick={(e) => this.handleClick(e)}>{p.name + " (" + p.wins + "-" + p.ties + "-" + p.losses + ") " + resistanceDisplay(p) + "%"}</div>
            );
        }
    
        handleClick(e) {
            // Make sure we don't already have a result
            if (e.target.parentElement.classList.contains('round-complete'))
                return;
            
            // Say we have a result
            e.target.parentElement.classList.add('round-complete');
            
            // Find the name of the next player
            let nextPlayer;
            if (e.target.previousSibling == null)
                nextPlayer = e.target.nextSibling.nextSibling.id;
            else
                nextPlayer = e.target.previousSibling.previousSibling.id;
            
            // We don't care about byes
            if (nextPlayer == "bye")
                return;
            
            // Convert the names of the two players into objects
            let thisPlayerObj = findPlayer(e.target.id);
            let nextPlayerObj = findPlayer(nextPlayer);

            // Don't add more than one match result
            if (thisPlayerObj.played.includes(nextPlayerObj))
                return;
            
            // Adds win/losses to player objects            
            thisPlayerObj.wins++;
            nextPlayerObj.losses++;
            
            // Marks that each player has played one another
            thisPlayerObj.played.push(nextPlayerObj);
            nextPlayerObj.played.push(thisPlayerObj);
            
            this.setState({players: players});
        }

        render() {
            return (
                <div>{pairings.map(p => 
                    <div class="row">
                        {this.displayPlayer(p.first)}
                        <div class="col-sm"> vs </div>
                        {this.displayPlayer(p.second)}
                    </div>
                )}</div>
            );
        }
    }

class Pairings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {round: 1};
        this.nextRound = this.nextRound.bind(this);
    }
    
    nextRound() {
        let r = this.state.round + 1;
        this.setState({round: r});
    }
    
    render() {   
        return (
            <div>
                <h1 id="round-number">Round {this.state.round}</h1>
                <GeneratePairings players={players} />
                <button onClick={() => this.nextRound()}>Next Round</button>
            </div>
        );
    }
}
    

let players = [{name: 'Jared', wins: 6, ties: 0, losses: 0, played: []}, {name: 'Kenward', wins: 3, ties: 0, losses: 3, played: []}];
let pairings = [];

let findPlayer = (name) => {
    for (let p in players)
        if (players[p].name == name)
            return players[p];
};

let matchPoints = player => player.wins * 3 + player.ties;

let winPercentage = player => (player.wins + player.ties / 2) / (player.wins + player.ties + player.losses);

let resistance = (player) => {
    let resistanceTotal = 0;
    for (let p in player.played)
        resistanceTotal += winPercentage(player.played[p]);
    
    resistanceTotal /= player.played.length;
    return resistanceTotal;
}

let resistanceDisplay = player => resistance(player).toFixed(4) * 100;

function comparePlayers(thisPlayer, nextPlayer) {
    return matchPoints(thisPlayer) < matchPoints(nextPlayer);
}

ReactDOM.render(
    <Initialize players={players} />,
    document.getElementById('root')
);