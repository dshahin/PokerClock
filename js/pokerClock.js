$(function () { pokerClock.init(); });

var pokerClock = {
	voiceOptions : {
		voiceName : 'Google UK English Male',
		enqueue: true,
		pitch : 0.42,
		rate : 0.78,
		volume: 1
	},
	voiceNames :['Alex'],
	say : function(quote){
		if(!pokerClock.mute){
			chrome.tts.speak(quote, pokerClock.voiceOptions);
		}
	},
	init : function(){

		chrome.tts.getVoices(
          function(voices) {
          	pokerClock.voiceNames = [];
            for (var i = 0; i < voices.length; i++) {
              var vName = voices[i].voiceName;
              pokerClock.voiceNames.push(vName);
              if(vName === pokerClock.voiceOptions.voiceName){
              	$('#voiceName').append('<option selected="selected" value="' + vName + '">' + vName + '</option>');
              }else{
              	$('#voiceName').append('<option value="' + vName + '">' + vName + '</option>');
              }

            }
          });

		$("#alertBox").dialog({ autoOpen: false, modal: true, width:300, height:200, show: 'blind', hide: 'blind'});

		$("#importStructureDialog").dialog({
			autoOpen: false,
			modal: true,
			width:400,
			height:600,
			show: 'blind',
			hide: 'blind',
			buttons: {
		        "Import": function() {
		        	var roundsString = $('#roundEntry').val();
					var rounds = roundsString.split(/\n/);
					//console.log(rounds);
					pokerClock.rounds = [];
					for(var i=0, len=rounds.length; i<len; i++){
						var round = rounds[i];

						var fields = round.split(/\s+/);
						//console.log(fields);
						for(var j=0, jlen=fields.length; j<jlen; j++){
							var field = fields[j];
							field = field.replace(/,/,'');
							field = field.replace(/\$/,'');
							fields[j] = field;
						}
						var newRound = {};
						if (fields.length > 2){
							newRound = {
							    minutes: parseInt(fields[4]),
							    small: parseInt(fields[1]),
							    big: parseInt(fields[2]),
							    ante: parseInt(fields[3]),
							};
						}else{
							newRound = {
							    minutes: parseInt(fields[1]),
							    small: 0,
							    big: 0,
							    ante: 0,
							};
						}
						pokerClock.rounds.push(newRound);
					}
					console.log(pokerClock.rounds);
					pokerClock.showRounds();
					$('#roundEntry').html('');
		          	$( this ).dialog( "close" );
		        },
		        Clear:function(){
		        	$('#roundEntry').html('');
		        },
		        Cancel: function() {
		          $( this ).dialog( "close" );
		        }
	      	}
		});

		$('#addStructure').button().click(function(){
			var formatString ='';
			$('#roundEntry').html('');
			for(var i=0, len=pokerClock.rounds.length; i<len; i++){
				var round = pokerClock.rounds[i];
				formatString += i+1 + '\t' +round.small + '\t' +round.big + '\t' + round.ante + '\t' + round.minutes + '\n';
			}
			$('#roundEntry').html(formatString);
			$("#importStructureDialog").dialog('open');
		});
		$("#pauseButton").toggle(pokerClock.pauseCountdown, pokerClock.startCountdown).click();
		$("#soundButton").toggle(pokerClock.muteOn,pokerClock.muteOff).css({color:'green'});

		$("#startRound").bind('click', function(){ 
			pokerClock.startRound(pokerClock.currentRound);
		}).attr({title:'restart current round'});
		
		$(".nextRound").attr({title:'next round'})
					   .bind('click', function(){
			$('.timeLeft').removeClass('warning');
			if (pokerClock.currentRound < pokerClock.rounds.length - 1){
				if(!pokerClock.mute){pokerClock.pop.play()};
				pokerClock.currentRound++;
				pokerClock.startRound(pokerClock.currentRound) ;
				pokerClock.showRounds();
			}
		});
		$(".prevRound").attr({title:'previous round'})
					   .bind('click', function(){
							if (pokerClock.currentRound > 0){
								if(!pokerClock.mute){pokerClock.pop.play()};
								pokerClock.currentRound--;
								pokerClock.startRound(pokerClock.currentRound) ;
								pokerClock.showRounds();
							}
						});

		// $(".extra").toggle(
		// 	function(){
		// 		$(this).hide();
		// 	},
		// 	function(){
		// 		$(this).show();
		// 	}
		// ).toggle().unbind('click');

		$("#structure").change(function(){
			pokerClock.loadStructure($(this).val());
		});


		//$("#rounds input[type='text']").live('change', pokerClock.updateRounds);
		

		$( "#tabs" ).tabs();

		$('button').live('mouseover',function(){
			$(this).addClass('ui-state-hover');
		}).live('mouseout',function(){
			$(this).removeClass('ui-state-hover');
		}).live('mousedown',function(){
			$(this).addClass('ui-state-active');
		}).live('mouseout',function(){
			$(this).removeClass('ui-state-active');
		});

		//bind keystrokes
		$(document).bind('keydown', bindKeys);

		$('#roundEntry').bind('focus', function(){
			$(document).unbind('keydown');
		});

		$('#roundEntry').bind('blur', function(){
			$(document).bind('keydown', bindKeys);
		});

		$('#voiceName').val(pokerClock.voiceOptions.voiceName).change(function(){
			pokerClock.voiceOptions.voiceName = $(this).val();
		});

		$('#voiceRateSlider').slider({
	      value:pokerClock.voiceOptions.rate,
	      min: 0.1,
	      max: 4,
	      step: 0.01,
	      slide: function( event, ui ) {
	      	pokerClock.voiceOptions.rate = ui.value;
	        $( "#voiceRate" ).val( ui.value );
	      }
	    });
	    $('#rateLabel').click(function(){
	    	pokerClock.voiceOptions.rate = 1;
	    	$( "#voiceRate" ).val( 1 );
	    	$('#voiceRateSlider').slider({value: 1});
	    });

	    $( "#voiceRate" ).val(pokerClock.voiceOptions.rate);

	    $('#voicePitchSlider').slider({
	      value: pokerClock.voiceOptions.pitch,
	      min: 0.1,
	      max: 2,
	      step: 0.01,
	      slide: function( event, ui ) {
	      	pokerClock.voiceOptions.pitch = ui.value;
	        $( "#voicePitch" ).val( ui.value );
	      }
	    });

	    $('#pitchLabel').click(function(){
	    	pokerClock.voiceOptions.pitch = 1;
	    	$( "#voicePitch" ).val( 1 );
	    	$('#voicePitchSlider').slider({value: 1});
	    });

	    $( "#voicePitch" ).val(pokerClock.voiceOptions.pitch);

		$('#say').button().click(function(){
			chrome.tts.stop();
			var quote = $('#quote').val();
			if(quote) pokerClock.say(quote);
		});

		function bindKeys(e){
			var key = e.keyCode;
			console.log('key', key);
			if(key === 38 || key === 40){
				//e.preventDefault();
				$('#pauseButton').click();
				return true;
			} else if (key === 37){
				e.preventDefault();
				$('#prevRound').click();
			} else if (key === 39){
				e.preventDefault();
				$('#nextRound').click();
			}else{
				return true;
			}
		}

		pokerClock.showStructures();
		pokerClock.loadStructure(0);
		pokerClock.showCountdown();

	},
	cfg : {
		debug: false
	},
	warning : new Audio("/snd/flint.wav"),
	pop : new Audio("/snd/pop.wav"),
	alert : new Audio("/snd/alert.wav"),
	currentRound : 0,
	nextRound : function(){

		this.currentRound++;
		return this.currentRound;
	},
	alertPlayers :function(msg){
		$("#alertBox").html(msg).dialog('open');
	},
	mute : false,
	muteOn : function(){
		pokerClock.mute = true;
		chrome.tts.stop();
		$("#soundButton").css({color:'red'}).attr({title:'sound disabled'});

	},
	muteOff : function(){
		pokerClock.mute = false;
		pokerClock.pop.play();
		$("#soundButton").css({color:'green'}).attr({title:'sound enabled'});

	},
	timeInterval : 0,
	logEvent : function(msg){
		$("#events ul").append( '<li>'+  pokerClock.getTime() + ' ' + msg +'</li>');
	},
	countdownInterval : 0,
	startClock : function(){
		pokerClock.timeInterval = setInterval( function(){pokerClock.showTime()}, 1000);
		$(".timeLeft").removeClass('paused');
		$(this).html('pause');
	},
	startCountdown : function(){

		pokerClock.pop.play();
		chrome.tts.stop();
		pokerClock.say('Clock running.');

		pokerClock.countdownInterval = setInterval( function(){pokerClock.showCountdown()}, 1000);
		$(".timeLeft").removeClass('paused');
		$(this).html('pause clock').attr({'title':'pause clock'});
		pokerClock.logEvent('clock unpaused');
	},
	pauseCountdown : function(){

		pokerClock.pop.play();
		chrome.tts.stop();
		pokerClock.say('Clock paused.');
		pokerClock.logEvent('clock paused');
		clearInterval(pokerClock.countdownInterval);
		$(".timeLeft").addClass('paused');
		$("#tabs li:nth-child(2) a").addClass('paused');
		$(this).html('start clock').attr({'title':'start clock'});
	},
	emptyRounds : function(){
		pokerClock.rounds = [];
		pokerClock.currentRound = 0;
		pokerClock.showRounds();
	},
	updateRounds :  function(){
		//alert('updating');
		pokerClock.rounds = [];
		$("#rounds tr.rounds").each(function(){
			var min = $(this).find(".minutes").val();
			var small = $(this).find(".small").val();
			var big = $(this).find(".big").val();
			var ante = $(this).find(".ante").val();
			var round = {minutes: min, small: small, big: big, ante : ante};
			pokerClock.rounds.push(round);
		});
		pokerClock.showRounds();
		$(this).select();
	},

	startRound : function(roundIndex){
		var round = pokerClock.rounds[roundIndex];
		var nextRound = pokerClock.rounds[roundIndex + 1];
		pokerClock.showCountdown();
		chrome.tts.stop();
		if (roundIndex === 0){
			pokerClock.say('Welcome to the tournament.');
		}
		if(round.small > 0 && round.big > 0){
			
			pokerClock.say('Blinds are ' +round.small +' dollar small blind. And '+ round.big + ' dollar big blind.');

			if(round.ante > 0 ){
				pokerClock.say('There is a '+ round.ante + ' dollar ante.');
			}
			pokerClock.say($('#quote').val());
		}else{
			chrome.tts.stop();
			pokerClock.say('Break time for ' + round.minutes + 'minutes.');
		}

		
		$("#roundInfo").html(round.small + '/' + round.big);
		if(round.ante > 0){ $("#roundInfo").append('(' + round.ante +')'); }
		if(round.small == 0 && round.big == 0 && round.ante == 0){ $("#roundInfo").html('on break'); }

		if( typeof pokerClock.rounds[roundIndex + 1] != 'undefined'){
			$("#next").html('next round:' + nextRound.small + '/' + nextRound.big);
			if(nextRound.ante > 0){ $("#next").append('(' + nextRound.ante +')'); }
			if(nextRound.small == 0 && nextRound.big == 0 && nextRound.ante == 0){ $("#next").html('next round: on break'); }
		}

		$('.timeLeft').effect('shake', {}, 100);
		pokerClock.secondsLeft = (round.minutes * 60) + 1 ;
	},
	showRounds : function(){
		$("#rounds tr.rounds").remove();
		for (r=0; r< pokerClock.rounds.length; r++){

			$("#rounds").append(
				'<tr class="rounds">'+

				'<td class="rounds small"><input disabled="disabled" type="text" class="text small" value="' + pokerClock.rounds[r].small + '"/></td>' +
				'<td class="rounds big"><input disabled="disabled" type="text" class="text big" value="' + pokerClock.rounds[r].big + '"/></td>' +
				'<td class="rounds"><input type="text" disabled="disabled" class="text ante" value="' + pokerClock.rounds[r].ante + '"/></td>' +
				'<td class="rounds"><input disabled="disabled" type="text" class="text minutes" value="' + pokerClock.rounds[r].minutes + '"/></td>' +
				'</tr>'
			);
		}
		$("#rounds tr").slice(1 ,pokerClock.currentRound +2).children().addClass('past').children().addClass('past');
		$("#rounds tr").slice(pokerClock.currentRound +1 , pokerClock.currentRound +2).children().addClass('current').children().addClass('current');
		$("tr.rounds").each(function(){
			var $row = $(this),
			big,small;
			var big = $row.children('td.big').each(function(){
				big = $(this).children('input.big').val();
			});
			var small = $row.children('td.small').each(function(){
				small = $(this).children('input.small').val();
			});
			if(big == 0 && small == 0){
				$row.addClass('break');
			}


		});
	},
	secondsLeft : 65,
	setCountdown: function(){
		pokerClock.secondsLeft = minutes * 60;

	},
	endLevel : function(){

		$('.timeLeft').effect('pulsate',{times:8},'slow');
		$("#nextRound").click();
		$('.timeLeft').removeClass('warning');
	},
	showCountdown : function(){
		var hours, minutes, seconds;
		pokerClock.secondsLeft --;
		if (pokerClock.secondsLeft < 1 ){
			pokerClock.endLevel();
		}
		hours = parseInt(pokerClock.secondsLeft / 3600);
		var timeLeft = (pokerClock.secondsLeft  %  3600);
		if (timeLeft){
			minutes = parseInt(timeLeft  /  60);
			timeLeft = parseInt(timeLeft %  60);

			if(minutes === 1 && timeLeft == 0){
				if(!pokerClock.mute){
					pokerClock.alert.play();
					setTimeout(function(){
						pokerClock.say('One minute left in round');
					}, 3000);
				};
				$('.timeLeft').effect('pulsate',{times:8},'slow').addClass('warning');
			}

			if (minutes < 10){ minutes = "0" + minutes; }
		}
		seconds = timeLeft;

		if(hours == 0 & minutes == 0 &seconds == 3){
			if(!pokerClock.mute){pokerClock.warning.play()};
		}


		if(seconds < 0 ){
			seconds = 0;
			clearInterval(pokerClock.countdownInterval);
		}
		if (seconds < 10){ seconds = "0" + seconds; }
		if (! minutes){minutes = "00"; };
		$("div.timeLeft").html(hours +':'+minutes + ':' + seconds);
		$("#tabs li:nth-child(1) a").html(hours +':'+minutes + ':' + seconds);

	},
	getTime : function(){
		var clock = new Date();
		var hours = clock.getHours();
		var minutes = clock.getMinutes();
		return hours +':'+ minutes;

	},
	showTime : function(){
		var clock = new Date();
		var hours = clock.getHours();
		var suffix = 'am';
		if (hours > 11){suffix='pm'};
		if (hours > 12){
			hours = hours - 12;
		}else if(hours == 0){
			hours = 12;
		}
		var minutes = clock.getMinutes();
		if (minutes < 10){ minutes = "0" + minutes; }
		var seconds = clock.getSeconds();
		if (seconds < 10){ seconds = "0" + seconds; }
		$(".clock").html(hours + ':' + minutes + suffix );
	},
	rounds : [ ],
	defaultRound : {minutes: 20, small: 25, big: 50, ante: 0},

	randomSort : function(a,b){
		return( parseInt( Math.random()*10 ) %2 );
	},
	defaultPayout : { percent: 100, dollars : 0},
	payouts : [ ],
	showPayouts : function(){
		$("#payouts tbody tr").remove();
		for( i in pokerClock.payouts){
			var rowString = '<tr class="payout">' +
				'<td>&nbsp;'+(parseInt( i) + 1) +'&nbsp; </td>' +
				'<td class="payout"><input type="text" value="' + pokerClock.payouts[i].percent + '" class="poPercent"/></td>' +
				'<td class="payout"><input type="text" value="' + pokerClock.payouts[i].dollars + '" class="poDollars" readonly/></td>' +
				'</tr>';
			$("#payouts tbody").append(rowString);
		}
		$(".poPercent").change();
	},

	loadStructure : function(sIndex) {
		pokerClock.rounds = pokerClock.structures[sIndex].rounds;
		pokerClock.currentRound = 0;
		pokerClock.startRound(pokerClock.currentRound);
		pokerClock.showRounds();
	},

	showStructures : function(){
		for(i in pokerClock.structures){
			var optString = '<option value="'+i+'">' + pokerClock.structures[i].structureName + '</option>';
			$("#structure").append(optString);
		}
	},
	structures :
	[
		//begin structure
		{
			structureName : 'Sit & Go without antes - 1,500 chips',
			rounds :
			[
				{minutes: 10, small: 10, big: 20, ante: 0},
				{minutes: 10, small: 15, big: 30, ante: 0},
				{minutes: 10, small: 25, big: 50, ante: 0},
				{minutes: 10, small: 50, big: 100, ante: 0},
				{minutes: 10, small: 75, big: 150, ante: 0},
				{minutes: 10, small: 100, big: 200, ante: 0},
				{minutes: 5, small: 0, big: 0, ante: 0},
				{minutes: 10, small: 100, big: 200, ante: 0},
				{minutes: 10, small: 200, big: 400, ante: 0},
				{minutes: 10, small: 300, big: 600, ante: 0},
				{minutes: 10, small: 400, big: 800, ante: 0},
				{minutes: 10, small: 600, big: 1200, ante: 0},
				{minutes: 10, small: 800, big: 1600, ante: 0},
				{minutes: 5, small: 0, big: 0, ante: 0},
				{minutes: 10, small: 1000, big: 2000, ante: 0},
				{minutes: 10, small: 1500, big: 3000, ante: 0},
				{minutes: 10, small: 2000, big: 4000, ante: 0},
				{minutes: 10, small: 2500, big: 5000, ante: 0},
				{minutes: 10, small: 3000, big: 6000, ante: 0},
				{minutes: 10, small: 3500, big: 7000, ante: 0},
				{minutes: 10, small: 4000, big: 8000, ante: 0}
			]
		},
		//begin structure
		{
			structureName : 'Sit & Go with antes - 1,500 chips',
			rounds :
			[
				{minutes: 10, small: 10, big: 20, ante: 0},
				{minutes: 10, small: 15, big: 30, ante: 0},
				{minutes: 10, small: 25, big: 50, ante: 0},
				{minutes: 10, small: 50, big: 100, ante: 0},
				{minutes: 10, small: 75, big: 150, ante: 0},
				{minutes: 10, small: 100, big: 200, ante: 0},
				{minutes: 5, small: 0, big: 0, ante: 0},
				{minutes: 10, small: 100, big: 200, ante: 25},
				{minutes: 10, small: 200, big: 400, ante: 25},
				{minutes: 10, small: 300, big: 600, ante: 50},
				{minutes: 10, small: 400, big: 800, ante: 50},
				{minutes: 10, small: 600, big: 1200, ante: 75},
				{minutes: 10, small: 800, big: 1600, ante: 75},
				{minutes: 5, small: 0, big: 0, ante: 0},
				{minutes: 10, small: 1000, big: 2000, ante: 100},
				{minutes: 10, small: 1500, big: 3000, ante: 150},
				{minutes: 10, small: 2000, big: 4000, ante: 150},
				{minutes: 10, small: 2500, big: 5000, ante: 200},
				{minutes: 10, small: 3000, big: 6000, ante: 200}
			]
		},
		//begin structure
		{
			structureName : 'Home Game Standard with antes',
			rounds :
			[
				{minutes: 20, small: 25, big: 25, ante: 0},
				{minutes: 20, small: 25, big: 50, ante: 0},
				{minutes: 20, small: 50, big: 100, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 75, big: 150, ante: 0},
				{minutes: 20, small: 100, big: 200, ante: 25},
				{minutes: 20, small: 200, big: 400, ante: 25},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 300, big: 600, ante: 50},
				{minutes: 20, small: 400, big: 800, ante: 50},
				{minutes: 20, small: 500, big: 1000, ante: 50},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 600, big: 1200, ante: 100},
				{minutes: 20, small: 800, big: 1600, ante: 100},
				{minutes: 20, small: 1000, big: 2000, ante: 200},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 2000, big: 4000, ante: 300},
				{minutes: 20, small: 3000, big: 6000, ante: 400},
				{minutes: 20, small: 4000, big: 8000, ante: 500},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 5000, big: 10000, ante: 600},
				{minutes: 20, small: 6000, big: 12000, ante: 700},
				{minutes: 20, small: 7000, big: 14000, ante: 800},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 8000, big: 16000, ante: 900},
				{minutes: 20, small: 9000, big: 18000, ante: 1000}
			]
		},
		//begin structure
		{
			structureName : 'Home Game Standard without antes',
			rounds :
			[
				{minutes: 20, small: 25, big: 25, ante: 0},
				{minutes: 20, small: 25, big: 50, ante: 0},
				{minutes: 20, small: 50, big: 100, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 75, big: 150, ante: 0},
				{minutes: 20, small: 100, big: 200, ante: 0},
				{minutes: 20, small: 200, big: 400, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 300, big: 600, ante: 0},
				{minutes: 20, small: 400, big: 800, ante: 0},
				{minutes: 20, small: 500, big: 1000, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 600, big: 1200, ante: 0},
				{minutes: 20, small: 800, big: 1600, ante: 0},
				{minutes: 20, small: 1000, big: 2000, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 2000, big: 4000, ante: 0},
				{minutes: 20, small: 3000, big: 6000, ante: 0},
				{minutes: 20, small: 4000, big: 8000, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 5000, big: 10000, ante: 0},
				{minutes: 20, small: 6000, big: 12000, ante: 0},
				{minutes: 20, small: 7000, big: 14000, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 8000, big: 16000, ante: 0},
				{minutes: 20, small: 9000, big: 18000, ante: 0}
			]
		},
		//Begin structure
		{
			structureName : 'Professional with antes',
			rounds :
			[
				{minutes: 30, small: 25, big: 50, ante: 0},
				{minutes: 30, small: 50, big: 100, ante: 0},
				{minutes: 30, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 100, big: 200, ante: 25},
				{minutes: 30, small: 150, big: 300, ante: 25},
				{minutes: 30, small: 200, big: 400, ante: 50},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 300, big: 600, ante: 75},
				{minutes: 30, small: 400, big: 800, ante: 100},
				{minutes: 30, small: 600, big: 1200, ante: 100},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 800, big: 1600, ante: 200},
				{minutes: 30, small: 1000, big: 2000, ante: 300},
				{minutes: 30, small: 1500, big: 3000, ante: 400},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 2000, big: 4000, ante: 500},
				{minutes: 30, small: 3000, big: 6000, ante: 500},
				{minutes: 30, small: 4000, big: 8000, ante: 1000},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 6000, big: 12000, ante: 1000},
				{minutes: 30, small: 8000, big: 16000, ante: 2000},
				{minutes: 30, small: 10000, big: 20000, ante: 3000},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 15000, big: 30000, ante: 4000},
				{minutes: 30, small: 20000, big: 40000, ante: 5000},
				{minutes: 30, small: 30000, big: 60000, ante: 5000}
			]
		},
		//Begin structure
		{
			structureName : 'Professional without antes',
			rounds :
			[
				{minutes: 30, small: 25, big: 50, ante: 0},
				{minutes: 30, small: 50, big: 100, ante: 0},
				{minutes: 30, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 150, big: 300, ante: 0},
				{minutes: 30, small: 200, big: 400, ante: 0},
				{minutes: 30, small: 300, big: 600, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 400, big: 800, ante: 0},
				{minutes: 30, small: 600, big: 1200, ante: 0},
				{minutes: 30, small: 800, big: 1600, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 1000, big: 2000, ante: 0},
				{minutes: 30, small: 1500, big: 3000, ante: 0},
				{minutes: 30, small: 2000, big: 4000, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 3000, big: 6000, ante: 0},
				{minutes: 30, small: 4000, big: 8000, ante: 0},
				{minutes: 30, small: 6000, big: 12000, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 8000, big: 16000, ante: 0},
				{minutes: 30, small: 10000, big: 20000, ante: 0},
				{minutes: 30, small: 15000, big: 30000, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 20000, big: 40000, ante: 0},
				{minutes: 30, small: 30000, big: 60000, ante: 0},
				{minutes: 30, small: 40000, big: 80000, ante: 0}
			]

		},
		//begin structure
		{
			structureName : 'Empty Structure',
			rounds : [

				{minutes: 0, small: 0, big: 0, ante: 0},

			]
		},
		//end structure
		//begin structure
		{
			structureName : 'Humboldt $10 for 2000 chips',
			rounds : [

				{minutes: 15, small: 25, big: 50, ante: 0},
				{minutes: 15, small: 50, big: 100, ante: 0},
				{minutes: 15, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 200, big: 400, ante: 0},
				{minutes: 15, small: 400, big: 800, ante: 0},
				{minutes: 15, small: 800, big: 1600, ante: 0},
				{minutes: 15, small: 1500, big: 3000, ante: 0},
				{minutes: 15, small: 3000, big: 6000, ante: 0},
				{minutes: 15, small: 5000, big: 10000, ante: 0},

			]
		},
		//end structure
		//begin structure
		{
			structureName : 'Humboldt $15 for 3000 chips - A',
			rounds : [

				{minutes: 20, small: 25, big: 50, ante: 0},
				{minutes: 20, small: 50, big: 100, ante: 0},
				{minutes: 20, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 200, big: 400, ante: 0},
				{minutes: 15, small: 400, big: 800, ante: 0},
				{minutes: 15, small: 800, big: 1600, ante: 0},
				{minutes: 15, small: 1500, big: 3000, ante: 0},
				{minutes: 15, small: 3000, big: 6000, ante: 0},
				{minutes: 15, small: 5000, big: 10000, ante: 0},
				{minutes: 15, small: 10000, big: 20000, ante: 0},

			]
		},
		//end structure
		//begin structure
		{
			structureName : 'Humboldt $15 for 4000 chips - B',
			rounds : [

				{minutes: 20, small: 25, big: 50, ante: 0},
				{minutes: 20, small: 50, big: 100, ante: 0},
				{minutes: 15, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 200, big: 400, ante: 0},
				{minutes: 15, small: 300, big: 600, ante: 100},
				{minutes: 15, small: 500, big: 1000, ante: 100},
				{minutes: 15, small: 1000, big: 2000, ante: 300},
				{minutes: 15, small: 2000, big: 4000, ante: 500},
				{minutes: 15, small: 3000, big: 6000, ante: 1000},
				{minutes: 15, small: 5000, big: 10000, ante: 2000},
				{minutes: 15, small: 10000, big: 20000, ante: 4000},

			]
		},
		//end structure
		//begin structure
		{
			structureName : 'Humboldt $20 for 5000 chips - A',
			rounds : [

				{minutes: 20, small: 25, big: 50, ante: 0},
				{minutes: 20, small: 50, big: 100, ante: 0},
				{minutes: 20, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 200, big: 400, ante: 0},
				{minutes: 15, small: 300, big: 600, ante: 0},
				{minutes: 15, small: 400, big: 800, ante: 0},
				{minutes: 15, small: 600, big: 1200, ante: 0},
				{minutes: 15, small: 800, big: 1600, ante: 0},
				{minutes: 15, small: 1000, big: 2000, ante: 0},
				{minutes: 15, small: 2000, big: 4000, ante: 0},
				{minutes: 15, small: 3000, big: 60000, ante: 0},
				{minutes: 15, small: 5000, big: 10000, ante: 0},
				{minutes: 15, small: 8000, big: 16000, ante: 0},
				{minutes: 15, small: 10000, big: 20000, ante: 0},

			]
		},
		//end structure
		//begin structure
		{
			structureName : 'Humboldt $20 for 7500 chips - B',
			rounds : [

				{minutes: 20, small: 25, big: 50, ante: 0},
				{minutes: 20, small: 50, big: 100, ante: 0},
				{minutes: 20, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 200, big: 400, ante: 0},
				{minutes: 15, small: 300, big: 600, ante: 0},
				{minutes: 15, small: 400, big: 800, ante: 0},
				{minutes: 15, small: 600, big: 1200, ante: 100},
				{minutes: 15, small: 800, big: 1600, ante: 200},
				{minutes: 15, small: 1000, big: 2000, ante: 300},
				{minutes: 15, small: 1500, big: 3000, ante: 500},
				{minutes: 15, small: 2000, big: 4000, ante: 500},
				{minutes: 15, small: 3000, big: 60000, ante: 1000},
				{minutes: 15, small: 5000, big: 10000, ante: 1500},
				{minutes: 15, small: 8000, big: 16000, ante: 2000},
				{minutes: 15, small: 10000, big: 20000, ante: 3000},

			]
		},
		//end structure
		//begin structure
		{
			structureName : 'Humboldt $20 for 4,500 chips - C',
			rounds : [

				{minutes: 20, small: 25, big: 50, ante: 0},
				{minutes: 20, small: 50, big: 100, ante: 0},
				{minutes: 20, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 200, big: 400, ante: 0},
				{minutes: 15, small: 300, big: 600, ante: 0},
				{minutes: 15, small: 400, big: 800, ante: 0},
				{minutes: 15, small: 600, big: 1200, ante: 100},
				{minutes: 15, small: 800, big: 1600, ante: 200},
				{minutes: 15, small: 1000, big: 2000, ante: 300},
				{minutes: 15, small: 1500, big: 3000, ante: 500},
				{minutes: 15, small: 2000, big: 4000, ante: 500},
				{minutes: 15, small: 3000, big: 60000, ante: 1000},
				{minutes: 15, small: 5000, big: 10000, ante: 1500},
				{minutes: 15, small: 8000, big: 16000, ante: 2500},
				{minutes: 15, small: 10000, big: 20000, ante: 3000},

			]
		},
		//end structure
		//begin structure
		{
			structureName : 'Humboldt $25 for 10000 chips',
			rounds : [

				{minutes: 20, small: 25, big: 50, ante: 0},
				{minutes: 20, small: 50, big: 100, ante: 0},
				{minutes: 20, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 200, big: 400, ante: 0},
				{minutes: 15, small: 300, big: 600, ante: 0},
				{minutes: 15, small: 400, big: 800, ante: 0},
				{minutes: 15, small: 600, big: 1200, ante: 100},
				{minutes: 15, small: 800, big: 1600, ante: 200},
				{minutes: 15, small: 1000, big: 2000, ante: 300},
				{minutes: 15, small: 1500, big: 3000, ante: 500},
				{minutes: 15, small: 2000, big: 4000, ante: 500},
				{minutes: 15, small: 3000, big: 6000, ante: 1000},
				{minutes: 15, small: 4000, big: 8000, ante: 1000},
				{minutes: 15, small: 6000, big: 12000, ante: 2000},
				{minutes: 15, small: 8000, big: 1600, ante: 3000},
				{minutes: 15, small: 10000, big: 20000, ante: 4000},

			]
		},
		//end structure
	]

};
