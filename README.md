POM (Packala Open Manager) is a lightweight TOM clone written in React for people who don't have access to TOM or would prefer something more lightweight. POM is only to be used for *unsanctioned* events.

## Data Structures

Each player is stored as follows:

```javascript
player = {
    name: 'Jared',
    wins: 4,
    ties: 0,
    losses: 0,
    played: ["Russell LaParre", "Rahul Reddy", "Chris Schemanske", "Kenward"]
}
```

Note: Players in the "played" array are references to other players, instead of plain strings.

For pairings, the array is sorted by match points first (calculated below), then resistance (also calculated balow).

## Calculations

Match points are calculated as you'd expect:

```javascript
let matchPoints = player => player.wins * 3 + player.ties;
```

The resistance calculation (formula pulled from [this thread](http://pokegym.net/community/index.php?threads/tournament-resistance-calculation.29506/)) is the average of all played opponents' win percentages. Each win percentage is calculated by averaging the wins, losses, and ties over the number of matches played (ties count as half of a win). This is done as follows:

```javascript
let winPercentage = player => (player.wins + player.ties / 2) / (player.losses);
```

From this method, we can define a particular player's resistance as follows:

```javascript
let resistance = player => {
    // Resistance sum starts off as zero
    let resistanceTotal = 0;
                              
    // Add the win percentages of each player
    for (let p in player.played)
        resistanceTotal += winPercentage(player.played[p]);
    
    // Divide by total number of players. This gets the average win percentage
    resistanceTotal /= player.played.length;
                            
    // This outputs a raw decimal. For display, multiply it by 100 and fix it at 2 decimal places.
    return resistanceTotal;
}
```