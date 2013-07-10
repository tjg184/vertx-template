function MyViewModel() {
	var self = this;
	
	var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');

	self.activeFrame = ko.observable('welcome');
	self.searchResult = ko.observable('');
	
    eb.onclose = function() {
	    eb = null;
	};
	
	self.search = function(queryStr) {
		eb.send('conundrum.blitzen', {action : 'search', query : queryStr }, function(reply) {
			self.searchResult(reply.result);
		});
	}
};

var viewModel = new MyViewModel();
ko.applyBindings(viewModel);




