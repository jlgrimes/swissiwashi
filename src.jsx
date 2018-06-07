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
            toastr.error("Please input a name");
            return;
        }
        
        if (findPlayer(this.state.newPlayer)) {
            toastr.error("Please input a unique name");
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
        toastr.success(this.state.newPlayer + " added!");
        numRounds = recommendedRounds();
        
        numRounds = recommendedRounds();
        this.forceUpdate();
    }
    
    deletePlayer(e) {
        toastr.success(e.target.id + " dropped!");
        //console.log(players.findIndex(p => p.name == e.target.id));
        players.splice(players.findIndex(p => p.name == e.target.id), 1);
        //$("[id='" + e.target.id + "']").remove();
        
        numRounds = recommendedRounds();
        //console.log(players);
        this.forceUpdate();
    }
    
    loadPreset() {
        players = JSON.parse(JSON.stringify(presetPlayers));
        this.setState({players: presetPlayers});
        toastr.success("Preset loaded!");
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
            <div class="container animated fadeIn" id="initialize">
                <h1>POM</h1>
                <h2>Packala Open Manager</h2>
                
                <div class="row">
                    <div class="md-form input-group col s6">
                        <input type="text" class="form-control" placeholder="Player name" id="player-input" onChange={this.handleNameChange} onKeyPress={(e) => this.handleKeyPress(e)} />
                      <div class="input-group-append">
                        <button class="btn btn-default waves-effect m-0" type="button" onClick={() => this.addPlayer()}>Enter</button>
                      </div>
                    </div>
                    
                    <div class="md-form input-group col s3">
                        <input type="number" value={numRounds} placeholder="Number of Rounds" class="form-control" id="number-rounds" onChange={this.handleRoundChange} />

                        <div class="input-group-append">
                            <span class="input-group-text" id="basic-addon2">Rounds</span>
                          </div>
                    </div>
                </div>
                
                <button onClick={() => this.startTournament()} class="btn btn-primary">Start Tournament</button>
                
                <button class="btn btn-default" onClick={() => this.loadPreset()}>Load Preset Players</button>
                
                <button class="btn btn-danger" onClick={() => {$("#initialize").addClass("animated hinge")}}>Destory this page</button>
                
                <h5 id="player-count">{displayPlayerCount()}</h5>
                
                <div id="pairings" class="list-group">
                    {players.map(p => <a class="list-group-item" onClick={(e) => this.deletePlayer(e)} id={p.name}>{p.name}</a>)}
                </div>
                
            </div>
        );
    }
}

let displayPlayerCount = () => {
    if (players.length == 1) return "1 player";
    return players.length + " players";
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
                second: "bye",
            complete: true
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
            toastr.error("No pairings possible.");
            matchesComplete = pairings.length;
            matchesErrorState = true;
            round--;
            //$(".collection-item").addClass("active");
            return;
        }
        
        tempPlayers.splice(secondPlayerPos, 1);
        
        //console.log(firstPlayer);

        pairings.push({
            first: firstPlayer,
            second: secondPlayer,
            complete: false
        });
    }
    
    //$(".active").removeClass("active")
    
    if (byePlayer != "")
        pairings.push(byePlayer);
    
    pairingsHistory.push(JSON.parse(JSON.stringify(pairings)));
    currentPairings = pairings;
    
    rounds.push(round);
    //this.forceUpdate();
}

class GeneratePairings extends React.Component {
        constructor(props) {
            super(props);
            this.displayPlayer = this.displayPlayer.bind(this);
            this.handleWin = this.handleWin.bind(this);
            this.handleTie = this.handleTie.bind(this);

            // If it's on the pairings page, generate new pairings. Else, recall the round we were on
            newPairings();
            
            // Reinitializes the filter bar
            searchQuery = "";
        }
    
        componentDidMount() {
            //M.AutoInit();
        }
    
        displayPlayer(p) {
            //this.setState({players: players});
            //alert(p.name + " " + p.wins);
            if (p == "bye")
                return <div class="col" id="bye">BYE</div>;
            return (
                <div class="col" id={p.name} onClick={(e) => this.handleWin(e)}>{displayPlayer(p)}</div>
            );
        }
    
