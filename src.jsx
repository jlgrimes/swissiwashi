class Initialize extends React.Component {
    constructor() {
        super();
        this.state = {players: players};
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleRoundChange = this.handleRoundChange.bind(this);
        this.handlePresetChange = this.handlePresetChange.bind(this);
        this.startTournament = this.startTournament.bind(this);
        this.loadPreset = this.loadPreset.bind(this);
        this.loadUploadedTournament = this.loadUploadedTournament.bind(this); this.loadLocalTournament = this.loadLocalTournament.bind(this);
        this.addPlayer = this.addPlayer.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);
        this.displayLocalStorage = this.displayLocalStorage.bind(this);
        this.deleteLocalStorage = this.deleteLocalStorage.bind(this);
        
        matchesErrorState = false;
        $("#number-rounds").val(0);
        
        numRounds = recommendedRounds();
        this.forceUpdate();
        tournamentName = "";
        
        let arr = ["yo", "whats", "poppin", "people"];
        let spliced = arr.splice(0, 4);
        //arr.pop();
        console.log(arr);
        console.log(spliced);
    }
    
    handleNameChange(event) {
        this.setState({newPlayer: event.target.value});
    }
    
    handleRoundChange(event) {
        numRounds = event.target.value;
        this.forceUpdate();
    }
    
    handlePresetChange(event) {
        this.setState({presetNum: event.target.value});
    }
    
    handleKeyPress(target) {
        if(target.charCode==13)
            this.addPlayer();
    }
    
    handleKeyPressPreset(target) {
        if (target.charCode == 13)
            this.loadPreset();
    }
    
    addPlayer(name) {
        let alerts = true;
        if (name == undefined) name = this.state.newPlayer;
        else alerts = false;
        if (name == "bye") {
            toastr.warning("For the sake of not breaking the program, please don't name a player 'bye'.");
            return;
        }
        if (name == undefined || name == "") {
            toastr.error("Please input a name");
            return;
        }
        
        if (findPlayer(name)) {
            toastr.error("Please input a unique name");
            return;
        }
        
        players.push({
            name: name,
            wins: 0,
            ties: 0,
            losses: 0,
            played: [],
            byes: 0,
            resistance: undefined,
            oppResistance: undefined
        });
        this.setState({
            players
        });
    
        $("#player-input").val("");
        
        if (alerts)
            toastr.success(name + " added!");
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
        if (this.state.presetNum == undefined) {
            toastr.success("0 players loaded!");
            return;
        }
        //players = JSON.parse(JSON.stringify(presetPlayers));
        //this.setState({players: presetPlayers});
        players = [];
        for (let i = 0; i < this.state.presetNum; i++) {
            this.addPlayer("Player " + addOne(i));
            //$("#loading").text(i);
            this.forceUpdate();
        }
        toastr.success(this.state.presetNum + " players loaded!");
        //$("#number-rounds").val(recommendedRounds());
        numRounds = recommendedRounds();
        this.forceUpdate();
    }
    
    loadUploadedTournament() {
                var fileInput = document.getElementById('tournament-input');
        //var fileDisplayArea = document.getElementById('fileDisplayArea');

        var file = fileInput.files[0];
        var reader = new FileReader();

        reader.onload = function (e) {
            let tournament = JSON.parse(reader.result);
            loadTournament(tournament);
        }
        reader.readAsText(file);
    }
    
    loadLocalTournament(e) {
        let name = e.target.innerHTML.split(" <i")[0];
        //console.log(name);
        loadTournament(JSON.parse(localStorage.getItem(name)));
    }
    
    startTournament() {
        if (players.length == 0) {
            toastr.warning("You can't start a tournament with no players, silly");
            return;
        }
        shuffle(players);
        
        tournamentName = $("#tournament-name").val();
        if (tournamentName == "")
            tournamentName = "My Tournament";
        
        let date = new Date();
        let d = date.getDate();
        let m = date.getMonth() + 1;
        let y = date.getFullYear();
        date = m + "-" + d + "-" + y;
        //console.log(date);
        
        tournamentDate = date;
        
        ReactDOM.render(
            <Pairings players={players} pairings={pairings}/>,
            document.getElementById('root')
        );
    }
    
    displayLocalStorage() {
        let names = [];
        
        for (let key in localStorage) {
            if (key == "length")
                break;
            names.push(key);
        }

        return (
            <div class="list-group">
                {names.map( p => 
                           <a class="list-group-item" onClick={e => this.loadLocalTournament(e)}>{p} <i onClick={e => this.deleteLocalStorage(e)} class="fa fa-trash"></i></a>
                )}
            </div>
        );
    }
    
    deleteLocalStorage(e) {
        let name = e.target.parentElement.innerHTML.split(" <i")[0];
        localStorage.removeItem(name);
        toastr.success(name + " removed from local storage!");
        //localStorage.removeItem(e.target.parent)
        this.forceUpdate();
    }
    
    render() {
        let players = this.state.players;
        return (
            <div class="container" id="initialize">
            <div class="row">
            <img src="logo.png" class="logo"></img>
                <div class="col">
                    <h1>Swissiwashi</h1>
                    <h5>Swiss tournament generator made in React</h5>
                </div>
            </div>
                
                <div class="row">
                    <div class="md-form input-group col 6">
                            <input type="text" class="form-control" placeholder="Tournament name" id="tournament-name" />
                        </div>

                        <div class="md-form input-group col">
                            <input type="number" value={numRounds} placeholder="Number of Rounds" class="form-control" id="number-rounds" onChange={this.handleRoundChange} />

                            <div class="input-group-append">
                                <span class="input-group-text" id="basic-addon2">Rounds</span>
                              </div>
                        </div>
                </div>
                
                <div class="row">
                    
                    <div class="md-form input-group col s6">
                        <input type="text" class="form-control" placeholder="Player name" id="player-input" onChange={this.handleNameChange} onKeyPress={(e) => this.handleKeyPress(e)} />
                      <div class="input-group-append">
                        <button class="btn btn-primary waves-effect m-0" type="button" onClick={() => this.addPlayer()}>Enter</button>
                      </div>
                    </div>
                    
                    <div class="md-form input-group col s6">
                        <input type="number" class="form-control" placeholder="Number of default players" id="player-input" onChange={this.handlePresetChange} onKeyPress={(e) => this.handleKeyPressPreset(e)}/>
                      <div class="input-group-append">
                        <button class="btn btn-secondary waves-effect m-0" type="button" onClick={() => this.loadPreset()}>Load</button>
                      </div>
                    </div>
                </div>
                
                <button onClick={() => this.startTournament()} class="btn btn-primary">Start Tournament</button>
                
                <div class="btn btn-secondary" data-toggle="modal" data-target="#load-modal">Load Tournament</div>
                
                <div class="modal fade" id="load-modal" tabindex="-1" role="dialog" aria-labelledby="load-modal-label" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="load-modal-label">Load Tournament</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <p>Please choose a locally saved tournament, or upload a compatible json file.</p>
                                
                                {this.displayLocalStorage()}
                                
                                <div class="md-form">
                                    <input type="file" id="tournament-input" class="form-control" placeholder="Player name"></input>
                                </div>
                            </div>
                            
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" onClick={() => this.loadUploadedTournament()}>Load</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                
                <button class="btn btn-danger" onClick={() => {$("#initialize").addClass("animated hinge")}}>Destroy this page</button>
                
                <h5 id="player-count">{displayPlayerCount()}</h5>
                <p id="loading"></p>
                
                <div id="pairings" class="list-group">
                    {players.map(p => <a class="list-group-item" onClick={(e) => this.deletePlayer(e)} id={p.name}>{p.name}</a>)}
                </div>
                
            </div>
        );
    }
}

