var pkoin = (function(){

	var self = new nModule();

	var essenses = {};

	var Essense = function(p){

		var primary = deep(p, 'history');
		var el, optionsValue = 'pkoinComment', shareId, receiver, valSum, valComment;

		var renders = {

			fields: function(){

			
				var options = new Parameter({

					type : "VALUES",
					name : "Localization",
					id : 'localization',
					defaultValue : optionsValue,
					possibleValues : ['pkoinComment', 'donateToTheAuthor'],
					possibleValuesLabels : [self.app.localization.e('pkoinComment'), self.app.localization.e('donateToTheAuthor')],

		
					_onChange : function(value){

						optionsValue = value;

						renders.fields();
					},
		
				})

				if (el.inputSum){
					valSum = el.inputSum.val();

				}

				if (el.textareaComment){
					valComment = el.textareaComment.val();
				}

				self.shell({

					name :  'fields',
					el :   el.fields,
					data : {
						options : options,
						optionsValue: optionsValue,
						valSum : valSum,
						valComment : valComment
					},

				}, function(_p){

					ParametersLive([options], _p.el);

					el.inputSum = _p.el.find('#inputSum');
					el.textareaComment = _p.el.find('#textareaComment');

					
				})

			}
		}

		var actions = {

			links : function(current, text){
				
				if (current)

					if(!current.url.v){
						
						var l = null
						var r = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi; 

						var matches = text.match(r);

						if(matches && matches.length > 0){
							l = matches[0]
						}

						if (l)
							current.url.set(l)

					}
				
			},
			send : function(comment, clbk){	

				self.app.platform.sdk.comments.send(shareId, comment, null, null, function(err, alias){

					if(!err){
						if (clbk)
							clbk(null, alias)
					}

					else
					{
						self.app.platform.errorHandler(err, true)

						if (clbk){
							clbk(err, null)

							// if (err === 'tosmallamount'){
							// 	actions.removeDonate(id, p)
							// }
						}
					}

				}, null, "0");
			}

		}

		var events = {
			donate : function(clbk){

				
				var comment = new Comment(shareId);
				comment.message.set(valComment);
				actions.links(comment, valComment);

				comment.donate.set({
					address: receiver,
					amount: valSum
				})
				

				actions.send(comment, clbk);

			}
		}


		var initEvents = function(_p){


			var closeContainer = function(){

				valSum = null;
				valComment = null;

				if (_p.container && _p.container.close){
	
					_p.container.close();

				}
			}

			el.buy.on('click', function(){

				self.app.platform.ui.wallet.buy();

				closeContainer();

				
			})

			el.send.on('click', function(){


				var final = function(err, data){

					if (!err){

						new Audio('sounds/donate.mp3').play();

						closeContainer();
					}



				}

				self.app.platform.sdk.node.transactions.get.balance(function(amount){

					balance = amount.toFixed(3);
					valSum = Number(el.inputSum.val());

					if (valSum){

						if (valSum < Number(balance)){

							if (optionsValue === 'pkoinComment'){

								if (el.textareaComment){
									valComment = el.textareaComment.val();
								}

								if (valComment){

									events.donate(final);

								} else {

									sitemessage(self.app.localization.e('e13057'))
								}
	
							}
	
							if (optionsValue === 'donateToTheAuthor'){
	
						
								self.app.platform.ui.wallet.send({
									address : receiver,
									amount: valSum
								})
	
								closeContainer();
		
							}
	
						} else {
	
							sitemessage(self.app.localization.e('incoins'))
						}
					} else {

						sitemessage(self.app.localization.e('e13057'))

					}
					
				
				})






				
			})

			renders.fields();

		}


		return {
			primary : primary,

			getdata : function(clbk, p){

				var essenseData = p.settings.essenseData;
				var userinfo = essenseData.userinfo
				receiver = userinfo.address;

				var data = {
					address : userinfo.address,
					balance : essenseData.balance
				}



				shareId = essenseData.id;

				clbk(data);

			},

			destroy : function(){
				el = {};
			},
			
			init : function(p){

				el = {};
				el.c = p.el.find('#' + self.map.id);

				el.fields = el.c.find("#fieldsWrapper");
				el.send = el.c.find('.sendButton');
				el.buy = el.c.find('#buyButton');


				initEvents(p);
			
				p.clbk(null, p);
			},

			wnd : {
				swipeClose : true,
				trueshold : 1,
				swipeCloseDir : 'down',
				class : 'sharingwindow2 normalizedmobile',
				type : 'pkoin'
			}
		}
	};



	self.run = function(p){

		var essense = self.addEssense(essenses, Essense, p);

		self.init(essense, p);

	};

	self.stop = function(){

		_.each(essenses, function(essense){

			essense.destroy();

		})

	}

	return self;
})();


if(typeof module != "undefined")
{
	module.exports = pkoin;
}
else{

	app.modules.pkoin = {};
	app.modules.pkoin.module = pkoin;

}