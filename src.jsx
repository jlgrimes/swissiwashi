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
        players.push({name: this.state.newPlayer, wins: 0, ties: 0, losses: 0});
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

function gameResult(winningPlayer, losingPlayer) {
    alert();
    winningPlayer.wins++;
    losingPlayer.losses++;
}

function displayPlayer(p) {
    if (p == "bye")
        return <div class="col-sm" id="bye">BYE</div>;
    return (
        <div class="col-sm" id={p.name} onclick="alert()">{p.name + " (" + p.wins + "-" + p.ties + "-" + p.losses + ")"}</div>
    );
}

function GeneratePairings(props) {
        while (props.players.length > 0) {
            let firstPlayerPos = Math.floor(Math.random() * props.players.length);
            let firstPlayer = props.players[firstPlayerPos];
            props.players.splice(firstPlayerPos, 1);

            // This is where we manipulate the bye
            if (props.players.length == 0)
                pairings.push({first: firstPlayer, second: "bye"});
            else {
                let secondPlayerPos = Math.floor(Math.random() * props.players.length);
                let secondPlayer = props.players[secondPlayerPos];
                props.players.splice(secondPlayerPos, 1);

                pairings.push({first: firstPlayer, second: secondPlayer});
            }
        }

        return (
            <div>{pairings.map(p => 
                <div class="row">
                    {displayPlayer(p.first)}
                    <div class="col-sm"> vs </div>
                    {displayPlayer(p.second)}
                </div>
            )}</div>
        );
    }

class Pairings extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {   
        return (
            <div>
                <GeneratePairings players={players} />
                <div id="won"></div>
            </div>
        );
    }
}
    

let players = [{name: 'Jared', wins: 0, ties: 0, losses: 0}, {name: 'Kenward', wins: 0, ties: 0, losses: 0}];
let pairings = [];

ReactDOM.render(
    <Initialize players={players} />,
    document.getElementById('root')
);