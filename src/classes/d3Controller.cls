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
												AND bt_stripe__Due_Date__c >= 2017-08-01
												AND bt_stripe__Due_Date__c <= 2017-10-31
												//LIMIT 300
											];


		Map<Date, bt_stripe__Transaction__c[]> traByDueDate = new Map<Date, bt_stripe__Transaction__c[]>();

		for (bt_stripe__Transaction__c tra : traList) {
			Date keyDate = tra.bt_stripe__Due_Date__c.toStartOfWeek();
			if (!traByDueDate.containsKey(keyDate)) traByDueDate.put(keyDate, new bt_stripe__Transaction__c[]{});
			traByDueDate.get(keyDate).add(tra);
		}

		TransactionSummary[] tList = new TransactionSummary[]{};
		for (Date keyDate : traByDueDate.keySet()) {
			TransactionSummary item = new TransactionSummary();
			item.completedAmount = 0;
			item.dueDate = keyDate;
			for (bt_stripe__Transaction__c tra : traByDueDate.get(keyDate)) {
				item.completedAmount += tra.bt_stripe__Amount__c;
			}
			tList.add(item);
		}

		return JSON.serialize(tList);
	}
}