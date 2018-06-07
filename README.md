POM (Packala Open Manager) is a lightweight TOM clone written in React for people who don't have access to TOM or would prefer something more lightweight. POM is only to be used for *unsanctioned* events.

Everything I'm going to say in the calculations section is essentially a carbon copy of [Chris Schemanske's awesome article on how this stuff works](https://sixprizes.com/tiebreakers/), I just put it into code.

## Data Structures

Each player is stored as follows:

```javascript
player = {
    name: 'Jared',
    wins: 4,
    ties: 0,
    losses: 0,
    played: ["Russell LaParre", "Rahul Reddy", "Chris Schemanske", "Kenward"],
    byes: 0
}
```

Players in the "played" array are indeed stored as strings instead of objects, and dereferenced when I need the actual player. That's because JSON can't stringify circular objects... nor do I want to deal with them.

For pairings, the array is sorted by match points first (calculated below), then resistance (also calculated balow).

## Rounds

Recommended rounds numbers are taken from powers of two (9-16 players: 4 rounds, 17-32 players: 5 rounds, etc).

## Calculations

Match points are calculated as you'd expect:

```javascript
let matchPoints = player => player.wins * 3 + player.ties;
```

The resistance calculation (formula pulled from [this thread](http://pokegym.net/community/index.php?threads/tournament-resistance-calculation.29506/)) is the average of all played opponents' win percentages. Each win percentage is calculated by averaging the wins, losses, and ties over the number of matches played (ties count as half of a win). This is done as follows:

```javascript
let winPercentage = player => Math.max(0.25, (resistanceWins(player) + player.ties / 2) / (resistanceWins(player) + player.ties + player.losses));
```

As you can see, players' win percentages can't be lower than 25% in order to minimize the hurt done to players that play against them.

From this method, we can define a particular player's resistance as follows:

```javascript
let resistance = player => {
    // Resistance sum starts off as zero
    let resistanceTotal = 0;
                              
    // Add the win percentages of each player
    for (let p in player.played)
        resistanceTotal += winPercentage(findPlayer(player.played[p]));
    
    // Divide by total number of players. This gets the average win percentage
    resistanceTotal /= player.played.length;
                            
    // This outputs a raw decimal. For display, multiply it by 100 and fix it at 2 decimal places.
    return resistanceTotal;
}
```

### Known Issues

* Sometimes round pairings don't want to go all the way through
* vs formatted weird
* Can't drop preset players?

### Features in Progress

Along with comments listed above.

* Formatting pairings UI for individual rows. Table # doesn't want to work
* Suggested round number
* Better round progression UI
* Just better UI