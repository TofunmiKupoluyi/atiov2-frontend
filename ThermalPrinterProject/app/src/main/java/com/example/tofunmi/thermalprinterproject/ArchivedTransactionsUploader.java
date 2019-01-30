package com.example.tofunmi.thermalprinterproject;

import android.app.Activity;
import android.content.Context;
import android.net.Uri;
import android.os.AsyncTask;
import android.widget.Toast;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

public class ArchivedTransactionsUploader extends AsyncTask<String, Void, Boolean> {
    DataStore dataStore;
    Activity activity;
    ArchivedTransactionsUploader(Activity activity) {
        super();
        this.activity = activity;
        this.dataStore = new DataStore(activity.getApplicationContext());
    }

    @Override
    protected Boolean doInBackground(String... strings) {
        // Checks if enough arguments were passed
        if (strings.length >= 2) {
            String email = strings[0];
            String password = strings[1];
            if (!dataStore.getTransactions().equals("")) {
                String payload = "email="+Uri.encode(email)+"&password="+Uri.encode(password)+"&transactions=" + Uri.encode(dataStore.getTransactions());
                try {
                    byte[] payloadBytes = payload.getBytes("UTF-8");
                    URL url = new URL("https://kupoluyi.com:3000/transactions/uploadwauth");
                    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                    connection.setRequestMethod("POST");
                    connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
                    connection.setRequestProperty("Content-Length", String.valueOf(payloadBytes.length));
                    // This is called to print toast
                    publishProgress();
                    connection.getOutputStream().write(payloadBytes);

                    if (connection.getResponseCode() != 200) {
                        return false;
                    } else {
                        return true;
                    }

                } catch (IOException ex) {
                    System.out.println("There was an IO exception " + ex.toString());
                    return false;
                }
            }

            else {
                return false;
            }
        }

        else {
            return false;
        }

    }

    @Override
    protected void onProgressUpdate(Void... values) {
        Toast.makeText(activity.getApplicationContext(), "Uploading transactions ...", Toast.LENGTH_LONG).show();
    }

    @Override
    protected void onPostExecute(Boolean isSuccessful) {
        if (isSuccessful) {
            dataStore.clearTransactionTable();
            Toast.makeText(activity.getApplicationContext(), "Upload successful", Toast.LENGTH_LONG).show();
        } else {
            System.out.println("There was an error uploading data");
            Toast.makeText(activity.getApplicationContext(), "There was an error uploading the data", Toast.LENGTH_LONG).show();
        }
    }
}
