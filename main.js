const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

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
    static generateField(height=5, width=5, percentage=0){
        if(height<5){
            height = 5;
        }

        if(width<5){
            width = 5;
        }

        const totalMapGrid = height*width;
        const totalHoles = Math.floor(totalMapGrid*percentage/100);
        const totalNoneHoles = totalMapGrid - totalHoles;
 
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
}

// Declaration of function to trace initial position when game starts
function findInitialPos(array, target){
    for(let i=0; i<array.length;i++){
        const index = array[i].findIndex((element)=> element === target);
        if (index !== -1){
            return [i, index];//stop executing the function once found the initial position
        }
    }
    return [-1,-1];
}

// Collect user input for game map parameters
const userHeight = prompt("Please keyin the height of the maze (minimum of 5): ")
const userWidth = prompt("Please keyin the width of the maze (minimum of 5): ")
const userPercentage = prompt("Please keyin the percentage of hole for the maze (keyin number only without %)")

// Initialisation
const gameMap = new Field(Field.generateField(userHeight,userWidth,userPercentage))
gameMap.print(); //display beginning map of the game
let userInput = null; //initialise user input variable
let pos = findInitialPos(gameMap._fieldArray, pathCharacter);//capture initial position
let gameStart = true;

// u > up, r > right, d > down, l > left
while(gameStart){
    if(userInput){
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
        }

        // Verify if out of bound occurs before proceeding
        if(pos[0] === -1 || pos[0] === gameMap._fieldArray.length || pos[1] === -1 || pos[1] === gameMap._fieldArray.length){
            console.log('Out of bound! You lose!');
            process.exit();
        }

        //Capture new position after user keyin the input
        let currentPos = gameMap._fieldArray[pos[0]][pos[1]];

        //Validate & execute based on new position
        switch (currentPos) {
            case hat:
                console.log("Congrats, you found your hat!");
                process.exit()
                break;
            case hole:
                console.log("You fell to the hole! You lose!");
                process.exit()
                break;
            case fieldCharacter:
                gameMap._fieldArray[pos[0]][pos[1]] = pathCharacter;
                break;
        }

        userInput = null;// reset user input after execution
    }

    console.clear();// clear screen
    gameMap.print();// display updated game map

    //Obtain user input
    while(!userInput){
        userInput = prompt("Which way?");
        userInput = userInput.toLowerCase();
    }   
}