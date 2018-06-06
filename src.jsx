class Initialize extends React.Component {
    constructor() {
        super();
        this.state = {players: players};
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleRoundChange = this.handleRoundChange.bind(this);
        this.startTournament = this.startTournament.bind(this);
        this.loadPreset = this.loadPreset.bind(this);
        this.addPlayer = this.addPlayer.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);
        
        matchesErrorState = false;
        $("#number-rounds").val(0);
        
        numRounds = recommendedRounds();
        this.forceUpdate();
    }
    
    handleNameChange(event) {
        this.setState({newPlayer: event.target.value});
    }
    
    handleRoundChange(event) {
        numRounds = event.target.value;
        this.forceUpdate();
    }
    
    handleKeyPress(target) {
        if(target.charCode==13)
            this.addPlayer();
    }
    
    addPlayer() {
        if (this.state.newPlayer == undefined || this.state.newPlayer == "") {
            toast("Please input a name");
            return;
        }
        
        if (findPlayer(this.state.newPlayer)) {
            toast("Please input a unique name");
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
        toast(this.state.newPlayer + " added!");
        numRounds = recommendedRounds();
        
        numRounds = recommendedRounds();
        this.forceUpdate();
    }
    
    deletePlayer(e) {
        toast(e.target.id + " dropped!");
        players.splice(players.findIndex(p => p.name == e.target.id), 1);
        $("[id='" + e.target.id + "']").remove();
        
        numRounds = recommendedRounds();
        this.forceUpdate();
    }
    
    loadPreset() {
        players = JSON.parse(JSON.stringify(presetPlayers));
        this.setState({players: presetPlayers});
        toast("Preset loaded!");
        //$("#number-rounds").val(recommendedRounds());
        numRounds = recommendedRounds();
        this.forceUpdate();
    }
    
    startTournament() {
        shuffle(players);
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
                <a href="https://github.com/comp0cker/pom">Open-Sourced</a>
                
                <div class="row">
                    <div class="input-field">
                        <input type="number" value={numRounds} id="number-rounds" placeholder="Number of Rounds" onChange={this.handleRoundChange} />
                        <label class="active" for="number-rounds">Number of Rounds</label>
                        <span class="helper-text" for="number-rounds">Recommended: {recommendedRounds()}</span>
                    </div>
                </div>
                
                <div class="row">
                    <input placeholder="Enter player name" id="player-input" onChange={this.handleNameChange} onKeyPress={(e) => this.handleKeyPress(e)} />
                </div>
                <button onClick={() => this.addPlayer()} class="btn"><i class="material-icons left">person_add</i>Enter Player</button>
                <button onClick={() => this.startTournament()} class="btn"><i class="material-icons left">input</i>Start Tournament</button>
                <div id="pairings" class="collection">
                    {players.map(p => <a class="collection-item" onClick={(e) => this.deletePlayer(e)} id={p.name}>{p.name}</a>)}
                </div>
                <button class="btn btn-primary" onClick={() => this.loadPreset()}><i class="material-icons left">file_download</i>Load Preset Players</button>
            </div>
        );
    }
}

