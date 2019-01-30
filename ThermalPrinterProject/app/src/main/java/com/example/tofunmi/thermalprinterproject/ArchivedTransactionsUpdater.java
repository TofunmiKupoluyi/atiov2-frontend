package com.example.tofunmi.thermalprinterproject;

import android.app.Activity;
import android.os.AsyncTask;

import java.util.ArrayList;

public class ArchivedTransactionsUpdater extends AsyncTask<Object, Void, Void> {
    Activity activity;
    ArchivedTransactionsUpdater(Activity activity) {
       super();
       this.activity = activity;
    }

    @Override
    protected Void doInBackground(Object... outputItems) {
        String customerName="undefined", customerNumber="undefined";
        ArrayList<OutputItem> outputItem = (ArrayList<OutputItem>) outputItems[0];

        if (outputItems.length >=3) {
            customerName = (String) outputItems[1];
            customerNumber = (String) outputItems[2];
        }

        DataStore dataStore = new DataStore(this.activity.getApplicationContext());
        dataStore.addTransactionItem(outputItem, customerName, customerNumber);
        return null;
    }

    @Override
    protected void onPostExecute(Void aVoid) {

    }
}
