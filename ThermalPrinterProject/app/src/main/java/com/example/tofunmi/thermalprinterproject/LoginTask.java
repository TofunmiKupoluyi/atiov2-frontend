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

public class LoginTask extends AsyncTask<String, Void, Boolean> {
    Loginable activity;
    LoginTask(Loginable activity) {
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
                URL url = new URL("https://kupoluyi.com:3000/account/getencrypteddetails");
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
                    String encryptedEmail = json.getString("encryptedEmail");
                    String encryptedPassword = json.getString("encryptedPassword");
                    activity.setUsername(encryptedEmail);
                    activity.setPassword(encryptedPassword);
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
        Toast.makeText(activity.getApplicationContext(), "Logging in ...", Toast.LENGTH_LONG).show();
    }

    @Override
    protected void onPostExecute(Boolean isSuccessful) {
        activity.respondToLogin();
        if (isSuccessful) {
            Toast.makeText(activity.getApplicationContext(), "Login Successful", Toast.LENGTH_LONG).show();
        } else {
            Toast.makeText(activity.getApplicationContext(), "There was an error logging in, try again", Toast.LENGTH_LONG).show();
        }

    }
}