let newPairings = () => {
    matchesComplete = 0;
    players.sort(comparePlayers);
    pairings = [];
    
    // Accounting for the bye in the ORIGINAL players array
    if (players.length % 2 != 0) {
        players[players.length - 1].wins++;
        players[players.length - 1].byes++;
        matchesComplete++;
        //toast(matchesComplete);
    }

    let tempPlayers = JSON.parse(JSON.stringify(players));
    let byePlayer = ""; // if we need to store the bye player
    
    // Pushing the bye pairing
    if (tempPlayers.length % 2 != 0) {
        byePlayer = {
                first: JSON.parse(JSON.stringify(tempPlayers[tempPlayers.length - 1])),
                second: "bye"
            };
        
        // We don't want to include this player in for pairing
        tempPlayers.pop();
    }

    console.log("begin");
    while (tempPlayers.length > 0) {
        let matchPointTierBegin = 1;
        let matchPointTierEnd = tempPlayers.map(p => matchPoints(p)).lastIndexOf(matchPoints(tempPlayers[1]));
        
        //console.log(matchPointTierEnd);
        
        // We're going to extend the range of the match point tier range to 2 if need be in order to accomodate an odd number of players in a match point tier
        let matchPointTierRange = matchPointTierEnd - matchPointTierBegin;
        
        //console.log("range " + matchPointTierRange);
        
        let firstPlayerPos = 0;
        let firstPlayer = findPlayer(tempPlayers[firstPlayerPos].name);
        tempPlayers.splice(firstPlayerPos, 1);
        
        let secondPlayerPos = Math.floor(Math.random() * matchPointTierRange);
        let secondPlayer = findPlayer(tempPlayers[secondPlayerPos].name);
        
        // WIPPPPPP
        let matchPointTierSpliced = range(0, matchPointTierRange); 
        let restOfPlayersSpliced = range(matchPointTierRange, tempPlayers.length);
        
        let newSecondPlayerPos = '', newSecondPlayerPosPos = '';
        while (findPlayedIndex(firstPlayer, secondPlayer.name) && matchPointTierSpliced.length > 0) {
            if (matchPointTierSpliced.length > 1) {
                newSecondPlayerPosPos = Math.floor(Math.random() * matchPointTierSpliced.length);
                newSecondPlayerPos = matchPointTierSpliced[newSecondPlayerPosPos];
                secondPlayerPos = newSecondPlayerPos;
                secondPlayer = findPlayer(tempPlayers[newSecondPlayerPos].name);
            }
            else {
                newSecondPlayerPosPos = 0;
            }
            matchPointTierSpliced.splice(newSecondPlayerPosPos, 1);
        }
        
        while (findPlayedIndex(firstPlayer, secondPlayer.name) && restOfPlayersSpliced.length > 0) {
            //console.log('second loop');
            if (restOfPlayersSpliced.length > 1) {
                newSecondPlayerPosPos = Math.floor(Math.random() * restOfPlayersSpliced.length);
                newSecondPlayerPos = restOfPlayersSpliced[newSecondPlayerPosPos];
                secondPlayerPos = newSecondPlayerPos;
                secondPlayer = findPlayer(tempPlayers[newSecondPlayerPos].name);
            }
            else {
                newSecondPlayerPosPos = 0;
            }
            
           restOfPlayersSpliced.splice(newSecondPlayerPosPos, 1);
        }
        
        if (findPlayedIndex(firstPlayer, secondPlayer.name)) {
            toast("No pairings possible.");
            matchesComplete = pairings.length;
            matchesErrorState = true;
            round--;
            $(".collection-item").addClass("active");
            return;
        }
        
        tempPlayers.splice(secondPlayerPos, 1);
        
        //console.log(firstPlayer);

        pairings.push({
            first: firstPlayer,
            second: secondPlayer
        });
    }
    
    if (byePlayer != "")
        pairings.push(byePlayer);
    
    pairingsHistory.push(JSON.parse(JSON.stringify(pairings)));
    currentPairings = pairings;
    
    rounds.push(round);
    
    $(".active").removeClass("active")
}

class GeneratePairings extends React.Component {
        constructor(props) {
            super(props);
            this.displayPlayer = this.displayPlayer.bind(this);
            this.handleWin = this.handleWin.bind(this);
            this.handleTie = this.handleTie.bind(this);
            
            // If it's on the pairings page, generate new pairings. Else, recall the round we were on
            newPairings();
            this.state = {players: props.players};
        }
    
        componentDidMount() {
            M.AutoInit();
        }
    
        displayPlayer(p) {
            //this.setState({players: players});
            //alert(p.name + " " + p.wins);
            if (p == "bye")
                return <div class="col s6" id="bye">BYE</div>;
            return (
                <div class="col s6" id={p.name} onClick={(e) => this.handleWin(e)}>{displayPlayer(p)}</div>
            );
        }
    
        handleWin(e) {
            // Make sure we don't already have a result
            if (e.target.parentElement.classList.contains('active'))
                return;
            
            // Say we have a result
            e.target.parentElement.classList.add('active');
            
            // Convert the names of the two players into objects
            let thisPlayerObj = findPlayer(e.target.id);
            let nextPlayerObj = getPairedPlayerHTML(e.target);
            
            // Adds win/losses to player objects            
            thisPlayerObj.wins++;
            nextPlayerObj.losses++;
            
            // Marks that each player has played one another
            thisPlayerObj.played.push({name: nextPlayerObj.name, result: "win"});
            nextPlayerObj.played.push({name: thisPlayerObj.name, result: "loss"});
            
            matchesComplete++;
            //this.setState({players: players});
            this.forceUpdate();
            //currentPairings = pairingsHistory[pairingHistory.length - 1];
        }
    
    handleTie(e) {
                    // Make sure we don't already have a result
            if (e.target.parentElement.classList.contains('active'))
                return;
            
            // Say we have a result
            e.target.parentElement.classList.add('active');
            
            // Find the name of the next player
            let thisPlayer = e.target.previousSibling.id, nextPlayer = e.target.nextSibling.id;

            if (nextPlayer == "bye")
                return;
            
            // Convert the names of the two players into objects
            let thisPlayerObj = findPlayer(thisPlayer);
            let nextPlayerObj = findPlayer(nextPlayer);
            
            // Adds win/losses to player objects            
            thisPlayerObj.ties++;
            nextPlayerObj.ties++;
            
            // Marks that each player has played one another
            thisPlayerObj.played.push({name: nextPlayerObj.name, result: "tie"});
            nextPlayerObj.played.push({name: thisPlayerObj.name, result: "tie"});
            
            matchesComplete++;
            this.setState({players: players});
            
            //currentPairings = pairingsHistory[pairingHistory.length - 1];
    }

