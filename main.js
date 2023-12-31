const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';
let hardMode = false;

const reset = "\x1b[0m";

// Print message in color
const log = {
    green: (text) => console.log("\x1b[32m" + text + reset),
    red: (text) => console.log("\x1b[31m" + text + reset),
};

// game progress constant
const WIN = 1;
const LOSE = 2;
const OUTOFBOUNDS = 3;
const REDFLAG = 0;
const GREENFLAG = 1;

// A field class is created
class Field{
    constructor(fieldArray){
        this._fieldArray = fieldArray;
    }

    // print the array in string format
    print() {
        for (let i=0; i<this._fieldArray.length;i++) {
          console.log(this._fieldArray[i].join(' ') + '\n');
        }
    }  

    // Generate game map based on user input for map height, map width, and hole percentage across the map
    static generateField(height=5, width=5, percentage=0, modeSelection){
        if(height<5){
            height = 5;
        }

        if(width<5){
            width = 5;
        }

        if(modeSelection === 'y' || modeSelection === 'Y'){
            hardMode = true;
        }

        const totalHoles = Math.floor(height*width*percentage/100);
        const totalNoneHoles = height*width - totalHoles;
 
        const holeArray = Array(totalHoles).fill(hole);
        const noneHoleArray = Array(totalNoneHoles).fill(fieldCharacter);
        const combined = holeArray.concat(noneHoleArray);

        // shuffle the array
        for(let i=combined.length-1; i>0; i--){
            const j = Math.floor(Math.random()*(i+1));
            [combined[i],combined[j]]=[combined[j],combined[i]];
        }

        //Convert the array to 2D array 
        const result = [];
        while(combined.length){
            result.push(combined.splice(0,width))
        }

        // Randomly generate the position for the hat
        let hatX = Math.floor(Math.random()*width);
        let hatY = Math.floor(Math.random()*height);
        result[hatY][hatX] = hat;

        //Randomly generate the position for the player's initial position
        let pathCharX = 0;
        let pathCharY = 0;
        do {
            pathCharX = Math.floor(Math.random()*width);
            pathCharY = Math.floor(Math.random()*height);
        } while (pathCharX === hatX && pathCharY === hatY)//auto generate again if coordinate of initial position overlap with hat position

        result[pathCharY][pathCharX] = pathCharacter;

        return result;
    }

    // To trace initial position when game starts
    findInitialPos(array, target){
    for(let i=0; i<array.length;i++){
        const index = array[i].findIndex((element)=> element === target);
        if (index !== -1){
            return [i, index];//stop executing the function once found the initial position
        }
    }
    return [-1,-1];
    }


    //Randomly generate hole
    generateHole(){
        let newHoleX = 0
        let newHoleY = 0

        do {
            newHoleX = Math.floor(Math.random()*gameMap._fieldArray[0].length);
            newHoleY = Math.floor(Math.random()*gameMap._fieldArray.length);
        } while (gameMap._fieldArray[newHoleY][newHoleX] !== fieldCharacter);//only generate hole at fieldCharacter

        this._fieldArray[newHoleY][newHoleX] = hole;
    }

    // Print out the status of the game
    gameStatus(msg, flag){
        switch (flag) {
            case GREENFLAG:
                log.green(msg);
                break;
        
            default:
                log.red(msg);
                break;
        }
        process.exit();
    }
}

// Collect user input for game map parameters
console.clear()
console.log("\n Welcome to the Maze Runner! \n")
const userHeight = prompt("Please keyin the height of the maze (number with minimum of 5): ")
const userWidth = prompt("Please keyin the width of the maze (number with minimum of 5): ")
const userPercentage = prompt("Please keyin the percentage of hole for the maze (number only without %): ")
const userHardMode = prompt("Please keyin [Y] to select Hard Mode, keyin anything else for Easy Mode: ")

// Initialisation
const gameMap = new Field(Field.generateField(userHeight,userWidth,userPercentage,userHardMode))
let userInput = null; //initialise user input variable
let pos = gameMap.findInitialPos(gameMap._fieldArray, pathCharacter);//capture initial position
let noOfTurns = 0;
let gameStart = true;

// u > up, r > right, d > down, l > left, q to leave game
while(gameStart){
    if(userInput){
        // numbe of turns increment by 1 everytime user input
        noOfTurns++

        //Validate & execute user input
        switch (userInput) {
            case 'u':
                pos[0] -= 1;
                break;
            case 'r':
                pos[1] += 1;
                break;
            case 'd':
                pos[0] += 1;
                break;
            case 'l':
                pos[1] -= 1;
                break;
            case 'q':
                console.log("Thanks for playing, good bye!")
                process.exit();                    
        }

        // Verify if out of bound occurs
        if(pos[0] === -1 || pos[0] === gameMap._fieldArray.length || pos[1] === -1 || pos[1] === gameMap._fieldArray[0].length){
            gameMap.gameStatus('Out of bound! You lose!', REDFLAG);
        }

        //Capture new position after user keyin the input
        let currentPos = gameMap._fieldArray[pos[0]][pos[1]];

        //Validate & execute based on new position
        switch (currentPos) {
            case hat:
                gameMap.gameStatus('Congrats, you found your hat!', GREENFLAG);
                break;
            case hole:
                gameMap.gameStatus('You fell to the hole! You lose', REDFLAG);
                break;
            case fieldCharacter:
                gameMap._fieldArray[pos[0]][pos[1]] = pathCharacter;
                break;
        }

        //hard mode is active, randomly generate hole every 5 turns
        if(hardMode === true && noOfTurns === 5){
            gameMap.generateHole();
            noOfTurns = 0;//reset
        }

        userInput = null;// reset user input after execution
        }

    console.clear();// clear screen
    gameMap.print();// display updated game map

    //Obtain user input
    while(!userInput){
        console.log('(u)p, (d)own, (l)eft, (r)ight, (q)uit')
        userInput = prompt("Which way?");
        userInput = userInput.toLowerCase();
    }   
}