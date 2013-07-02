function AnalyticsViewModel() {
	var self = this;
	
	// TODO change this reference to the final location of the installed Vert.x instance
	var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');

	self.activeFrame = ko.observable('welcome');
	
	// ---------------- search observables -------------------
	self.searchResults = ko.observableArray([]);
	self.searchErrors = ko.observableArray([]);
	
	self.minDateFilter = ko.observable(0);
	self.maxDateFilter = ko.observable(8640000000000000);
	// ---------------- /search observables -------------------

	// ---------------- graph observables -------------------
	self.graphDataSets = ko.observableArray([]);	
	self.graphTitle = ko.observable('');
	// ---------------- /graph observables -------------------
	
	self.search = function(queryStr) {
		eb.send('shelter.analytics', {action : 'search', query : queryStr }, function(reply) {
			self.activeFrame('search');
			
			self.searchResults.removeAll();
			var results = [];
	        for (i in reply.results)
	        	results.push(new SearchResult(reply.results[i]));
	        
	        observablePushAll(self.searchResults, results);
	        
	        prettyPrint();
	        
	        self.searchErrors.removeAll();
	        var errors = [];
	        for(i in reply.errors)
	        	errors.push(new SearchError(reply.errors[i]));
	        observablePushAll(self.searchErrors, errors);           
		});
	}
	
	self.graph = function(statistic) {
		eb.send('shelter.analytics', {action : 'graph', statistic : statistic }, function(reply) {
			self.activeFrame('graph');
			self.graphTitle('CSA Duplicate Policy Inquiries');
			
			self.graphDataSets.removeAll();
			var dataSets = [];
			$.each(reply.results, function() {
				dataSets.push(new DataSet(this));
			});
			
			observablePushAll(self.graphDataSets, dataSets);
		});
	}
	
	self.filteredSearchResults = ko.computed(function() {
		var results = ko.utils.unwrapObservable(self.searchResults);
		var filteredResults = [];
		for(var n in results) {
			if(results[n].timestamp.getTime() > self.minDateFilter() && results[n].timestamp.getTime() < self.maxDateFilter()) {
				filteredResults.push(results[n]);
			}
		}
		return filteredResults;
	});
	
    eb.onclose = function() {
	    eb = null;
	};
};

function DataSet(json) {
	var self = this;

	parseData = function(data) {
	    var parsed = [];
	    $.each(data, function() {
	    	parsed.push({ date : new Date(this.date), value : this.value});
	    });
	    return parsed
	};
	
	this.label = json.label;
	this.data = parseData(json.data);
}

function SearchError(json) {
	this.searchTerm = json.searchTerm;
	this.description = json.description;
}

function SearchResult(json) {
    this._id = json._id;
    this.timestamp = new Date(json.timestamp);
    this.policyNumber = json.policyNumber;
    this.error = json.error
    this.fullRequest = vkbeautify.xml(json.fullRequest);
    this.fullResponse = vkbeautify.xml(json.fullResponse);
    this.label = shortenLabel(json.label);    
}

function shortenLabel(label) {
	if(label.match(/Inquiry\w+Request/))
		return 'inquiry'
	if(label.match(/Change\w+Request/))
		return 'change'
	if(label.match(/Rate\w+Request/))
		return 'rate'
	if(label.match(/Store\w+Request/))
		return 'store'
}

var viewModel = new AnalyticsViewModel();
ko.applyBindings(viewModel);

// custom date formatting binding
ko.bindingHandlers.dateFormat = {
	    update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
	        var value = valueAccessor(),
	            allBindings = allBindingsAccessor();
	        var valueUnwrapped = ko.utils.unwrapObservable(value);
	        var pattern = allBindings.datePattern || 'DD MMM YY (hh:mm:ss)';
	        $(element).text(moment(valueUnwrapped).format(pattern));
	    }
}

ko.bindingHandlers.highlightError = {
    update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();
        var valueUnwrapped = ko.utils.unwrapObservable(value);
        if(valueUnwrapped)
        	$(element).attr('class', 'error');
    }	
}

function observablePushAll(observableArray, results) {
    observableArray.valueWillMutate();
    ko.utils.arrayPushAll(observableArray(), results);
    observableArray.valueHasMutated();
}