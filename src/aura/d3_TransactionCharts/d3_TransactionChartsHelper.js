({
	startChart : function(cmp) {
		var action = cmp.get('c.getTransactionSummaryList');

		action.setCallback(this, function(r) {
			if (r.getState() == 'SUCCESS') {
				this.setTransactionSummaryList(cmp, r.getReturnValue());
			}
		})
		$A.enqueueAction(action);
	},

	setTransactionSummaryList : function(cmp, data) {
		var d = JSON.parse(data)
		this.drawChart(cmp, d);

	},

	drawChart : function(cmp, data) {
		console.log('my data', data);

		var w = 700, h = 500, margin = 40;

		var amount_extent = d3.extent(data, (d) => {return d.completedAmount});
		var date_extent = d3.extent(data, (d) => {return d.dueDate});

		var amount_scale = d3.scaleLinear()
							.range([h, margin])
							.domain(amount_extent);
		var date_scale = d3.scaleTime()
							.range([margin, w-margin])
							.domain(date_extent);

		console.log(amount_extent, date_extent);
		console.log(amount_scale, date_scale);

		var svg = d3.select('#chart')
			.append('svg')
				.attr('width', w)
				.attr('height', h)
	}

})