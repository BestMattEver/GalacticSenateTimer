
//these catpture the audio elements on the page for use in JS
var turnSound = $('#turnSound')[0];
var roundSound = $('#roundSound')[0];
var turnSoundAlt = $('#turnSoundAlt')[0];
var roundSoundAlt = $('#roundSoundAlt')[0];
var voteSound = $('#voteSound')[0];
var timeoutInterval;
var skipped = false; //this is the global variable that tells the turn functions if the player has tried to skip his turn or not.
//turnSound.play();

//captures the skip turn click
$('body').on('click','.skipTurn',function(){
	skipped = true;
	$(".tapArea").removeClass("skipTurn");
	changeInfoPane("NEXT PLAYER!", "critical");
	turnSoundAlt.play();
	$(".skipping").html("...SKIPPING...");
});//end skipped turn click;

//this captures the click on the round start button
$("body").on('click', '.roundStart',function(){
	$(".tapArea").removeClass("roundStart");//remove the roundStart class so we cant click it again.
	turnSoundAlt.play(); // Play the empty element to get control for mobile
  //turnSoundAlt.src = 'assets/sounds/Judges_Gavel-SoundBible.com-1321455227.mp3'; // Set the real audio source
	turnSoundAlt.src = 'assets/sounds/gavelBang.mp3'; // Set the real audio source
	//now, supposedly, we can play it.
	roundSoundAlt.play(); // Play the empty element to get control for mobile
  roundSoundAlt.src = 'assets/sounds/Gavel_Bangs_4x-SoundBible.com-744905587.mp3'; // Set the real audio source
	//now, supposedly, we can play it.

	runRound();// run the round
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


//this function runs several turns in a row it basically represents a whole round.
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

	//these two lines are used for chancellor veto phase. defunct. no longer in rules.
	/* changeInfoPane("ROUND OVER!<br> tap to start chancellor veto", "wait")
	$(".tapArea").addClass("chancellorVetoStart"); */

	$(".tapArea").addClass("voteStart");
	changeInfoPane("Tap to start final Vote", "wait");
}//end round

//this function changes the GUI during the structure of a turn. it basically represents one whole turn.
//it takes the length of a turn in seconds as an argument
function turn(length){
	skipped = false;
	$(".skipping").html("");
	$(".tapArea").addClass("skipTurn"); //this adds the skip turn class so we can check for it and see if someone tried to skip their turn
	var critTime = Math.ceil(length*.2); //what's about 20% of the time?
	var standbyTime = length-critTime;// whats about 80% of the time?

	var prom = new Promise(function(resolve, reject){

			changeInfoPane("Player's Turn <br> tap here when finished", "standby");
			countSecs(standbyTime).then(() =>{
				if(skipped){
					clearInterval(timeoutInterval);
					//changeInfoPane("NEXT PLAYER!", "critical")
					countSecs_unskippable(1).then(()=> {
						resolve(true);
					}) //this is one extra second of waiting for players to switch.
					//resolve(true);
				}
				else{
					changeInfoPane("get ready...", "warning")
					countSecs(critTime).then(() =>{
						turnSoundAlt.play();
						changeInfoPane("NEXT PLAYER!", "critical")
						countSecs_unskippable(1).then(()=> {
							resolve(true);
						}); //this is one extra second of waiting for players to switch.
					});
				}
			});
});//end promise
 return prom;

}//end turn

//=====================================VOTE STUFF============================================

//this captures the click on the vote start button
$("body").on('click', ".voteStart", function(){
	voteSound.play(); // Play the empty element to get control for mobile
  voteSound.src = "assets/sounds/Air_Horn-SoundBible.com-964603082.mp3"; // Set the real audio source
	//now, supposedly, we can play it.
	runVote();
});

//this function runs the vote timer
function runVote() {
	skipped = false;
	$(".tapArea").removeClass("voteStart");
	$(".skipping").html("");
	$(".tapArea").addClass("skipTurn");

	var voteTime = parseInt($("#voteTime").val(),10);
	var critTime = Math.ceil(voteTime*.2); //what's about 20% of the time?
	var standbyTime = voteTime-critTime;// whats about 80% of the time?

	console.log("vote: "+voteTime);
	changeInfoPane("Negotiate and set votes <br> tap to skip remaining time", "standby");

	return countSecs(standbyTime).then(() =>{
		changeInfoPane("Final Vote Approaching...", "warning");
		return countSecs(critTime);
	}).then(() => {
		voteSound.play();
		changeInfoPane("COUNT FINAL VOTES", "critical");
		return countSecs_unskippable(3);
	}).then(() => {
		$(".tapArea").removeClass("skipTurn");
		$(".tapArea").addClass("roundStart");
		changeInfoPane("Tap to start next round", "wait");
	});
}//end runVote

//=====================================chancellor veto STUFF============================================

//this captures the click on the vote start button
$("body").on("click", ".chancellorVetoStart", function(){
	voteSound.play(); // Play the empty element to get control for mobile
  voteSound.src = "assets/sounds/Air_Horn-SoundBible.com-964603082.mp3"; // Set the real audio source
	//now, supposedly, we can play it.
	runChancellorVeto();
});

//this function runs the chancellor veto timer
function runChancellorVeto() {
	skipped = false;
	$(".tapArea").removeClass("chancellorVetoStart");
	$(".skipping").html("");
	$(".tapArea").addClass("skipTurn");

	var vetoTime = parseInt($("#chancellorTime").val(),10);
	var critTime = parseInt(Math.ceil(vetoTime*.2),10); //what's about 20% of the time?
	var standbyTime = vetoTime-critTime;// whats about 80% of the time?

	console.log("VETO: "+vetoTime+", standbyTime: "+standbyTime+", critTime: "+critTime);
	changeInfoPane("chancellor, Veto one top card <br> tap to skip remaining time", "standby");

	return countSecs(standbyTime).then(() =>{
		changeInfoPane("Time's almost up, Chancellor...", "warning");
		return countSecs(critTime);
	}).then(() => {
		voteSound.play();
		changeInfoPane("Chancellor Veto OVER!", "critical");
		return countSecs_unskippable(1);
	}).then(() => {
		$(".tapArea").removeClass("skipTurn");
		$(".tapArea").addClass("voteStart");
		changeInfoPane("Tap to start final Vote", "wait");
	});
}//end runVote


//=======================================HELPERS========================================

//this asyncronous function (like all async functions) returns a promise which calls the delay function in a loop with an await keyword
//so that each subsequent call of delay waits until the promise returned by the previous delay is resolved (after 1 second). in short: it counts seconds as they pass.
async function countSecs(numOfSecs){
		console.log("in countsecs: "+numOfSecs);
		for(var i = 0; i < numOfSecs; i++){
			if(skipped){
				clearInterval(timeoutInterval);
				i = numOfSecs;
			}//if the global skip variable has been set to true, just skip all the counting.
			else{await delay(1000)("tick: "+i).then(function(result){console.log(result);});}
		}//end for
}//end countSecs

//this function is just like the above, except it cannot skipped by the global skip varible
async function countSecs_unskippable(numOfSecs){
	console.log("in unskippable");
		for(var i = 0; i < numOfSecs; i++){
			await delay(1000)("tick: "+i).then(function(result){console.log(result);});
		}//end for
}//end countSecs

//this function returns a function, which returns promise and then after waiting 1 second, resolves it.
//thats why when we call it above, we can add a second paramater area: because those paramaters are for the function that this function returns.
function delay(ms){
	return function(result){
		return new Promise(function(resolve, reject){
			timeoutInterval = setTimeout(function(){resolve(result);}, ms);
		})//end promise constructor
	}//end result
}//end delay

//this function just changes the info pane to have different text and backgrounds in order to notify the player. will also play sounds.
function changeInfoPane(text, type){
	if(type == "standby" || type == "warning" || type == "critical" || type == "wait"){
		//remove all possible classes
		$(".tapArea").removeClass('standby');
		$(".tapArea").removeClass('warning');
		$(".tapArea").removeClass('critical');
		$(".tapArea").removeClass('wait');
		//add the selected class and change the text.
		$(".tapArea").addClass(type);
		$(".tapArea").html(text);
	}
	else{console.log("thats not a recognized infopane type...")}
}//end changeInfoPane
