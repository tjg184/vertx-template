(function VisualizationBindings() {
	var timelineBindings = [];
	var graphBindings = [];

	google.load("visualization", "1");
	google.setOnLoadCallback(function() {
		$.each(timelineBindings, function() {
			this.timeline = new links.Timeline(this.element);
		});
		$.each(graphBindings, function() {
			this.graph = new links.Graph(this.element);
		});
	});

	var previousSelection = [];
	
	ko.bindingHandlers.graph = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			graphBindings.push({
				element : element,
				graph : null
			});
			
			// IMPORTANT: somehow update() will never be called unless this line is here
			ko.utils.unwrapObservable(valueAccessor());
		},
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var graph;
			$.each(graphBindings, function() {
				if(this.element == element)
					graph = this.graph;
			});
			
			if(graph == null)
				return;
			
			var min = new Date(8640000000000000);
			var max = new Date(0);
			
			var data = [];
			$.each(ko.utils.unwrapObservable(valueAccessor()), function() {
			    $.each(this.data, function() {
					if(this.date < min)
						min = this.date;
					if(this.date > max)
						max = this.date;			    	
			    });
				data.push(this);
			});
			
			graph.draw(data, { 
				height : '250px', 
				intervalMin : (1000*60*60*6*24), 
				min : min,
				max : max,
				line : { style : 'dot-line' }
			});
			graph.setVisibleChartRangeAuto();
			graph.setValueRangeAuto();
		}
	};
	
	ko.bindingHandlers.timeline = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			timelineBindings.push({
				element : element,
				timeline : null
			});
			
			// IMPORTANT: somehow update() will never be called unless this line is here
			ko.utils.unwrapObservable(valueAccessor());
		},	
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var timeline;
			$.each(timelineBindings, function() {
				if(this.element == element)
					timeline = this.timeline;
			});
			
			if(timeline == null)
				return;
			
		    var data = [];
		    $.each(ko.utils.unwrapObservable(valueAccessor()), function() {
		    	var label = '<span' + (timelineData[n].error ? ' class="text-error"' : '') + '>' + this.label + '</span>'; 
		    	data.push({
		    		start : this.timestamp,
		    		content : label
		    	});
		    });
		    
		    timeline.draw(data, { "height" : "250px" });
		    timeline.setVisibleChartRangeAuto();
		    
		    google.visualization.events.addListener(timeline, 'rangechange', function(range) {
		    	viewModel.minDateFilter(range.start.getTime());
		    	viewModel.maxDateFilter(range.end.getTime());
		    });
		    
		    google.visualization.events.addListener(timeline, 'select', function() {
		    	var selection = timeline.getSelection();
		    	
		    	var selectedElements = [];
		    	for(n in selection) {
		    		var selectedElem = $('#' + selection[n].row);
		    		selectedElements.push([selectedElem, selectedElem.attr("class")]);
		    		selectedElem.attr("class","info");			    		
		    	}
		    	
		    	for(n in previousSelection) {
		    		previousSelection[n][0].attr("class", previousSelection[n][1]);
		    	}
		    	
		    	previousSelection = selectedElements;
		    });
		}
	};	
})();