function loadTournament(tournament) {
        $('#load-modal').modal('hide');
        console.log(tournament.pairingsHistory);
        ReactDOM.render(
            <div class="container">
                <Standings name={tournament.name} date={tournament.date} players={tournament.players} pairingsHistory={tournament.pairings} rounds={tournament.rounds} />
            </div>,
            document.getElementById('root')        
            );
    }

let displayPlayerCount = () => {
    if (players.length == 1) return "1 player";
    return players.length + " players";
}

function newPairings(ifRepair) {
    //console.log("yo");
    matchesComplete = 0;
    players.sort(comparePlayers);
    console.log(players);
    
    if (round == 1)
        shuffle(players);
    
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
        let bye = findPlayer(tempPlayers[tempPlayers.length - 1].name);

        bye.played.push({name: "bye", result: "win"});
        
        byePlayer = {
                first: bye,
                second: "bye",
            complete: true
            };
        
        // We don't want to include this player in for pairing
        tempPlayers.pop();
    }

    while (tempPlayers.length > 2) {
        let firstPlayer = findPlayer(tempPlayers[0].name);
        console.log(tempPlayers[0].name + " is the OG");
        tempPlayers.splice(0, 1);
        //console.log(tempPlayers);
        let mpTierEnd = tempPlayers.map(p => matchPoints(p)).lastIndexOf(matchPoints(tempPlayers[0]));
        console.log(tempPlayers[mpTierEnd].name);
        
        let pos = Math.floor(Math.random() * mpTierEnd);
        let secondPlayer = findPlayer(tempPlayers[pos].name, tempPlayers);
        //console.log(firstPlayer);
        //console.log(secondPlayer);
        //console.log(findPlayedIndex(firstPlayer, secondPlayer.name));
        
        if (findPlayedIndex(firstPlayer, secondPlayer.name)) {
            let tempPlayersCopy = JSON.parse(JSON.stringify(tempPlayers));
            
            // Should return the secondPlayer (from tempPlayers)
            let returnValue = repair(firstPlayer, tempPlayers, tempPlayersCopy, mpTierEnd);
            
            secondPlayer = findPlayer(returnValue.name, tempPlayers);
            pos = findPlayerIndex(returnValue.name, tempPlayers);
        }
        tempPlayers.splice(pos, 1);
        
        // Make secondPlayer actually part of the players array
        secondPlayer = findPlayer(secondPlayer.name);
        pairings.push({
            first: firstPlayer,
            second: secondPlayer,
            complete: false
        });
    }
    
    pairings.push({
        first: findPlayer(tempPlayers[0].name),
        second: findPlayer(tempPlayers[1].name),
        complete: false
    })
            console.log("right before");
    
    //$(".active").removeClass("active")
    
    if (byePlayer != "")
        pairings.push(byePlayer);
    
    currentPairings = pairings;
    
    if (!ifRepair) {
        pairingsHistory.push(JSON.parse(JSON.stringify(pairings)));
        rounds.push(round);
    }
}

