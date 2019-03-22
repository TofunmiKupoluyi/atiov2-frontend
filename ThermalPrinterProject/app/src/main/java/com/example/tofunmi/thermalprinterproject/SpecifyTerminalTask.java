package com.example.tofunmi.thermalprinterproject;

import android.net.Uri;
import android.os.AsyncTask;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

public class SpecifyTerminalTask extends AsyncTask<String, Void, Boolean> {
    Loginable activity;
    SpecifyTerminalTask(Loginable activity) {
        this.activity = activity;
    }
    @Override
    protected Boolean doInBackground(String... strings) {
        try {
            // If we have sufficient args
            if (strings.length >= 1) {
                String username = activity.getUsername();
                String password = activity.getPassword();
                String terminalDetails = Uri.encode(strings[0]);
                String payload = "email=" + Uri.encode(username) + "&password=" + Uri.encode(password) + "&terminalToVerify=" + terminalDetails;
                System.out.println(payload);
                byte[] payloadBytes = payload.getBytes();


                // making connection
                URL url = new URL("https://kupoluyi.com:3000/account/getencryptedterminaldetails");
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
                    System.out.println(jsonString);
                    String encryptedTerminalDetails = json.getString("encryptedTerminalDetails");
                    String bluetoothPrinter = json.getString("bluetoothPrinter");
                    activity.setTerminalDetails(encryptedTerminalDetails, bluetoothPrinter);
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
        Toast.makeText(activity.getApplicationContext(), "Sending ...", Toast.LENGTH_LONG).show();
    }

    @Override
    protected void onPostExecute(Boolean isSuccessful) {

        if (isSuccessful) {
            activity.respondToLogin(true);
            Toast.makeText(activity.getApplicationContext(), "Terminal Setup Successful", Toast.LENGTH_LONG).show();
        } else {
            activity.respondToLogin(false);
            Toast.makeText(activity.getApplicationContext(), "There was an error adding terminal details in, try again", Toast.LENGTH_LONG).show();
        }

    }
}