        handleWin(e) {
            // Make sure we don't already have a result
            if (e.target.parentElement.parentElement.classList.contains('active'))
                return;
            
            // Say we have a result
            //e.target.parentElement.parentElement.classList.add('active');
            this.completePairing(e.target.id);
            
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
            if (e.target.parentElement.parentElement.classList.contains('active'))
                return;
            
            // Say we have a result
            //e.target.parentElement.parentElement.classList.add('active');  
        
            // Find the name of the next player
            let thisPlayer = e.target.previousSibling.id, nextPlayer = e.target.nextSibling.id;
        
            completePairing(thisPlayer);  

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
            this.forceUpdate();
            
            //currentPairings = pairingsHistory[pairingHistory.length - 1];
    }

        render() {
            return (
                <div>
                <div class="list-group">{currentPairings.filter(p => p.first.name.indexOf(searchQuery) >= 0 || (p.second != "bye" && p.second.name.indexOf(searchQuery) >= 0)).map((p, i) => 
                    <div class={"list-group-item pairing-item " + uh(p)}>
                                                                 <div class="row">
                        {this.displayPlayer(p.first)}
                        <div class="col" onClick={(e) => this.handleTie(e)}> vs </div>
                        {this.displayPlayer(p.second)}
                                                                 </div>
                    </div>
                )}</div>
                </div>
            );
        }
    }

let uh = (p) => {
    //console.log(p);
    if (p.complete) return "active ";
    return "";
}

let renderUnclickablePlayers = () => <div class="tab-content">{pairingsHistory.map((curr, currPos) =>
                <div id={"round-" + addOne(currPos)} class="list-group tab-pane fade">{curr.map((p, i) => 
                    <div class="list-group-item">
                    <div class="row">
                        {displayPlayer(p.first)}
                        <div class="col s6 center-align"> vs </div>
                        {displayPlayer(p.second)}
                    </div>
                   </div>
                )}</div>)}</div>;

class Pairings extends React.Component {
    constructor(props) {
        super(props);
        round = 1;
        
        this.nextRound = this.nextRound.bind(this);
        this.endTournament = this.endTournament.bind(this);
        this.renderRounds = this.renderRounds.bind(this);
        this.newTournament = this.newTournament.bind(this);
        this.renderTabBar = this.renderTabBar.bind(this);
        this.dropPlayer = this.dropPlayer.bind(this);
        this.updateTabs = this.updateTabs.bind(this);
        this.searchBarUpdate = this.searchBarUpdate.bind(this);
        this.shadeRoundResult = this.shadeRoundResult.bind(this);
    }
    
    componentDidMount() {
         //M.AutoInit();
        //$(".tabs").tabs({swipeable: true});
        //$("#bye").parent().parent().addClass("active");
    }
    
    componentDidUpdate() {
         //M.AutoInit();
        $('.collapse').collapse()
    }
    
