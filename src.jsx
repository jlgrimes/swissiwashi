class Initialize extends React.Component {
    constructor() {
        super();
        this.state = {players: players};
        this.handleChange = this.handleChange.bind(this);
        this.startTournament = this.startTournament.bind(this);
        this.loadPreset = this.loadPreset.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);
    }
    
    handleChange(event) {
        this.setState({newPlayer: event.target.value});
    }
    
    addPlayer() {
        if (this.state.newPlayer == undefined || this.state.newPlayer == "") {
            alert("Please input a name");
            return;
        }
        
        if (findPlayer(this.state.newPlayer)) {
            alert("Please input a unique name");
            return;
        }
        
        players.push({
            name: this.state.newPlayer,
            wins: 0,
            ties: 0,
            losses: 0,
            played: [],
            byes: 0
        });
        this.setState({
            players
        });
        
        $("#player-input").val("");
    }
    
    deletePlayer(e) {
        $("[id='" + e.target.id + "']").remove();
    }
    
    loadPreset() {
        players = JSON.parse(JSON.stringify(presetPlayers));
        this.setState({players: presetPlayers});
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
            <div class="container">
                <h2>POM</h2>
                <h4>Packala Open Manager</h4>
                <input placeholder="Enter player name" id="player-input" onChange={this.handleChange} />
                <button onClick={() => this.addPlayer()} class="btn">Enter Player</button>
                <button onClick={() => this.startTournament()} class="btn">Start Tournament</button>
                <ul>
                    {players.map(p => <li onClick={(e) => this.deletePlayer(e)} id={p.name}>{p.name}</li>)}
                </ul>
                <button class="btn btn-primary" onClick={() => this.loadPreset()}>Load Preset Players</button>
                <p>Click on a player to drop them from the tournament (coming soon)</p>
            </div>
        );
    }
}

let newPairings = () => {
    players.sort(comparePlayers);
    pairings = [];
    
    // Accounting for the bye in the ORIGINAL players array
    if (players.length % 2 != 0) {
        players[players.length - 1].wins++;
        players[players.length - 1].byes++;
    }

    let tempPlayers = JSON.parse(JSON.stringify(players));
    
    // Pushing the bye pairing
    if (tempPlayers.length % 2 != 0) {
        pairings.push({
                first: tempPlayers[tempPlayers.length - 1],
                second: "bye"
            });
        
        // We don't want to include this player in for pairing
        tempPlayers.pop();
    }

    while (tempPlayers.length > 0) {
        let matchPointTierBegin = 0;
        let matchPointTierEnd = tempPlayers.map(p => matchPoints(p)).lastIndexOf(matchPoints(tempPlayers[1]));
        
        //console.log(matchPointTierEnd);
        
        // We're going to extend the range of the match point tier range to 2 if need be in order to accomodate an odd number of players in a match point tier
        let matchPointTierRange = matchPointTierEnd - matchPointTierBegin;
        
        //console.log("range " + matchPointTierRange);
        
        let firstPlayerPos = Math.floor(Math.random() * matchPointTierRange)
        //let firstPlayerPos = Math.floor(Math.random() * tempPlayers.length);
        let firstPlayer = findPlayer(tempPlayers[firstPlayerPos].name);
        tempPlayers.splice(firstPlayerPos, 1);

        
        let secondPlayerPos = Math.floor(Math.random() * matchPointTierRange);
        let secondPlayer = findPlayer(tempPlayers[secondPlayerPos].name);
        tempPlayers.splice(secondPlayerPos, 1);
        
        //console.log(firstPlayer);

        pairings.push({
            first: firstPlayer,
            second: secondPlayer
        });
    }
}

class GeneratePairings extends React.Component {
        constructor(props) {
            super(props);
            this.displayPlayer = this.displayPlayer.bind(this);
            this.handleClick = this.handleClick.bind(this);
            
            newPairings();
            this.state = {players: props.players};
        }
    
