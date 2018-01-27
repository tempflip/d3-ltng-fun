({
	d3Loaded : function(cmp, event, helper) {
		helper.startChart(cmp);
	},

	buttonClicked : function(cmp, event, helper) {
		helper.updateChart(cmp);
	}
})