function repair(player, playersIn, repairPlayers, mpTierEnd) {
    if (repairPlayers.length == 0) {
        toastr.error("No pairings possible.");
        matchesComplete = pairings.length;
        matchesErrorState = true;
        round--;
        return false;
    }
    
    if (mpTierEnd == 0) {
        let mpTierEndNew = repairPlayers.map(p => matchPoints(p)).lastIndexOf(matchPoints(repairPlayers[1]));
        return repair(player, playersIn, repairPlayers, mpTierEndNew)
    }
    
    let potentialPairedPlayer = repairPlayers[Math.floor(Math.random() * mpTierEnd)];
    
    //console.log("length:" + repairPlayers.length + " position:" + mpTierEnd + " object:");
    //console.log(potentialPairedPlayer);
    //console.log("p");
    //console.log(player);
    let potentialIndex = findPlayedIndex(player, potentialPairedPlayer.name);
    
    // Check if we the paired player has already played the first player
    if (potentialIndex) {
        console.log("LMAO");
        repairPlayers.splice(findPlayerIndex(potentialPairedPlayer.name, repairPlayers), 1);
        mpTierEnd--;
        return repair(player, playersIn, repairPlayers, mpTierEnd);
    }
    
    //players.splice(findPlayerIndex(potentialPairedPlayer, playersIn), 1);
    return potentialPairedPlayer;
}

