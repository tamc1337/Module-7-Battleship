const rs = require('readline-sync');
const initQuestion = rs.keyIn('Press any key to start.');
function entireGame() {
    const alpha = Array.from(Array(26)).map((e, i) => i + 65);
    const alphabet = alpha.map((x) => String.fromCharCode(x));
    function gridBuilder(num) {
        let arr = [];
        for (i = 0; i < num; i++) {
            let k = alphabet[i] + (i + 1);
            for (j = 0; j < num; j++) {
                arr.push(alphabet[j] + (i + 1));
            };
            if (!arr.includes(k)) {
                arr.push(alphabet[i] + (i + 1));
            }
        }
        return arr;
    }
    const lenAndWid = 10;
    const theGrid = gridBuilder(lenAndWid);
    const randomBool = () => (Math.random() < 0.5);
    let prevGuesses = [];
    let totalCoords = [];
    const randomizer = maxNum => Math.floor(Math.random() * maxNum);
    const randomCoord = () => {
        let num = randomizer(lenAndWid ** 2);
        return theGrid[num];
    };
    const coordSplitter = (firstCoord = randomCoord()) => {
        firstCoord.split("");
        return firstCoord;
    };
    const indexOfLetter = (shipFirstIndex) => alphabet.indexOf(shipFirstIndex);
    const wholeShipBuilderVertical = (shipFirstLetter, shipLength, shipLast) => {
        let shipArray = [];
        for (let i = 0; i < shipLength; i++) {
            shipArray.push(alphabet[indexOfLetter(shipFirstLetter) + i].concat(shipLast));
        }
        return shipArray;
    }
    const wholeShipBuilderHorizontal = (shipFirstLetter, shipLength, shipLast) => {
        let shipArray = [];
        for (let i = 0; i < shipLength; i++) {
            if (shipLast !== 10) {
                shipArray.push(shipFirstLetter + (Number(shipLast) + Number(i)));
            } else if (shipLast === 10) {
                shipArray.push(shipFirstLetter + (6 + i));
            }
        }
        return shipArray;
    }
   const borderCheckerVertical = (shipFirstLetter, shipLength, shipLast) => {
        if (indexOfLetter(shipFirstLetter) <= (lenAndWid - shipLength) && shipLast != 0) {
            return wholeShipBuilderVertical(shipFirstLetter, shipLength, shipLast);
        } else if (indexOfLetter(shipFirstLetter) > (lenAndWid - shipLength) && shipLast != 0) {
            let newIndex = (indexOfLetter(shipFirstLetter) - shipLength);
            return wholeShipBuilderVertical(alphabet[newIndex], shipLength, shipLast);
        } else if (indexOfLetter(shipFirstLetter) > (lenAndWid - shipLength) && shipLast == 0) {
            let newIndex = (indexOfLetter(shipFirstLetter) - shipLength);
            return wholeShipBuilderVertical(alphabet[newIndex], shipLength, 10);
        } else if (indexOfLetter(shipFirstLetter) <= (lenAndWid - shipLength) && shipLast == 0) {
            return wholeShipBuilderVertical(shipFirstLetter, shipLength, 10)
        }
    };
    const borderCheckerHorizontal = (shipFirstLetter, shipLength, shipLast) => {
        if (shipLast <= (lenAndWid - shipLength) && shipLast != 0) {
            return wholeShipBuilderHorizontal(shipFirstLetter, shipLength, shipLast)
        } else if (shipLast > (lenAndWid - shipLength)) {
            let newLast = (lenAndWid - shipLength) + 1;
            return wholeShipBuilderHorizontal(shipFirstLetter, shipLength, newLast);
        } else if (shipLast == 0) {
            return wholeShipBuilderHorizontal(shipFirstLetter, shipLength, 10);
        };
    }
    const vertCheck = (isVert, shipFirstLetter, shipLast, shipLength) => {
        if (isVert) {
            return borderCheckerVertical(shipFirstLetter, shipLength, shipLast);
        } else {
            return borderCheckerHorizontal(shipFirstLetter, shipLength, shipLast);
        }
    };
    let firstCoord = coordSplitter();
    let orientation = randomBool();
    let coords = vertCheck(orientation, firstCoord[0], firstCoord[firstCoord.length - 1], 5);
    const dupeCoordsChecker = (coords) => {
        return !coords.some(elm => totalCoords.includes(elm))?false:true;
    };
    function generateShip(shipLength) {
        let firstCoord = coordSplitter();
        let orientation = randomBool();
        let coords = vertCheck(orientation, firstCoord[0], firstCoord[firstCoord.length - 1], shipLength);
        return shipDupeChecker(coords);
    };
    const shipDupeChecker = (coords) => {
        if (dupeCoordsChecker(coords)) {
            return generateShip(coords.length);
        } else {
            totalPusher(coords);
            return coords;
        }
    };
    function totalPusher(coords) {
        totalCoords.push(...coords);
    };
    class Ship {
        constructor(num, name, shipLength, coords, isSunk = false) {
            this.num = num;
            this.name = name;
            this.shipLength = shipLength;
            this.isSunk = isSunk;
            this.coords = coords;
        };
    }
    const shipList = [
        {name:'Destroyer',units:2},
        {name:'Submarine', units:3},
        {name:'Cruiser', units:3},
        {name:'Battleship', units:4},
        {name:'Carrier', units:5},
    ];
    const reviewFleet = shipList.map((ship,index)=>{
        const { name,units } = ship;
        return new Ship(index+1,name,units,generateShip(units),false)
    });
    function duplicateGuessChecker(theGuess) {
        if (prevGuesses.includes(theGuess)) {
            console.log(`You've already guessed ${theGuess}! Miss!`);
            guesser();
        }
        prevGuesses.push(theGuess);
        return theGuess;
    };
    function guesser() {
        let coordGuess = rs.question('Enter strike location with a letter A through J, and a number 1 through 10, such as "A1" or "B10".', {
            limit: theGrid,
            limitMessage: 'Please only enter letters A-J with only numbers 1-10 such as "A3" or "G10".  Pick "I9" only if you truly must.'
        });
        let actualCoordGuess = coordGuess.toUpperCase();
        return duplicateGuessChecker(actualCoordGuess);
    };
    const whichShipHit = (guess) => {
        let guessShip = reviewFleet.find(ship => ship.coords.includes(guess));

        console.log(`YOU HIT The ${guessShip.name}!`);
        deadShipCheck(guessShip);
    }
    const hitCoords = [];
    const hitCheck = (guess) => {
        if (totalCoords.includes(guess)) {
            hitCoords.push(guess);
            whichShipHit(guess);
        } else {
            console.log('You have missed!');
        }
        /* This is for cheating in the game to make it go faster (and helped with my coding, remove this comment if you want EZ mode):*/
        console.log(`Try aiming for ${totalCoords}.`);
        console.log(`Your previous guesses include:`);
        console.log(prevGuesses);
    };
    const sunkCheck = (ship) => {
        return ship.coords.every(coord => hitCoords.includes(coord));
    }
    const deadShipCheck = (ship) => {
        if (sunkCheck(ship)) {
            ship.isSunk = true;
            console.log(`The ${ship.name} has been sunk!`);
        }
    };
    const deadCheckAll = (fleet) => {
        return fleet.every(ship => sunkCheck(ship));
    };
    const gameOverCheck = () => {
        if (deadCheckAll(reviewFleet)) {
            console.log("YOU HAVE WON! NO SHIPS REMAINING");
            return true;
        } else {
            return false;
        }
    };
    const nextGuess = () => {
        console.log('NEXT GUESS');
        let nextGuess = guesser();
        game(nextGuess);
    }
    function game(guess) {
        if (totalCoords.length - (hitCoords.length) === 0) {
            console.log('YOU HAVE DESTROYED ALL BATTLESHIPS AND HAVE WON THE BATTLE');
            return true;
        } else {
            hitCheck(guess);
            gameOverCheck() ? game(hitCoords[hitCoords.length - 1]) : nextGuess();
        };
    };
    let startGuess = guesser();
    game(startGuess);
    if (rs.keyInYN('Do you wish to play again? Please enter Y or N')) {
        entireGame();
    }
}
entireGame();