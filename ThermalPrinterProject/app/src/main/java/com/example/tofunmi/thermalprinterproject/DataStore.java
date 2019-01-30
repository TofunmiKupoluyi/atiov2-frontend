package com.example.tofunmi.thermalprinterproject;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.provider.ContactsContract;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Date;
import java.util.Random;

public class DataStore extends SQLiteOpenHelper {

    public static final int DATABASE_VERSION = 3;
    public static final String DATABASE_NAME = "central.db";

    public static final String CREATE_STORE_TABLE =
            "CREATE TABLE "+ DataStoreContract.TABLE_NAME + "( " +
                DataStoreContract.COLUMN_NAME_ID + " INTEGER PRIMARY KEY, " +
                DataStoreContract.COLUMN_NAME_BRAND + " TEXT, " +
                DataStoreContract.COLUMN_NAME_SKU + " TEXT, " +
                DataStoreContract.COLUMN_NAME_PRICE + " REAL, "+
                    DataStoreContract.COLUMN_NAME_COST_PRICE + " REAL, " +
                DataStoreContract.COLUMN_NAME_COLOR + " TEXT " +
            ");";

    public static final String CREATE_TRANSACTION_TABLE =
            "CREATE TABLE "+ ArchivedTransactionsContract.TABLE_NAME + "( " +
                    ArchivedTransactionsContract.COLUMN_NAME_ID + " INTEGER PRIMARY KEY, " +
                    ArchivedTransactionsContract.COLUMN_NAME_BRAND + " TEXT, " +
                    ArchivedTransactionsContract.COLUMN_NAME_SKU + " TEXT, " +
                    ArchivedTransactionsContract.COLUMN_NAME_PRICE + " REAL, " +
                    ArchivedTransactionsContract.COLUMN_NAME_COST_PRICE + " REAL, " +
                    ArchivedTransactionsContract.COLUMN_NAME_QUANTITY + " INTEGER, "+
                    ArchivedTransactionsContract.COLUMN_NAME_TIMESTAMP + " INTEGER, "+
                    ArchivedTransactionsContract.COLUMN_NAME_TOTAL_PRICE + " REAL, " +
                    ArchivedTransactionsContract.COLUMN_NAME_CUSTOMER_NAME + " TEXT, " +
                    ArchivedTransactionsContract.COLUMN_NAME_CUSTOMER_PHONE_NUMBER + " TEXT, " +
                    ArchivedTransactionsContract.COLUMN_NAME_TOTAL_COST_PRICE + " REAL " +
            ");";

    public static final String DROP_STORE_TABLE =
            "DROP TABLE IF EXISTS " + DataStoreContract.TABLE_NAME;

    public static final String DROP_TRANSACTION_TABLE =
            "DROP TABLE IF EXISTS " + ArchivedTransactionsContract.TABLE_NAME;

    public static final String CLEAR_STORE_TABLE =
            "DELETE FROM " + DataStoreContract.TABLE_NAME;

    public static final String CLEAR_TRANSACTION_TABLE =
            "DELETE FROM " + ArchivedTransactionsContract.TABLE_NAME;

    // Class for brands, contains brands and their corresponding color
    class BrandObject {
        public String brand;
        public String color;

        BrandObject(String brand, String color) {
            this.brand = brand;
            this.color = color;
        }

        BrandObject(String brand) {
            this.brand = brand;
        }
    }

    // Class for price, contains cost price and item price
    class PriceObject {
        public String price;
        public String costPrice;

        PriceObject(String price, String costPrice) {
            this.price = price;
            this.costPrice = costPrice;
        }
    }

    DataStore(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    public void onCreate(SQLiteDatabase db) {
        // Creating store table
        db.execSQL(CREATE_STORE_TABLE);

        // Creating transaction table
        db.execSQL(CREATE_TRANSACTION_TABLE);
    }

    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL(DROP_STORE_TABLE);
        db.execSQL(DROP_TRANSACTION_TABLE);
        onCreate(db);
    }

    public void clearStoreTable() {
        SQLiteDatabase db = this.getWritableDatabase();
        // Clearing store table
        db.execSQL(CLEAR_STORE_TABLE);
        db.close();
    }

    public void clearTransactionTable() {
        SQLiteDatabase db = this.getWritableDatabase();
        db.execSQL(CLEAR_TRANSACTION_TABLE);
        db.close();
    }

    private String generateColorCode() {
        // create random object - reuse this as often as possible
        Random random = new Random();

        // create a big random number - maximum is ffffff (hex) = 16777215 (dez)
        int nextInt = random.nextInt(0x7FFFFF + 1)+0x7FFFFF-1; // Only upper half of the spectrum

        // format it as hexadecimal string (with hashtag and leading zeros)
        String colorCode = String.format("#%06x", nextInt);
        return colorCode;
    }

