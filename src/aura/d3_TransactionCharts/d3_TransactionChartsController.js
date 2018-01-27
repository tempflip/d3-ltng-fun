({
	d3Loaded : function(cmp, event, helper) {
		helper.loadData(cmp, true);
	},

	dateChanged : function(cmp, event, helper) {
		helper.loadData(cmp, false);
	},

})