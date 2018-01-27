({
	loadData : function(cmp, isInit) {
		
		var fromDate = cmp.find('fromDate').get('v.value');
		var toDate = cmp.find('toDate').get('v.value');

		var action = cmp.get('c.getTransactionSummaryList');

		action.setParams({
			fromDate : fromDate,
			toDate : toDate
		});

		action.setCallback(this, function(r) {
			if (r.getState() == 'SUCCESS') {
				this.setTransactionSummaryList(cmp, r.getReturnValue(), isInit);
			}
		})
		$A.enqueueAction(action);
	},

	setTransactionSummaryList : function(cmp, data, isInit) {
		var d = JSON.parse(data)

		d.sort(function (a, b) {
			return (new Date(a.dueDate)).getTime() - (new Date(b.dueDate)).getTime();
		});

		cmp.set('v.data', d);

		if (isInit == true) this.initChart(cmp);
		else this.updateChart(cmp);
	},

	getW : function() {return 600},
	getH : function() {return 500},
	getMargin : function() {return 40},

	getAmountScaleAndDateScale : function(data) {
		var w = this.getW(), h = this.getH(), margin = this.getMargin();

		var amount_extent = d3.extent(data, (d) => {return d.completedAmount});
		var date_extent = d3.extent(data, (d) => {return (new Date(d.dueDate)).getTime() });


		console.log('###', amount_extent, date_extent);

		var amount_scale = d3.scaleLinear()
							.range([h-margin, margin])
							.domain(amount_extent);
		var date_scale = d3.scaleTime()
							.range([margin, w-margin])
							.domain( date_extent );
		return [amount_scale, date_scale];
	},

	drawAxis : function(svg, amount_scale, date_scale) {
		var w = this.getW(), h = this.getH(), margin = this.getMargin();		
		var amount_axis = d3.axisLeft(amount_scale);
		var date_axis = d3.axisBottom(date_scale);

		svg.selectAll('.axis').remove();

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
	},

	initChart : function(cmp) {
		var w = this.getW(), h = this.getH(), margin = this.getMargin();

		var data = cmp.get('v.data').slice(0);
		
		var scaleList = this.getAmountScaleAndDateScale(data);
		var amount_scale = scaleList[0];
		var date_scale = scaleList[1];

		// var line_completed = d3.line()
		// 						.x((d) => { return date_scale( (new Date(d.dueDate)).getTime()) })
		// 						.y((d) => { return amount_scale(d.completedAmount)})
		// 						.curve(d3.curveMonotoneX)
		// 						;

		// var line_failed = d3.line()
		// 						.x((d) => { return date_scale( (new Date(d.dueDate)).getTime()) })
		// 						.y((d) => { return amount_scale(d.completedAmount + d.failedAmount)})
		// 						.curve(d3.curveMonotoneX)
		// 						;



		var svg = d3.select('#chart')
			.append('svg')
				.attr('width', w)
				.attr('height', h)
		;


		this.drawAxis(svg, amount_scale, date_scale);

		// the completed
		////////////////////////
		var points = svg.selectAll('circle')
			.data(data)
			.enter()
			.append('circle')
		;
		this.renderPoints(points, date_scale, amount_scale);

		// svg.append('path')
		// 	.attr('class', 'line completed')
		// 	.attr('d', line_completed(data))
		// ;		

		// // the failed
		// /////////////////
		// svg.selectAll('circle.failed')
		// 	.data(data)
		// 	.enter()
		// 	.append('circle')
		// 		.attr('class', 'circle failed')
		// 		.attr('cx', (d) => { return date_scale( new Date(d.dueDate) ) })
		// 		.attr('cy', (d) => { return amount_scale(d.completedAmount + d.failedAmount) })
		// 		.attr('r', 5)
		// ;	

		// svg.append('path')
		// 	.attr('class', 'line failed')
		// 	.attr('d', line_failed(data))
		// ;	

	},

	updateChart : function(cmp) {
		var w = this.getW(), h = this.getH(), margin = this.getMargin();		
		var data = cmp.get('v.data').slice(0);

		var scaleList = this.getAmountScaleAndDateScale(data);
		var amount_scale = scaleList[0];
		var date_scale = scaleList[1];





		var svg = d3.select('#chart').select('svg');
		this.drawAxis(svg, amount_scale, date_scale);


		var points = d3.select('#chart').selectAll('circle')
						.data(data);

		points.enter().append('circle');
		points.exit().remove();
		

		this.renderPoints(points, date_scale, amount_scale);

		console.log('@@@@@ AHA', data.length);
		
	},

	renderPoints : function(points, date_scale, amount_scale) {
		points.transition()
				.attr('class', 'completed')
				.attr('cx', (d) => { return date_scale( new Date(d.dueDate) ) })
				.attr('cy', (d) => { return amount_scale(d.completedAmount) })
				.attr('r', 5);
	}
 
})