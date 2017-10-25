


round(30,5);

//this function instructs players to set up the round, runs several turns in a row and then instructs the round cleanup. it basically represents a whole round.
//it takes the time of the round (before voting) in seconds, and the time of each turn (in seconds)
async function round(roundTime, turnTime){
	var numTurns = Math.ceil(roundTime/turnTime);
	for(var k=0;k<numTurns;k++){
		await turn(turnTime).then(() => {console.log("turn "+k+" of "+numTurns+" over!")});
	}
	console.log("round over!");
}

//this function changes the GUI during the structure of a turn. it basically represents one whole turn. 
//it takes the length of a turn in seconds as an argument
function turn(length){ 
	var critTime = Math.ceil(length*.2); //what's about 20% of the time?
	var standbyTime = length-critTime;// whats about 80% of the time?
	
	return new Promise(function(resolve, reject){
		countSecs(1).then(()=> { //this is one extra second of waiting for players to switch. 
			changeInfoPane("Palyer's Turn", "standby");
			countSecs(standbyTime).then(() =>{
				changeInfoPane("get ready...", "warning")
				countSecs(critTime).then(() =>{
					changeInfoPane("NEXT PLAYER!", "critical")
					resolve(true);
				});
			});
		});
	});//end promise
	
}//end turn

//this asyncronous function (like all async functions) returns a promise which calls the delay function in a loop with an await keyword
//so that each subsequent call of delay waits until the promise returned by the previous delay is resolved (after 1 second). in short: it counts seconds as they pass. 
async function countSecs(numOfSecs){
		for(var i = 0; i < numOfSecs; i++){
			await delay(1000)("tick: "+i).then(function(result){console.log(result);});
		}
}//end countSecs

//this function returns a function, which returns promise and then after waiting 1 second, resolves it.
//thats why when we call it above, we can add a second paramater area: because those paramaters are for the function that this function returns. 
function delay(ms){
	return function(result){
		return new Promise(function(resolve, reject){
			setTimeout(function(){resolve(result);}, ms);
		})//end promise constructor 
	}//end result
}//end delay

//this function just changes the info pane to have different text and backgrounds in order to notify the player. will also play sounds. 
function changeInfoPane(text, type){
	if(type == "standby" || type == "warning" || type == "critical"){
		//remove all possible classes
		$(".infoPane").removeClass('standby');
		$(".infoPane").removeClass('warning');
		$(".infoPane").removeClass('critical');
		//add the selected class and change the text.
		$(".infoPane").addClass(type);
		$(".infoPane").html(text);
	}
	else{console.log("thats not a recognized infopane type...")}
}//end changeInfoPane