        displayPlayer(p) {
            //this.setState({players: players});
            //alert(p.name + " " + p.wins);
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
            
            // Adds win/losses to player objects            
            thisPlayerObj.wins++;
            nextPlayerObj.losses++;
            
            // Marks that each player has played one another
            thisPlayerObj.played.push(nextPlayerObj.name);
            nextPlayerObj.played.push(thisPlayerObj.name);
            
            matchesComplete++;
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
        this.endTournament = this.endTournament.bind(this);
    }
    
    nextRound() {
        if (matchesComplete < pairings.length) {
            M.toast({html: 'Please complete all pairings to generate a new round'})
            return;
        }
        
        let r = this.state.round + 1;
        this.setState({round: r});
        
        $(".round-complete").removeClass("round-complete")
        
        newPairings();
        matchesComplete = 0;
        $("#bye").parent().addClass("round-complete");
    }
    
    endTournament() {
        ReactDOM.render(
            <Results />,
            document.getElementById('root')
        );
    }
    
    render() {   
        return (
            <div>
                <h1 id="round-number">Round {this.state.round}</h1>
                <GeneratePairings players={players} />
                <button class="btn" onClick={() => this.nextRound()}>Next Round</button>
                <button class="btn" onClick={() => this.endTournament()}>End Tournament</button>
            </div>
        );
    }
}

class Results extends React.Component {
    constructor() {
        super();
        players.sort(comparePlayersIncludeResistance);
        
        this.newTournament = this.newTournament.bind(this);
    }
    
    newTournament() {
        players = [];
        ReactDOM.render(
            <Initialize />,
            document.getElementById('root')
        );
    }
    
    render() {
        return (
            <div>
                <h1>Final Standings</h1>
                <ul class="collapsible">
                    {players.map(p => <li id={p.name} onClick={(e) => this.handleClick(e)}>{p.name + " (" + p.wins + "-" + p.ties + "-" + p.losses + ") " + resistanceDisplay(p) + "%"} </li>)}
                </ul>
                <button class="btn" onClick={() => this.newTournament()}>New Tournament</button>
            </div>
        );
    }
}
    

let players = [];

let presetPlayers = [{
    name: 'Jared',
    wins: 0,
    ties: 0,
    losses: 0,
    played: [],
    byes: 0
}, {
    name: 'Kenward',
    wins: 0,
    ties: 0,
    losses: 0,
    played: [],
    byes: 0
}, {
    name: 'Schemanske',
    wins: 0,
    ties: 0,
    losses: 0,
    played: [],
    byes: 0
}, {
    name: 'Slow boi',
    wins: 0,
    ties: 0,
    losses: 0,
    played: [],
    byes: 0
}, {
    name: 'REEEE',
    wins: 0,
    ties: 0,
    losses: 0,
    played: [],
    byes: 0
}, {
    name: 'Bulu gang',
    wins: 0,
    ties: 0,
    losses: 0,
    played: [],
    byes: 0
}];

let pairings = [];

let matchesComplete = 0;

let findPlayer = (name) => {
    for (let p in players)
        if (players[p].name == name)
            return players[p];
    
    return false;
};

let matchPoints = player => player.wins * 3 + player.ties;

let winPercentage = player => Math.max(0.25, (resistanceWins(player) + player.ties / 2) / (resistanceWins(player) + player.ties + player.losses));

let resistance = (player) => {
    let resistanceTotal = 0;
    for (let p in player.played)
        resistanceTotal += winPercentage(findPlayer(player.played[p]));
    
    resistanceTotal /= player.played.length;
    return resistanceTotal;
}

let resistanceWins = player => player.wins - player.byes;

let resistanceDisplay = player => resistance(player).toFixed(4) * 100;

function comparePlayers(thisPlayer, nextPlayer) {
    // We want the list in descending order
    return matchPoints(thisPlayer) < matchPoints(nextPlayer);
}

function comparePlayersIncludeResistance(thisPlayer, nextPlayer) {
    if (matchPoints(thisPlayer) == matchPoints(nextPlayer))
        return resistance(thisPlayer) < resistance(nextPlayer);
    
    return comparePlayers(thisPlayer, nextPlayer);
}

ReactDOM.render(
    <Initialize />,
    document.getElementById('root')
);