        render() {
            return (
                <div>
                <div class="collection">{currentPairings.map((p, i) => 
                    <div class="row collection-item">
                        {this.displayPlayer(p.first)}
                        <div class="col s6 center-align" onClick={(e) => this.handleTie(e)}> vs </div>
                        {this.displayPlayer(p.second)}
                    </div>
                )}</div>
                </div>
            );
        }
    }

let renderUnclickablePlayers = () => <div>
                <div class="collection">{currentPairings.map((p, i) => 
                    <div class="row collection-item">
                        {displayPlayer(p.first)}
                        <div class="col s6 center-align"> vs </div>
                        {displayPlayer(p.second)}
                    </div>
                )}</div>
                </div>

class Pairings extends React.Component {
    constructor(props) {
        super(props);
        round = 1;
        this.nextRound = this.nextRound.bind(this);
        this.endTournament = this.endTournament.bind(this);
        this.loadRound = this.loadRound.bind(this);
        this.renderRounds = this.renderRounds.bind(this);
        this.newTournament = this.newTournament.bind(this);
        this.renderTabBar = this.renderTabBar.bind(this);
        this.dropPlayer = this.dropPlayer.bind(this);
    }
    
    componentDidMount() {
         M.AutoInit();
        $("#bye").parent().addClass("active");
    }
    
    componentDidUpdate() {
         M.AutoInit();
    }
    
    nextRound() {
        if (round == numRounds) {
            currentPairings = pairingsHistory[0];
            this.endTournament();
            return;
        }
        if (matchesErrorState) {
            toast("Still no pairings possible.");
            return;
        }
        if (matchesComplete < pairings.length) {
            //toast("matchescomplete " + matchesComplete + " vs " + pairings.length);
            toast('Please complete all pairings to generate a new round');
            return;
        }
        
        round++;
        
        newPairings();
        $("#bye").parent().addClass("active");
        
        this.forceUpdate();
    }
    
    loadRound(r) {
        console.log(pairingsHistory);
        currentPairings = pairingsHistory[r - 1];
        console.log(currentPairings);
        
        this.forceUpdate();
    }
    
    endTournament() {
        players.sort(comparePlayersIncludeResistance);
        currentPairings = pairingsHistory[0];
        round = "DONE";
        this.forceUpdate();
        /* Old implementation with Results component
        ReactDOM.render(
            <Results />,
            document.getElementById('root')
        );
        */
    }
    
    newTournament() {
        players = [];
        pairingsHistory = [];
        rounds = [];
        matchesErrorState = false;
        ReactDOM.render(
            <Initialize />,
            document.getElementById('root')
        );
    }
    
    renderTabBar() {
        return (
            <div class="row">
                    <div class="col s12">
                      <ul class="tabs">{
                              rounds.map(r => <li class="tab col s3">
                                             <a onClick={() => this.loadRound(r)}>
                                                 {renderTab(r)}
                                             </a>
                                         </li>)}
                      </ul>
                    </div>
                </div>
        );
    }
    
    dropPlayer() {
        var name = $("#dropped-player-name").val();
        
        // Returns an exception if the player entered is not in the tournament
        if (!findPlayer(name)) {
            toast(name + " is not in the tournament!");
            return;
        }
        
        let HTMLplayerDropped = document.getElementById(name);
        
        // If the player dropped hasn't completed their round yet, give the other player the win
        if (!HTMLplayerDropped.parentElement.classList.contains("active")) {
            let HTMLpairedPlayer = getPairedPlayerHTML(HTMLplayerDropped);
            console.log(HTMLpairedPlayer.name);
            HTMLpairedPlayer.wins++;
            HTMLplayerDropped.parentElement.classList.add("active");
            this.forceUpdate();
        }
        
        players.splice(findPlayerIndex(name), 1);
        
        toast(name + " has been dropped!");
        
        // Destroys the modal
        var instance = M.Modal.getInstance(document.getElementById("drop-modal"));
        instance.close();
    }
    
