package com.example.tofunmi.thermalprinterproject;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;
import android.os.AsyncTask;
import android.widget.Toast;

import java.io.OutputStream;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Locale;
import java.util.UUID;

public class BluetoothPrint extends AsyncTask<Void, Void, Boolean> {

    private Activity activity;

    // When we ask to start bt, this is what we use
    public static final int REQUEST_ENABLE_BT = 1234;
    private ArrayList<OutputItem> orderedItems;
    private static final int CHAR_WIDTH = 32;
    private double change;
    private String paymentType;

    BluetoothPrint(Activity activity, ArrayList<OutputItem> orderedItems, String paymentType) {
        this.activity = activity;
        this.orderedItems = orderedItems;
        this.change = 0;
        this.paymentType = paymentType;
    }

    BluetoothPrint(Activity activity, ArrayList<OutputItem> orderedItems, String paymentType, double change) {
        this.activity = activity;
        this.orderedItems = orderedItems;
        this.paymentType = paymentType;
        this.change = change;
    }
    @Override
    protected Boolean doInBackground(Void... voids) {
        final UUID MY_UUID = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");

        // Concatenating the ordered items
        String orderedItemsString =  centralizeLine("Invoice / Bill")+"\n\n";
        orderedItemsString += roundToColumn("Brand") + roundToColumn("SKU") + roundToColumn("Qty") + roundToColumn("Total")+"\n";
        double total = 0;
        for(int i=0; i< orderedItems.size(); i++) {
            orderedItemsString += roundToColumn(orderedItems.get(i).getBrandSelected()) + roundToColumn(orderedItems.get(i).getSkuSelected()) + roundToColumn(String.valueOf(orderedItems.get(i).getQuantity())) + orderedItems.get(i).getTotalPrice()+"\n";
            total += orderedItems.get(i).getTotalPrice();
        }
        orderedItemsString+= "\n";
        orderedItemsString+= "Total: " + total + "\n";
        orderedItemsString+= "Amount Paid: " + (total + this.change) + "\n";
        orderedItemsString+= "Change: " + this.change + "\n";
        orderedItemsString+= "\n";
        orderedItemsString+= "Payment: " + this.paymentType + "\n";
        orderedItemsString+= "Date: " + new SimpleDateFormat("dd-MM-yyyy HH:mm:ss").format(new Date()) + "\n";
        orderedItemsString+= "\nSignature: \n\n";

        orderedItemsString+= new String(new char[CHAR_WIDTH]).replace("\0", ".");
        orderedItemsString+= "\n\n\n\n\n";


        // This gets the default bluetooth adapter on the device
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
//        System.out.println(adapter.getBondedDevices().toString()); This gives you the mac address
        if (adapter == null) {
            // Bluetooth is not supported on the device
            return false;
        }

        if (!adapter.isEnabled()) {
            Intent enableBluetooth = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            activity.startActivityForResult(enableBluetooth, REQUEST_ENABLE_BT);
        }

//        MAC ADDRESS FOR HOIN PRINTER
//        String macAddress = "DC:0D:30:33:A6:21";
//        MAC ADDRESS FOR NEW PRINTER DAD ORDERED
//        String macAddress = "DC:0D:30:2B:CE:CC";
//        MAC ADDRESS FOR ORIGINAL PRINTER
        String macAddress = "DC:0D:30:0E:40:8C";

        BluetoothDevice printer = adapter.getRemoteDevice(macAddress);
        BluetoothSocket socket = null;
        System.out.println(orderedItemsString);
        try {
            socket = printer.createRfcommSocketToServiceRecord(MY_UUID);
            socket.connect();
            OutputStream out = socket.getOutputStream();
            byte[] escText = new byte[] { 27, '@', '\r' };
            out.write(escText);
            out.write((orderedItemsString).getBytes());
            return true;

        } catch (Exception ex) {
            System.out.println("ERROR HERE" + ex);
            return false;
        }

    }

    private String roundToColumn(String col) {
        if (col.length() >= CHAR_WIDTH/4) {
            String firstFourLetters = col.substring(0, 4);
            return firstFourLetters + "... ";
        }
        else{
            String space = new String(new char[(CHAR_WIDTH/4-col.length())]).replace("\0", " ");
            return col + space;
        }
    }

    private String roundToColumnEnd(double col) {
        String colString = String.valueOf(col);
        if (colString.length() >= 7) {
            String firstEightLetters = colString.substring(0,7);
            String remaining = colString.substring(7, colString.length());

            return firstEightLetters + "\n" + roundToColumnEnd(remaining);
        }
        else {
            return colString + "\n";
        }
    }

    private String roundToColumnEnd(String colString) {
        if (colString.length() >= 7) {
            String firstEightLetters = colString.substring(0,7);
            String remaining = colString.substring(7, colString.length());

            return firstEightLetters + "\n" + roundToColumnEnd(remaining);
        }
        else {
            return colString + "\n";
        }
    }

    private String centralizeLine(String line) {
        if (line.length() < CHAR_WIDTH) {
            int leftOffset = Math.round(line.length()/2);
            int rightOffset = CHAR_WIDTH - line.length() -leftOffset;
            String leftSpace = new String(new char[leftOffset]).replace("\0", " ");
            String rightSpace = new String(new char[rightOffset]).replace("\0", " ");
            return leftSpace + line + rightSpace;
        }
        return line;
    }



    @Override
    protected void onPostExecute(Boolean isSuccessful) {
        if (isSuccessful) {
            // Add to transactions
            Toast.makeText(activity.getApplicationContext(), "Printed successfully", Toast.LENGTH_LONG).show();
        } else {
            Toast.makeText(activity.getApplicationContext(), "There was an error printing, check your bluetooth adapter", Toast.LENGTH_LONG).show();
        }
    }

}
