public with sharing class d3Controller {
	
	public class TransactionSummary {
		public Decimal completedAmount;
		public Date dueDate;
	}

	@AuraEnabled
	public static String getTransactionSummaryList() {

		bt_stripe__Transaction__c[] traList = [SELECT bt_stripe__Amount__c
													,bt_stripe__Due_Date__c
													,bt_stripe__Transaction_Status__c
													,bt_stripe__Payment_Status__c
												FROM bt_stripe__Transaction__c
												WHERE bt_stripe__Transaction_Status__c = 'Completed'
												AND bt_stripe__Payment_Status__c = 'Captured'
												AND bt_stripe__Due_Date__c != null
												LIMIT 100
											];


		Map<Date, bt_stripe__Transaction__c[]> traByDueDate = new Map<Date, bt_stripe__Transaction__c[]>();

		for (bt_stripe__Transaction__c tra : traList) {
			if (!traByDueDate.containsKey(tra.bt_stripe__Due_Date__c)) traByDueDate.put(tra.bt_stripe__Due_Date__c, new bt_stripe__Transaction__c[]{});
			traByDueDate.get(tra.bt_stripe__Due_Date__c).add(tra);
		}

		TransactionSummary[] tList = new TransactionSummary[]{};
		for (Date dueDate : traByDueDate.keySet()) {
			TransactionSummary item = new TransactionSummary();
			item.completedAmount = 0;
			item.dueDate = dueDate;	
			for (bt_stripe__Transaction__c tra : traByDueDate.get(dueDate)) {
				item.completedAmount += tra.bt_stripe__Amount__c;
			}
			tList.add(item);
		}

		return JSON.serialize(tList);
	}
}