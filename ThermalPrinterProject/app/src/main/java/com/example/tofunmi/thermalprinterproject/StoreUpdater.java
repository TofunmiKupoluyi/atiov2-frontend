package com.example.tofunmi.thermalprinterproject;

import android.app.Activity;
import android.content.Context;
import android.net.Uri;
import android.os.AsyncTask;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;

import org.json.*;

public class StoreUpdater extends AsyncTask<String, Void, Boolean> {
    private MainActivity activity;
    // private constructor, this class is not meant to be instantiated
    StoreUpdater(MainActivity activity) {
        this.activity = activity;
    }

    @Override
    protected Boolean doInBackground(String... strings) {
        try {
            // If we have sufficient args
            if (strings.length >= 2) {
                String username = Uri.encode(strings[0]);
                String password = Uri.encode(strings[1]);
                String payload = "email=" + username + "&password=" + password;
                byte[] payloadBytes = payload.getBytes();


                // making connection
                URL url = new URL("https://kupoluyi.com:3000/store/getwauth");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
                connection.setRequestProperty("Content-Length", String.valueOf(payloadBytes.length));

                publishProgress();
                connection.getOutputStream().write(payloadBytes);

                if (connection.getResponseCode() != 200) {
                    return false;
                } else {
                    // Reading input
                    InputStreamReader reader = new InputStreamReader(connection.getInputStream());
                    BufferedReader bufferedReader = new BufferedReader(reader);
                    String jsonString = bufferedReader.readLine();

                    JSONObject json = new JSONObject(jsonString);
                    JSONArray data = json.getJSONArray("res");

                    // Entering into db
                    DataStore dataStore = new DataStore(activity.getApplicationContext());
                    dataStore.clearStoreTable();
                    for (int i = 0; i < data.length(); i++) {
                        JSONObject single = data.getJSONObject(i);
                        String brand = single.getString("brand");
                        String sku = single.getString("sku");
                        String price = single.getString("price");
                        String costPrice = single.getString("costPrice");
                        dataStore.addStoreItem(brand, sku, price, costPrice);
                    }

                    return true;
                }
            }
            else {
                return false;
            }

        } catch (MalformedURLException ex) {
            System.out.println("Could not get");
            return false;
        } catch (IOException ex) {
            System.out.println("Connection error");
            return false;
        } catch (JSONException ex) {
            System.out.println("Json exception");
            return false;
        }

    }

    @Override
    protected void onProgressUpdate(Void... values) {
        Toast.makeText(activity.getApplicationContext(), "Updating store ...", Toast.LENGTH_LONG).show();
    }

    @Override
    protected void onPostExecute(Boolean isSuccessful) {
        if (isSuccessful) {
            activity.uploadTransactions();
            activity.restart();
            Toast.makeText(activity.getApplicationContext(), "Download successful", Toast.LENGTH_LONG).show();
        } else {
            Toast.makeText(activity.getApplicationContext(), "There was an error loading the new data", Toast.LENGTH_LONG).show();
        }

    }
}
