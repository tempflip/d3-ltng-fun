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

	drawChart : function(cmp, data_) {
		var data = data_.slice(0);

		data.sort(function (a, b) {
			return (new Date(a.dueDate)).getTime() - (new Date(b.dueDate)).getTime();
		});
		console.log('my data', data);

		var w = 900, h = 700, margin = 40;

		var amount_extent = d3.extent(data, (d) => {return d.completedAmount});
		var date_extent = d3.extent(data, (d) => {return (new Date(d.dueDate)).getTime() });

		var amount_scale = d3.scaleLinear()
							.range([h-margin, margin])
							.domain(amount_extent);
		var date_scale = d3.scaleTime()
							.range([margin, w-margin])
							.domain( date_extent );

		var line_completed = d3.line()
								.x((d) => { return date_scale( (new Date(d.dueDate)).getTime()) })
								.y((d) => { return amount_scale(d.completedAmount)})
								.curve(d3.curveMonotoneX)
								;

		var line_failed = d3.line()
								.x((d) => { return date_scale( (new Date(d.dueDate)).getTime()) })
								.y((d) => { return amount_scale(d.completedAmount + d.failedAmount)})
								.curve(d3.curveMonotoneX)
								;

		var amount_axis = d3.axisLeft(amount_scale);
		var date_axis = d3.axisBottom(date_scale);



		console.log(amount_extent, date_extent);
		console.log(amount_scale(amount_extent[0]),
					amount_scale(amount_extent[1]),
					date_scale(date_extent[0]),
					date_scale(date_extent[1])  );


		var svg = d3.select('#chart')
			.append('svg')
				.attr('width', w)
				.attr('height', h)
		;

		svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0, ' + (h-margin) +')')
			.call(date_axis)
		;

		svg.append('g')
			.attr('class', 'y axis')
			.attr('transform', 'translate('+ margin +', ' + 0 +')')
			.call(amount_axis)
		;

		// the completed
		////////////////////////
		svg.selectAll('circle.completed')
			.data(data)
			.enter()
			.append('circle')
				.attr('class', 'completed')
				.attr('cx', (d) => { return date_scale( new Date(d.dueDate) ) })
				.attr('cy', (d) => { return amount_scale(d.completedAmount) })
				.attr('r', 5)
		;

		svg.append('path')
			.attr('class', 'line completed')
			.attr('d', line_completed(data))
		;		

		// the failed
		/////////////////
		svg.selectAll('circle.failed')
			.data(data)
			.enter()
			.append('circle')
				.attr('class', 'circle failed')
				.attr('cx', (d) => { return date_scale( new Date(d.dueDate) ) })
				.attr('cy', (d) => { return amount_scale(d.completedAmount + d.failedAmount) })
				.attr('r', 5)
		;	

		svg.append('path')
			.attr('class', 'line failed')
			.attr('d', line_failed(data))
		;	

	}
 
})