    nextRound() {
        if (round == numRounds) {
            this.endTournament();
            return;
        }
        if (matchesErrorState) {
            toastr.error("Still no pairings possible.");
            return;
        }
        if (matchesComplete < pairings.length) {
            //toast("matchescomplete " + matchesComplete + " vs " + pairings.length);
            toastr.error('Please complete all pairings to generate a new round');
            return;
        }
        
        round++;
        
        newPairings();
        //$("#bye").parent().parent().addClass("active");
        
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

    updateTabs(r) {
        //window.location = "#round" + r
        //console.log("update");
        //var instance = M.Tabs.getInstance(document.getElementById("tabs"));
        //instance.updateTabIndicator();
    }
    
    renderTabBar() {
        return (
                <ul class="nav nav-pills mb-3" role="tablist">
                      {rounds.map(r => <li class="nav-item">
                                            <a class="nav-link" data-toggle="tab" href={"#round-" + r} role="tab">
                                                {renderTab(r)}
                                            </a>
                                        </li>)}
                </ul>
        );
    }
    
    dropPlayer() {
        var name = $("#dropped-player-name").val();
        
        // Returns an exception if the player entered is not in the tournament
        if (!findPlayer(name)) {
            toastr.error(name + " is not in the tournament!");
            return;
        }
        
        let HTMLplayerDropped = document.getElementById(name);
        
        // If the player dropped hasn't completed their round yet, give the other player the win
        if (!HTMLplayerDropped.parentElement.parentElement.classList.contains("active")) {
            let HTMLpairedPlayer = getPairedPlayerHTML(HTMLplayerDropped);
            console.log(HTMLpairedPlayer.name);
            HTMLpairedPlayer.wins++;
            
            completePairing(name);
            //HTMLplayerDropped.parentElement.parentElement.classList.add("active");
            matchesComplete++;
            this.forceUpdate();
        }
        
        players.splice(findPlayerIndex(name), 1);
        
        toastr.success(name + " has been dropped!");
    }
    
    renderRounds() {
        if (round != "DONE" && round <= numRounds) {
            return(<div class="container">
                <h1 id="round-number">Round {round}</h1>
                <p>Click on a player to assign the win, and click on vs to assign both players the tie.</p>
                
                <div class="md-form">
                    <i class="fa fa-search prefix"></i>
                    <input type="text" class="form-control" placeholder="Search for a player" onChange={(e) => this.searchBarUpdate(e)}></input>
                </div>
       
                <GeneratePairings round={0} />

                <button class="btn btn-primary" onClick={() => this.nextRound()}>Next Round</button>
                    
                <button class="btn btn-secondary" data-toggle="modal" data-target="#drop-modal">Drop Player</button>
                    
                <button class="btn btn-warning" onClick={() => this.endTournament()}>Force End Tournament</button>
                    
                <div class="modal fade" id="drop-modal" tabindex="-1" role="dialog" aria-labelledby="drop-modal-label" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="drop-modal-label">Drop Player</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <p>Type the name of the player you'd like to drop</p>
                                
                                <div class="md-form">
                                    <input type="text" id="dropped-player-name" class="form-control" placeholder="Player name"></input>
                                </div>
                                
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" onClick={() => this.dropPlayer()}>Drop</button>
                            </div>
                        </div>
                    </div>
                </div>
                    
            </div>);
                              }
        else {
            //currentPairings = pairingsHistory[0];
            return (
            <div class="container animated fadeIn">
                <h1>Final Standings</h1>
                {this.renderTabBar()}
                {renderUnclickablePlayers()}
                <p>Click on each player to view their matchups</p>
                <div id="accordion">
                    {players.map((p, i) => <div class="card"> 
                                     <div class="card-header" id={p.name}>
                                         <button class="btn btn-link" data-toggle="collapse" data-target={"#" + p.name + "-body"} aria-expanded="true" aria-controls={"#" + p.name + "-body"}>
                                          {addOne(i) + ". " + displayPlayer(p)}
                                        </button>
                                    </div>
                                     
                                     <div id={p.name + "-body"} class="collapse show" aria-labelledby={"#" + p.name} data-parent="#accordion">
                                         <div class="card-body">
                                             <ul class="list-group">
                                            {p.played.map((q, j) =>
                                                           <li class={"list-group-item " + this.shadeRoundResult(q.result)}>Round {addOne(j)} {q.name} - {q.result}</li>
                                                           )}
                                            </ul>
                                         </div> 
                                     </div>
                                 </div>)}
                </div>
                <button class="btn btn-primary" onClick={() => this.newTournament()}>New Tournament</button>
            </div>
        );
        }
    }
    
    shadeRoundResult(result) {
        if (result == "win") return "list-group-item-success";
        if (result == "tie") return "list-group-item-warning";
        if (result == "loss") return "list-group-item-danger";
    }
    
    searchBarUpdate(event) {
        searchQuery = event.target.value;
        this.forceUpdate()
        //console.log(searchQuery);
        
        //$(".pairing-item").addClass("animated bounce");
        
        //$(".pairing-item").each(() => {$(this).toggleClass("animated bounce")});
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
let searchQuery;

function recommendedRounds() {
    let n = players.length, off = 1;
    if (n == 15) off = 2;
    if (n && (n & (n - 1)) === 0) off = 0;
    return Math.log(1 << 31 - Math.clz32(n)) / Math.log(2) + off;
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

function completePairing(player) {
            for (let p in pairings)
                if (pairings[p].first.name == player || pairings[p].second.name == player)
                    pairings[p].complete = true;
        }

let matchPoints = player => player.wins * 3 + player.ties;

function displayPlayer(p) {
    if (p == "bye") return "BYE";
    //console.log(resistanceDisplay(p));
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
    return resistanceTotal * 100;
}

let resistanceWins = player => player.wins - player.byes;

let resistanceDisplay = player => Number.parseFloat(resistance(player)).toFixed(2);

function comparePlayers(thisPlayer, nextPlayer) {
    // We want the list in descending order
    return matchPoints(nextPlayer) - matchPoints(thisPlayer);
}

function comparePlayersIncludeResistance(thisPlayer, nextPlayer) {
    if (matchPoints(thisPlayer) == matchPoints(nextPlayer))
        return  resistance(nextPlayer) - resistance(thisPlayer);
    
    return comparePlayers(thisPlayer, nextPlayer);
}

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