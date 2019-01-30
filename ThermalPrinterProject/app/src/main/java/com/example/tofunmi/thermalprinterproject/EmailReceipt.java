package com.example.tofunmi.thermalprinterproject;

import android.app.Activity;
import android.net.Uri;
import android.os.AsyncTask;
import android.widget.Toast;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Locale;

public class EmailReceipt extends AsyncTask<String, Void, Boolean> {
    Activity activity;
    String orderedItems;
    String subtotal;
    NumberFormat currencyFormatter;
    EmailReceipt(Activity activity, ArrayList<OutputItem> orderedItems) {
        super();
        Locale locale = new Locale("en", "NG");
        currencyFormatter = NumberFormat.getCurrencyInstance(locale);
        this.orderedItems = generateCSV(orderedItems);
        this.subtotal = getSubtotal(orderedItems);
        this.activity = activity;

    }

    String generateCSV(ArrayList<OutputItem> orderedItemsArray) {
        String returnedString = "";
        for (int i=0; i < orderedItemsArray.size(); i++) {
            OutputItem orderedItem = orderedItemsArray.get(i);
            returnedString += orderedItem.getQuantity() + "#### " + orderedItem.getBrandSelected() + " " + orderedItem.getSkuSelected() + "#### " + currencyFormatter.format(orderedItem.getPrice()) + "#### "+ currencyFormatter.format(orderedItem.getTotalPrice());
            returnedString += "\n";
        }
        return returnedString;
    }

    String getSubtotal(ArrayList<OutputItem> orderedItemsArray) {
        double subtotal = 0;
        for (int i=0; i < orderedItemsArray.size(); i++) {
            subtotal += orderedItemsArray.get(i).getTotalPrice();
        }
        return currencyFormatter.format(subtotal);
    }

    @Override
    protected Boolean doInBackground(String... strings) {
        // Checks if enough arguments were passed
        if (strings.length >= 3) {
            String email = strings[0];
            String password = strings[1];
            String personToEmail = strings[2];
            String modeOfPayment = strings.length >= 4 ? strings[3] : "";
            String amountPaid = strings.length >= 5 ? strings[4] : "";
            String change = strings.length >= 6 ? strings[5]: "";

            if (!orderedItems.equals("")) {
                String payload = "email="+ Uri.encode(email)+"&password="+Uri.encode(password)+"&transactions=" + Uri.encode(orderedItems)+"&to="+Uri.encode(personToEmail)+"&subtotal="+Uri.encode(subtotal)+"&modeOfPayment="+Uri.encode(modeOfPayment) + "&amountPaid="+Uri.encode(amountPaid)+"&change="+Uri.encode(change);
                System.out.println(payload);
                try {
                    byte[] payloadBytes = payload.getBytes("UTF-8");
                    URL url = new URL("https://kupoluyi.com:3000/transactions/emailwauth");
                    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                    connection.setRequestMethod("POST");
                    connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
                    connection.setRequestProperty("Content-Length", String.valueOf(payloadBytes.length));
                    System.out.println(payloadBytes);
                    connection.getOutputStream().write(payloadBytes);

                    if (connection.getResponseCode() != 200) {
                        System.out.println(connection.getContent().toString());
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
    protected void onPostExecute(Boolean isSuccessful) {
        if (isSuccessful) {
            Toast.makeText(activity.getApplicationContext(), "Sent successfully", Toast.LENGTH_LONG).show();
        } else {
            Toast.makeText(activity.getApplicationContext(), "There was an error sending the email", Toast.LENGTH_LONG).show();
        }
    }
}