class GeneratePairings extends React.Component {
        constructor(props) {
            super(props);
            this.displayPlayer = this.displayPlayer.bind(this);
            this.handleWin = this.handleWin.bind(this);
            this.handleTie = this.handleTie.bind(this);
            this.handleUncomplete = this.handleUncomplete.bind(this);

            // If it's on the pairings page, generate new pairings. Else, recall the round we were on
            newPairings(false);
            
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
                return <div class="col list-item-cust" id="bye">BYE</div>;
            return (
                <div class={"col list-item-cust " + shadeRoundResult(p)} id={p.name} onClick={(e) => this.handleWin(e)}>{displayPlayer(p)}</div>
            );
        }
    
        handleWin(e) {
            // Make sure we don't already have a result
            if (e.target.parentElement.parentElement.classList.contains('list-group-item-primary')) {
                return;
            }
            
            // Say we have a result
            //e.target.parentElement.parentElement.classList.add('active');
            completePairing(e.target.id);
            
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
            if (e.target.parentElement.parentElement.classList.contains('list-group-item-primary'))
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
    
    handleUncomplete(e) {
        //console.log(e.target.parentElement.parentElement);
        if (!e.target.parentElement.parentElement.classList.contains('list-group-item-primary'))
            return;
        
        let firstPlayer = e.target.parentElement.firstChild;
        
        // If they click vs, we can't uncomplete a pairing with vs as the player, so we just grab the first child
        uncompletePairing(firstPlayer.id);
        //console.log(firstPlayer);
        
        this.forceUpdate();
    }

        render() {
            return (
                <div class="list-group">{currentPairings.filter(p => p.first.name.indexOf(searchQuery) >= 0 || (p.second != "bye" && p.second.name.indexOf(searchQuery) >= 0)).map((p, i) => 
                    <div class={"list-group-item pairing-item " + uh(p)} onClick={e => this.handleUncomplete(e)}>
                                                                 <div class="row">
                        {this.displayPlayer(p.first)}
                        <div class="col-1 center-align vs" onClick={(e) => this.handleTie(e)}> vs </div>
                        {this.displayPlayer(p.second)}
                                                                 </div>
                    </div>
                )}</div>
            );
        }
    }

let uh = (p) => {
    //console.log(p);
    if (p.complete) return "list-group-item-primary list-group-item-action ";
    return "";
}

class Pairings extends React.Component {
    constructor(props) {
        super(props);
        round = 1;
        
        this.nextRound = this.nextRound.bind(this);
        this.repair = this.repair.bind(this);
        this.endTournament = this.endTournament.bind(this);
        this.renderRounds = this.renderRounds.bind(this);
        this.dropPlayer = this.dropPlayer.bind(this);
        this.updateTabs = this.updateTabs.bind(this);
        this.searchBarUpdate = this.searchBarUpdate.bind(this);
        this.exportTournament = this.exportTournament.bind(this);
        this.saveTournamentLocalStorage = this.saveTournamentLocalStorage.bind(this);
        this.autoWins = this.autoWins.bind(this);
    }
    
    componentDidMount() {
         //M.AutoInit();
        //$(".tabs").tabs({swipeable: true});
        //$("#bye").parent().parent().addClass("active");
    }
    
    componentDidUpdate() {
         //M.AutoInit();
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
        newPairings(false);
        this.forceUpdate();
    }
    
    repair() {
        if ((matchesComplete > 0 && players.length % 2 == 0) || matchesComplete > 1) {
            toastr.error("You can't repair in the middle of a round");
            return;
        }
        
        if (players.length % 2 != 0) {
            console.log("sahhh dude");
            console.log(players[players.length - 1]);
            players[players.length - 1].played.pop();
            players[players.length - 1].wins--;
        }
        
        newPairings(true);
        //$("#bye").parent().parent().addClass("active");
        
        this.forceUpdate();
    }
    