    public void addStoreItem(String brand, String sku, String price, String costPrice) {
        SQLiteDatabase db = this.getWritableDatabase();

        // Compiling insert contents
        ContentValues contentValues = new ContentValues();
        contentValues.put(DataStoreContract.COLUMN_NAME_BRAND, brand);
        contentValues.put(DataStoreContract.COLUMN_NAME_SKU, sku);
        contentValues.put(DataStoreContract.COLUMN_NAME_PRICE, price);
        contentValues.put(DataStoreContract.COLUMN_NAME_COST_PRICE, costPrice);
        // Randomly generating colors could be dangerous, same brand having different color
        contentValues.put(DataStoreContract.COLUMN_NAME_COLOR, "#ffffff");
        // Inserting
        db.insert(DataStoreContract.TABLE_NAME, null, contentValues);

        // Closing db
        db.close();
    }

    public void addTransactionItem(ArrayList<OutputItem> outputItems) {
        SQLiteDatabase db = this.getWritableDatabase();

        // Getting the timestamp -- timestamp is kept constant for single request
        Date date = new Date();
        long timestamp = date.getTime();

        // Looping through all output items
        for( int i = 0; i < outputItems.size(); i++ ) {

            OutputItem item = outputItems.get(i);

            // Compiling insert contents
            ContentValues contentValues = new ContentValues();
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_BRAND, item.getBrandSelected());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_SKU, item.getSkuSelected());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_PRICE, item.getPrice());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_COST_PRICE, item.getCostPrice());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_QUANTITY, item.getQuantity());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_TIMESTAMP, timestamp);
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_TOTAL_PRICE, item.getTotalPrice());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_TOTAL_COST_PRICE, item.getTotalCostPrice());


            // Inserting
            db.insert(ArchivedTransactionsContract.TABLE_NAME, null, contentValues);

        }

        // Closing db
        db.close();
    }

    public void addTransactionItem(ArrayList<OutputItem> outputItems, String customerName, String customerNumber) {
        SQLiteDatabase db = this.getWritableDatabase();

        // Getting the timestamp -- timestamp is kept constant for single request
        Date date = new Date();
        long timestamp = date.getTime();

        // Looping through all output items
        for( int i = 0; i < outputItems.size(); i++ ) {

            OutputItem item = outputItems.get(i);

            // Compiling insert contents
            ContentValues contentValues = new ContentValues();
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_BRAND, item.getBrandSelected());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_SKU, item.getSkuSelected());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_PRICE, item.getPrice());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_COST_PRICE, item.getCostPrice());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_QUANTITY, item.getQuantity());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_TIMESTAMP, timestamp);
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_TOTAL_PRICE, item.getTotalPrice());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_TOTAL_COST_PRICE, item.getTotalCostPrice());
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_CUSTOMER_NAME, customerName);
            contentValues.put(ArchivedTransactionsContract.COLUMN_NAME_CUSTOMER_PHONE_NUMBER, customerNumber);

            // Inserting
            db.insert(ArchivedTransactionsContract.TABLE_NAME, null, contentValues);

        }

        // Closing db
        db.close();
    }
    public String getTransactions() {
        SQLiteDatabase db = this.getReadableDatabase();
        String[] columns = {
                ArchivedTransactionsContract.COLUMN_NAME_BRAND,
                ArchivedTransactionsContract.COLUMN_NAME_SKU,
                ArchivedTransactionsContract.COLUMN_NAME_PRICE,
                ArchivedTransactionsContract.COLUMN_NAME_COST_PRICE,
                ArchivedTransactionsContract.COLUMN_NAME_QUANTITY,
                ArchivedTransactionsContract.COLUMN_NAME_TIMESTAMP,
                ArchivedTransactionsContract.COLUMN_NAME_TOTAL_PRICE,
                ArchivedTransactionsContract.COLUMN_NAME_TOTAL_COST_PRICE,
                ArchivedTransactionsContract.COLUMN_NAME_CUSTOMER_NAME,
                ArchivedTransactionsContract.COLUMN_NAME_CUSTOMER_PHONE_NUMBER
        };

        Cursor result = db.query(ArchivedTransactionsContract.TABLE_NAME, columns, null, null, null, null, null);
        String csvFormattedResult = "";
        while (result.moveToNext()) {
            String brand = result.getString(result.getColumnIndexOrThrow(ArchivedTransactionsContract.COLUMN_NAME_BRAND));
            String sku = result.getString(result.getColumnIndexOrThrow(ArchivedTransactionsContract.COLUMN_NAME_SKU));
            String price = result.getString(result.getColumnIndexOrThrow(ArchivedTransactionsContract.COLUMN_NAME_PRICE));
            String costPrice = result.getString(result.getColumnIndexOrThrow(ArchivedTransactionsContract.COLUMN_NAME_COST_PRICE));
            String quantity = result.getString(result.getColumnIndexOrThrow(ArchivedTransactionsContract.COLUMN_NAME_QUANTITY));
            String timestamp = result.getString(result.getColumnIndexOrThrow(ArchivedTransactionsContract.COLUMN_NAME_TIMESTAMP));
            String totalPrice = result.getString(result.getColumnIndexOrThrow(ArchivedTransactionsContract.COLUMN_NAME_TOTAL_PRICE));
            String totalCostPrice = result.getString(result.getColumnIndexOrThrow(ArchivedTransactionsContract.COLUMN_NAME_TOTAL_COST_PRICE));
            String customerName = result.getString(result.getColumnIndexOrThrow(ArchivedTransactionsContract.COLUMN_NAME_CUSTOMER_NAME));
            String customerPhoneNumber = result.getString(result.getColumnIndexOrThrow(ArchivedTransactionsContract.COLUMN_NAME_CUSTOMER_PHONE_NUMBER));
            // Format brand, sku, price, quantity, timestamp, total price
            csvFormattedResult += brand + ", " + sku + ", " + price + ", " + quantity + ", " + totalPrice + ", " + timestamp + ", " + costPrice + ", " + totalCostPrice + ", " + customerName + ", "+ customerPhoneNumber;

            // If it's not the last item, add a new line
            if (!result.isLast()) {
                csvFormattedResult += "\n";
            }

        }
        db.close();

        return csvFormattedResult;
    }

    public PriceObject getPrice(String brand, String sku) {
        SQLiteDatabase db = this.getReadableDatabase();

        // columns to return
        String[] columnsToRetrieve = {DataStoreContract.COLUMN_NAME_PRICE, DataStoreContract.COLUMN_NAME_COST_PRICE};

        // WHERE ...
        String whereParameter = DataStoreContract.COLUMN_NAME_BRAND + " = ? AND " + DataStoreContract.COLUMN_NAME_SKU + " = ?";

        // question marks
        String[] whereArgs = { brand, sku };

        Cursor result = db.query(DataStoreContract.TABLE_NAME, columnsToRetrieve, whereParameter, whereArgs, null, null, null);

        // Try getting the price from cursor, if successful, return else return 0
        try {

            // Gets last price if duplicate
            String price = "0";
            String costPrice = "0";
            while (result.moveToNext()) {
                price = result.getString(result.getColumnIndexOrThrow(DataStoreContract.COLUMN_NAME_PRICE));
                costPrice = result.getString(result.getColumnIndexOrThrow(DataStoreContract.COLUMN_NAME_COST_PRICE));

            }
            db.close();
            return new PriceObject(price, costPrice);
        } catch (Exception ex) {
            System.out.println(ex);
            db.close();
            return new PriceObject("0", "0");
        }

    }

    public ArrayList<String> getSkusFromBrand(String brand) {
        SQLiteDatabase db = this.getReadableDatabase();
        ArrayList<String> skus = new ArrayList<String>();

        // columns to return
        String[] columnsToRetrieve = { DataStoreContract.COLUMN_NAME_SKU };

        // WHERE ...
        String whereParameter = DataStoreContract.COLUMN_NAME_BRAND + " = ?";

        // question marks
        String[] whereArgs = { brand };

        Cursor result = db.query(true, DataStoreContract.TABLE_NAME, columnsToRetrieve, whereParameter, whereArgs, null, null, null, null);

        while (result.moveToNext()) {
            String sku =  result.getString(result.getColumnIndexOrThrow(DataStoreContract.COLUMN_NAME_SKU));
            skus.add(sku);
        }

        db.close();
        return skus;

    }

    public ArrayList<BrandObject> getBrands() {
        SQLiteDatabase db = this.getReadableDatabase();
        ArrayList<BrandObject> brands = new ArrayList<BrandObject>();

        // columns to return
        String[] columnsToRetrieve = { DataStoreContract.COLUMN_NAME_BRAND };

        Cursor result = db.query(true, DataStoreContract.TABLE_NAME, columnsToRetrieve, null, null, null, null, null, null);

        while (result.moveToNext()) {
            try {
                String brand = result.getString(result.getColumnIndexOrThrow(DataStoreContract.COLUMN_NAME_BRAND));
//                String color = result.getString(result.getColumnIndexOrThrow(DataStoreContract.COLUMN_NAME_COLOR));
                BrandObject brandObj = new BrandObject(brand);
                brands.add(brandObj);
            }   catch (Exception ex) {
                System.out.println("Error");
            }

        }
        db.close();
        return brands;
    }


}