    renderRounds() {
        if (round != "DONE" && round <= numRounds) {
            return(<div class="container">
                <h1 id="round-number">Round {round}</h1>
                <p>Click on a player to assign the win, and click on vs to assign both players the tie.</p>
                <GeneratePairings round={0} />
                <button class="btn" onClick={() => this.nextRound()}><i class="material-icons left">forward</i>Next Round</button>
                <button class="btn" onClick={() => this.endTournament()}><i class="material-icons left">done</i>End Tournament</button>
                <a class="waves-effect waves-light btn modal-trigger" href="#drop-modal"><i class="material-icons left">remove_circle</i>Drop Player</a>

              <div id="drop-modal" class="modal">
                <div class="modal-content">
                  <h4>Drop Player</h4>
                  <p>Type the name of the player you'd like to drop</p>
                    <input id="dropped-player-name"></input>
                </div>
                <div class="modal-footer">
                  <button class="btn" onClick={() => this.dropPlayer()}>Drop</button>
                </div>
              </div>
                    
            </div>);
                              }
        else {
            //currentPairings = pairingsHistory[0];
            return (
            <div class="container">
                <h1>Final Standings</h1>
                {this.renderTabBar()}
                {renderUnclickablePlayers()}
                <p>Click on each player to view their matchups</p>
                <ul class="collapsible">
                    {players.map((p, i) => <li> 
                                     <div class="collapsible-header" id={p.name}>{addOne(i) + ". " + displayPlayer(p)}</div>
                                     
                                     <div class="collapsible-body">
                                         <ul>
                                        {p.played.map((q, j) =>
                                                       <li>Round {addOne(j)} {q.name} - {q.result}</li>
                                                       )}
                                        </ul>
                                     </div> 
                                 </li>)}
                </ul>
                <button class="btn" onClick={() => this.newTournament()}>New Tournament</button>
            </div>
        );
        }
    }
    
    render() {   
        return (
            this.renderRounds()
        );
    }
}

let addOne = (i) => i + 1;

let players = [];
let pairings = [];
let currentPairings = pairings;
let pairingsHistory = [];
let rounds = [];
let round;
let numRounds;

// From https://bocoup.com/blog/find-the-closest-power-of-2-with-javascript
function recommendedRounds() {
    return Math.round(Math.log(players.length) / Math.log(2));
}

let matchesErrorState;

function range (lowerBound, upperBound) {
    let arr = [];
    
    for (let i = lowerBound; i < upperBound; i++)
        arr.push(i);
    
    return arr;
}

function newPlayer(players) {
    let obj = [];
    for (let p in players)
        obj.push({
            name: players[p],
            wins: 0,
            ties: 0,
            losses: 0,
            played: [],
            byes: 0
        });
    
    return obj;
}

function renderTab(r) {
    if (Number.isInteger(r))
        return ("Round " + r);
    return r;
}

let presetPlayers = newPlayer(['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10']);

let matchesComplete;

let matchPoints = player => player.wins * 3 + player.ties;

function displayPlayer(p) {
    if (p == "bye") return "BYE";
    return (p.name + " (" + wins(p) + "-" + p.losses + "-" + p.ties + " (" + matchPoints(p) + ")) " + resistanceDisplay(p) + "%");
} 

let wins = player => player.wins;

let findPlayer = (name) => {
    for (let p in players)
        if (players[p].name == name)
            return players[p];
    
    return false;
};

let findPlayerIndex = (name) => {
    for (let p in players)
        if (players[p].name == name)
            return p;
    
    return -1;
};

function findPlayedIndex(player, playedName) {
    for (let p in player.played)
        if (player.played[p].name == playedName)
            return p;
    
    return false;
}

function getPairedPlayerHTML(firstPlayer) {
    let nextPlayer;
    if (firstPlayer.previousSibling == null)
        nextPlayer = firstPlayer.nextSibling.nextSibling.id;
    else
        nextPlayer = firstPlayer.previousSibling.previousSibling.id;
    
    return findPlayer(nextPlayer);
}

let winPercentage = player => Math.max(0.25, (resistanceWins(player) + player.ties / 2) / (resistanceWins(player) + player.ties + player.losses));

let resistance = (player) => {
    if (player == "bye") return;
    
    let resistanceTotal = 0;
    for (let p in player.played)
        resistanceTotal += winPercentage(findPlayer(player.played[p].name));
    
    resistanceTotal /= player.played.length;
    return resistanceTotal;
}

let resistanceWins = player => player.wins - player.byes;

let resistanceDisplay = player => parseFloat(resistance(player)).toFixed(4) * 100;

function comparePlayers(thisPlayer, nextPlayer) {
    // We want the list in descending order
    return matchPoints(nextPlayer) - matchPoints(thisPlayer);
}

function comparePlayersIncludeResistance(thisPlayer, nextPlayer) {
    if (matchPoints(thisPlayer) == matchPoints(nextPlayer))
        return  resistance(nextPlayer) - resistance(thisPlayer);
    
    return comparePlayers(thisPlayer, nextPlayer);
}

function toast(text) { M.toast({html: text}) }

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

ReactDOM.render(
    <Initialize />,
    document.getElementById('root')
);