    endTournament() {
        if (matchesComplete < pairings.length) {
            toastr.error("You can't end a tournament in the middle of a round!");
            return;
        }
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

    updateTabs(r) {
        //window.location = "#round" + r
        //console.log("update");
        //var instance = M.Tabs.getInstance(document.getElementById("tabs"));
        //instance.updateTabIndicator();
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
        if (!HTMLplayerDropped.parentElement.parentElement.classList.contains("list-group-item-primary")) {
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
    
    autoWins() {
        if (matchesComplete == pairings / 2)
            return;
        for (let p in pairings) {    
            let first = pairings[p].first, second =  pairings[p].second;
            first.wins++;
            second.losses++;
            
            // Marks that each player has played one another
             first.played.push({name: second.name, result: "win"});
             second.played.push({name: first.name, result: "loss"});
            matchesComplete++;
        }
        this.forceUpdate();
    }
    
    renderRounds() {
        if (round != "DONE" && round <= numRounds) {
            return(<div class="container">
                <h1 id="tournament-name-display">{tournamentName}</h1>
                <h2 id="round-number">Round {round} of {numRounds}</h2>
                <p>Click on a player to assign the win, click on vs to assign both players the tie, and click on an already completed match to undo.</p>
                
                <div class="md-form">
                    <i class="fa fa-search prefix"></i>
                    <input type="text" class="form-control" placeholder="Search for a player" onChange={(e) => this.searchBarUpdate(e)}></input>
                </div>

                <button class="btn btn-primary" onClick={() => this.nextRound()}>Next Round</button>
                    
                <button class="btn btn-warning" onClick={() => this.endTournament()}>Force End Tournament</button>
                
                <button class="btn btn-secondary" data-toggle="modal" onClick={() => this.repair()}>Repair</button>
                    
                <button class="btn btn-secondary" data-toggle="modal" data-target="#drop-modal">Drop Player</button>
                    
                <button class="btn btn-secondary" onClick={() => this.autoWins()}>Auto Wins</button>
                    
                <p></p>
                
                <GeneratePairings round={0} />
                    
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
            <div class="container">
                    
                <Standings name={tournamentName} date={tournamentDate} players={players} pairingsHistory={pairingsHistory} rounds={rounds} />
                    
                <div class="btn-group">
                    <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Save Tournament</button>
                    
                    <div class="dropdown-menu">
                        <a class="dropdown-item" onClick={() => this.saveTournamentLocalStorage()}>Local Storage</a>
                        <a class="dropdown-item" onClick={() => this.exportTournament()}>Download</a>
                    </div>
                </div>
            </div>
        );
        }
    }
    
    searchBarUpdate(event) {
        searchQuery = event.target.value;
        this.forceUpdate()
        //console.log(searchQuery);
        
        //$(".pairing-item").addClass("animated bounce");
        
        //$(".pairing-item").each(() => {$(this).toggleClass("animated bounce")});
    }
    
    exportTournament() {
        let tournament = {
            name: tournamentName,
            date: tournamentDate,
            rounds: rounds,
            players: players,
            pairings: pairingsHistory
        };
        
        let filename = tournamentName.toLowerCase().split(' ').join('-') + '.json';
        
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(tournament)));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
        
        toastr.success(tournamentName + " exported!");
    }
    
    saveTournamentLocalStorage() {
        let tournament = {
            name: tournamentName,
            date: tournamentDate,
            rounds: rounds,
            players: players,
            pairings: pairingsHistory
        };
        
        let date = new Date();
        let tournament_name = tournamentName + " " + tournamentDate + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        
        // Set to local storage
        localStorage.setItem(tournament_name, JSON.stringify(tournament));
        
        toastr.success(tournament_name + " saved!");
    }
    
    render() {   
        return (
            this.renderRounds()
        );
    }
}

class Standings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {name: props.name, date: props.date, players: props.players, pairingsHistory: props.pairingsHistory, rounds: props.rounds};
        
        this.renderTabBar = this.renderTabBar.bind(this);
        this.renderUnclickablePlayers = this.renderUnclickablePlayers.bind(this);
        this.newTournament = this.newTournament.bind(this);
    }
    
    componentDidMount() {
        $('.collapse').collapse()
    }
    
    renderTabBar() {
        return (
                <ul class="nav nav-pills mb-3" role="tablist">
                      {this.state.rounds.map(r => <li class="nav-item">
                                            <a class="nav-link" data-toggle="tab" href={"#round-" + r} role="tab">
                                                {renderTab(r)}
                                            </a>
                                        </li>)}
                </ul>
        );
    }
    
