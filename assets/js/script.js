
//these catpture the audio elements on the page for use in JS
var turnSound = $('#turnSound')[0];
var roundSound = $('#roundSound')[0];
var turnSoundAlt = $('#turnSoundAlt')[0];
var roundSoundAlt = $('#roundSoundAlt')[0];
var voteSound = $('#voteSound')[0];
var skipped = false;
//turnSound.play();

$('#skipTurn').click(function(){
	skipped = true;
});//end skipped turn click;

//this captures the click on the round start button
$("#roundStart").click(function(){
	turnSoundAlt.play(); // Play the empty element to get control for mobile
  turnSoundAlt.src = 'assets/sounds/Judges_Gavel-SoundBible.com-1321455227.mp3'; // Set the real audio source
	//now, supposedly, we can play it.
	roundSoundAlt.play(); // Play the empty element to get control for mobile
  roundSoundAlt.src = 'assets/sounds/Gavel_Bangs_4x-SoundBible.com-744905587.mp3'; // Set the real audio source
	//now, supposedly, we can play it.
	runRound().then(() => {
		$('#roundStart').attr('disabled', false);
		$('#skipTurn').attr('disabled', true);
	});

	$('#roundStart').attr('disabled', true);
});

//this captures the click on the vote start button
$("#voteStart").click(function(){
	voteSound.play(); // Play the empty element to get control for mobile
  voteSound.src = "assets/sounds/Air_Horn-SoundBible.com-964603082.mp3"; // Set the real audio source
	//now, supposedly, we can play it.
	runVote().then(() => {
		$('#voteStart').attr('disabled', false);
	});

	$('#voteStart').attr('disabled', true);
});
//this function runs a whole round.
function runRound() {
	var roundTime = parseInt($("#roundTime").val(),10);

		switch (roundTime) {
			case 120 :
				roundTime = Math.floor(Math.random() * (90 - 150)) + 150;
			break;
			case 180 :
				roundTime = Math.floor(Math.random() * (150 - 210)) + 210;
			break;
			case 240 :
				roundTime = Math.floor(Math.random() * (210 - 270)) + 270;
			break;
			case 300 :
				roundTime = Math.floor(Math.random() * (270 - 330)) + 330;
			break;
			case 360 :
				roundTime = Math.floor(Math.random() * (330 - 390)) + 390;
			break;
			case 420 :
				roundTime = Math.floor(Math.random() * (390 - 450)) + 450;
			break;
		}
console.log(roundTime);

	var turnTime = parseInt($("#turnTime").val(),10);
	console.log("round: "+roundTime);
	console.log("turn: "+turnTime);
	return round(roundTime,turnTime);
}//end runRound

//this function runs the vote timer
function runVote() {
	var voteTime = parseInt($("#voteTime").val(),10);
	var critTime = Math.ceil(voteTime*.2); //what's about 20% of the time?
	var standbyTime = voteTime-critTime;// whats about 80% of the time?

	console.log("vote: "+voteTime);
	changeInfoPane("Negotiate and set votes", "standby", 'vote');

	return countSecs(standbyTime).then(() =>{
		changeInfoPane("Final Vote Approaching...", "warning", 'vote');
		return countSecs(critTime);
	}).then(() => {
		voteSound.play();
		changeInfoPane("COUNT FINAL VOTES", "critical", 'vote');
	});
}//end runVote

//this function instructs players to set up the round, runs several turns in a row and then instructs the round cleanup. it basically represents a whole round.
//it takes the time of the round (before voting) in seconds, and the time of each turn (in seconds)
async function round(roundTime, turnTime){
	var numTurns = Math.ceil(roundTime/turnTime);
	for(var k=0;k<numTurns;k++){
		await turn(turnTime).then(() => {
			console.log("turn "+k+" of "+numTurns+" over!")
		});
	}
	console.log("round over!");
	roundSoundAlt.play();
	changeInfoPane("ROUND OVER", "warning", 'round')
}//end round

//this function changes the GUI during the structure of a turn. it basically represents one whole turn.
//it takes the length of a turn in seconds as an argument
function turn(length){
	skipped = false;
	var critTime = Math.ceil(length*.2); //what's about 20% of the time?
	var standbyTime = length-critTime;// whats about 80% of the time?

	$('#skipTurn').attr('disabled', false);

	var prom = new Promise(function(resolve, reject){

			changeInfoPane("Player's Turn", "standby", 'round');
			countSecs(standbyTime).then(() =>{
				if(skipped){
					console.log("we skip!");
					turnSoundAlt.play();
					changeInfoPane("NEXT PLAYER!", "critical", 'round')
					countSecs_unskippable(1).then(()=> {
						resolve(true);
					}) //this is one extra second of waiting for players to switch.
				}
				else{
					changeInfoPane("get ready...", "warning", 'round')
					countSecs(critTime).then(() =>{
						turnSoundAlt.play();
						changeInfoPane("NEXT PLAYER!", "critical", 'round')
						countSecs_unskippable(1).then(()=> {
							resolve(true);
						}); //this is one extra second of waiting for players to switch.
					});
				}
			});
});//end promise
console.log('skipped:'+skipped);
 return prom;

}//end turn

//this asyncronous function (like all async functions) returns a promise which calls the delay function in a loop with an await keyword
//so that each subsequent call of delay waits until the promise returned by the previous delay is resolved (after 1 second). in short: it counts seconds as they pass.
async function countSecs(numOfSecs){
		for(var i = 0; i < numOfSecs; i++){
			if(skipped){i = numOfSecs;}//if the global skip variable has been set to true, just skip all the counting.
			else{await delay(1000)("tick: "+i).then(function(result){console.log(result);});}
		}//end for
}//end countSecs

//this function is just like the above, except it is not skipped by the global skip varible
async function countSecs_unskippable(numOfSecs){
		for(var i = 0; i < numOfSecs; i++){
			await delay(1000)("tick: "+i).then(function(result){console.log(result);});
		}//end for
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
function changeInfoPane(text, type, voteorround){
	if(type == "standby" || type == "warning" || type == "critical"){
			if(voteorround == 'round'){
				//remove all possible classes
				$(".roundInfoPane").removeClass('standby');
				$(".roundInfoPane").removeClass('warning');
				$(".roundInfoPane").removeClass('critical');
				//add the selected class and change the text.
				$(".roundInfoPane").addClass(type);
				$(".roundInfoPane").html(text);
				console.log("we added the infopane!");
			}
			else if(voteorround == 'vote'){
				//remove all possible classes
				$(".voteInfoPane").removeClass('standby');
				$(".voteInfoPane").removeClass('warning');
				$(".voteInfoPane").removeClass('critical');
				//add the selected class and change the text.
				$(".voteInfoPane").addClass(type);
				$(".voteInfoPane").html(text);
			}
	else{console.log("thats not a recognized infopane type...")}
	}
}//end changeInfoPane