    renderUnclickablePlayers() { return(<div class="tab-content">{this.state.pairingsHistory.map((curr, currPos) =>
                <div id={"round-" + addOne(currPos)} class="list-group tab-pane fade">{curr.map((p, i) => 
                    <div class="list-group-item">
                    <div class="row">
                        {displayPlayer(p.first)}
                        <div class="col center-align"> vs </div>
                        {displayPlayer(p.second)}
                    </div>
                   </div>
                )}</div>)}</div>)};
    
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
    
    render() {
        return (
            <div>
                <h1>{this.state.name} Final Standings</h1>
                <h3>{this.state.date}</h3>
                {this.renderTabBar()}
                {this.renderUnclickablePlayers()}
                <p>Click on each player to view their matchups</p>
                <div id="accordion">
                    {this.state.players.map((p, i) => <div class="card"> 
                                     <div class="card-header" id={p.name}>
                                         <button class="btn btn-link" data-toggle="collapse" data-target={"#" + p.name + "-body"} aria-expanded="true" aria-controls={"#" + p.name + "-body"}>
                                          {addOne(i) + ". "}
                                             <DisplayPlayer player={p} players={this.state.players} />
                                        </button>
                                    </div>
                                     
                                     <div id={p.name + "-body"} class="collapse show" aria-labelledby={"#" + p.name} data-parent="#accordion">
                                         <div class="card-body">
                                             <ul class="list-group">
                                            {p.played.map((q, j) =>
                                                           <li class={"list-group-item list-group-item-action " + shadeRoundResult(q.result)}>Round {addOne(j)} {q.name} - {q.result}</li>
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

class DisplayPlayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {player: props.player, players: props.players};
    }
    
    render() {
        let p = this.state.player;
        if (p == "bye") return "BYE";

        return (
            <div class="inline">
                {p.name + " (" + wins(p) + "-" + p.losses + "-" + p.ties + " (" + matchPoints(p) + ")) Op Win: " + resistance(this.state.player, this.state.players, true) + "% Op/Op Win: " + oppResistance(this.state.player, this.state.players) + "%"}
            </div>);
    }
}

function shadeRoundResult(result) {
        if (result == "win") return "list-group-item-success list-group-item-action";
        if (result == "tie") return "list-group-item-warning list-group-item-action";
        if (result == "loss") return "list-group-item-danger list-group-item-action";
    
        if (result.played.length > 0 && result.played.length == round)
            return shadeRoundResult(result.played[result.played.length - 1].result);
    
        return "list-group-item-action";
    }

function findPlayer (name, ps) {
    if (name == "bye") return "bye";
    if (ps === undefined) ps = players;
    
    for (let p in ps)
        if (ps[p].name == name)
            return ps[p];
    
    return false;
};


// idk if i need these
function displayPlayer(p) {
    if (p == "bye") return "BYE";
    //console.log(resistanceDisplay(p));
    return (p.name + " (" + wins(p) + "-" + p.losses + "-" + p.ties + " (" + matchPoints(p) + ")) " + resistanceDisplay(p) + "%");
} 

let wins = player => player.wins;

let winPercentage = player => Math.max(0.25, (resistanceWins(player) + player.ties / 2) / (resistanceWins(player) + player.ties + player.losses));

let resistance = (player, ps, ifDynamic, ifFloat) => {
    if (ifDynamic && !isNaN(player.resistance)) return player.resistance;
    if (ps === undefined) ps = players;
    if (player == "bye" || player.name == "bye") return;
    
    let resistanceTotal = 0;
    let length = player.played.length
    for (let p in player.played) {
        if (player.played[p].name == "bye")
            length--;
        else
            resistanceTotal += winPercentage(findPlayer(player.played[p].name, ps));
    }
    
    if (resistanceTotal == 0) resistanceTotal = NaN;
    
    player.resistance = Number.parseFloat(resistanceTotal / length * 100).toFixed(2);
    
    //console.log("the player is");
    //console.log(player);
    
    return player.resistance;
}

// Opponent's Opponent's Win Percentage
function oppResistance (player, ps) {
    // No ifDynamic parameter because this is always executed at the Final Standings page
    if (!isNaN(player.oppResistance)) return player.oppResistance;
    if (ps === undefined) ps = players;
    if (player == "bye" || player.name == "bye") return;

    let oppResistanceTotal = 0, length = player.played.length;
    
    for (let p in player.played) {
        if (player.played[p].name == "bye")
            length--;
        else {
            console.log(player.played[p].name);
            oppResistanceTotal += Number.parseFloat(resistance(findPlayer(player.played[p].name, ps), ps, true));
        }
    }
    
    console.log("beep");
    console.log(player);
    
    player.oppResistance = Number.parseFloat(oppResistanceTotal / length).toFixed(2);

    return player.oppResistance;
}

let resistanceWins = player => player.wins - player.byes;

let resistanceDisplay = player => Number.parseFloat(resistance(player)).toFixed(2);
// end of potentially useless functions


let addOne = (i) => i + 1;

let players = [];
let pairings = [];
let currentPairings = pairings;
let pairingsHistory = [];
let rounds = [];
let round;
let numRounds;
let searchQuery;
let tournamentName;
let tournamentDate;

function recommendedRounds() {
    let n = players.length;
    if (n <= 7) return 2;
    if (n == 8) return 3;
    if (n <= 12) return 4;
    if (n <= 20) return 5;
    if (n <= 32) return 5;
    if (n <= 64) return 6;
    if (n <= 128) return 7;
    if (n <= 226) return 8;
    if (n <= 409) return 9;
    return 10;
    
    
    //let n = players.length, off = 1;
    //if (n == 15) off = 2;
    //if (n && (n & (n - 1)) === 0) off = 0;
    //return Math.log(1 << 31 - Math.clz32(n)) / Math.log(2) + off;
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

function uncompletePairing(player) {
    for (let p in pairings) {
        if (pairings[p].first.name == player) { // it's GOING to be first player's name, because that's what we're passing into the function
            pairings[p].complete = false;
            
            console.log(pairings[p].first);
            
            let result = pairings[p].first.played[pairings[p].first.played.length - 1].result;
            if (result == "win") {
                pairings[p].first.wins--;
                pairings[p].second.losses--;
            }
            
            if (result == "tie") {
                pairings[p].first.ties--;
                pairings[p].second.ties--;
            }
            
            if (result == "loss") {
                pairings[p].first.losses--;
                pairings[p].second.wins--;
            }
            
            pairings[p].first.played.pop();
            pairings[p].second.played.pop();
            
            matchesComplete--;
            
            break;
        }
    }
}

let matchPoints = player => player.wins * 3 + player.ties;

let findPlayerIndex = (name, ps) => {
    if (ps == undefined) ps = players;
    
    for (let p in ps)
        if (ps[p].name == name)
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

// This is for normal matches
function comparePlayers(thisPlayer, nextPlayer) {
    // We want the list in descending order
    return matchPoints(nextPlayer) - matchPoints(thisPlayer);
}

// This is for final standings
function comparePlayersIncludeResistance(thisPlayer, nextPlayer) {
    // 1. Opponent's Win Percentage
    if (matchPoints(thisPlayer) == matchPoints(nextPlayer)) {
        if (resistance(nextPlayer) != resistance(thisPlayer))
            return resistance(nextPlayer) - resistance(thisPlayer);
        
        // 2. Opponent's Opponent's Win Percentage
        if (oppResistance(thisPlayer) != oppResistance(nextPlayer))
            return oppResistance(thisPlayer) - oppResistance(nextPlayer);
        
        // 3. Head-to-head
        let pIndex = findPlayedIndex(thisPlayer, nextPlayer.name);
        if (pIndex) {
            // If p1 beat p2, p1 is ranked higher than p2, which means we want it to stay first
            if (thisPlayer.played[pIndex].result == "win")
                return 1;
            
            // Id p1 lost to p2, p1 is ranked lower than p2, so we need to swap it with p2
            if (thisPlayer.played[pIndex].result == "loss")
                return -1;
        }
        
        // 4. Standing of Last Opponent
        return comparePlayersIncludeResistance(thisPlayer.played[thisPlayer.played.length - 1], nextPlayer.played[nextPlayer.played.length - 1]);
    }
    
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