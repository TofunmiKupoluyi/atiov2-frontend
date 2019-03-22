package com.example.tofunmi.thermalprinterproject;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Rect;
import android.support.v4.app.DialogFragment;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.method.KeyListener;
import android.view.MotionEvent;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.text.NumberFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Locale;

import io.card.payment.CardIOActivity;
import io.card.payment.CreditCard;

public class MainActivity extends AppCompatActivity implements Loginable {

    // Private members
    // Items ordered
    private ArrayList<OutputItem> orderedItems = new ArrayList<OutputItem>();

    // Database
    private DataStore dbStore;

    // User static strings
    public final static String TABLE_NAME = "user_store";
    public final static String KEY_NAME_USERNAME = "username";
    public final static String KEY_NAME_PASSWORD = "password";
    public final static String KEY_NAME_TERMINAL_DETAILS = "terminal_details";
    public final static String KEY_NAME_BLUETOOTH_PRINTER = "bluetooth_mac_address";
    public final static String KEY_NAME_COMPANY = "company";
    // Implemented fragments
    private SelectBrandFragment selectBrandFragment;
    private SelectSKUFragment selectSKUFragment;
    private SelectQuantityFragment selectQuantityFragment;
    private PayCashFragment payCashFragment;
    private CheckoutFragment checkoutFragment;
    private Locale locale;


    protected NumberFormat currencyFormatter;
    // Public members

    // Public constants for bluetooth
    public final int MY_SCAN_REQUEST_CODE = 2;
    public static String CASH_RECEIPT_CHANGE = "cash_receipt_change";
    public static String CASH_RECEIPT_AMOUNT_PAID= "cash_receipt_amount_paid";
    public static String ORDERED_ITEMS = "ordered_items";

    // Constructor
    public MainActivity() {
        super();
        locale =  new Locale("en", "NG");
        currencyFormatter =  NumberFormat.getCurrencyInstance(locale);
    }

    // Getters and Setters


    public ArrayList<OutputItem> getOrderedItems() {
        return orderedItems;
    }

    // Core activity functions

    // Look into this: https://stackoverflow.com/questions/15313598/once-for-all-how-to-correctly-save-instance-state-of-fragments-in-back-stack
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        // Instantiating SQLite database
        dbStore = new DataStore(getApplicationContext());
        if (savedInstanceState != null) {
            return;
        }

        // Adding the initial fragment
        if (findViewById(R.id.fragment_container) != null) {
            // However, if we're being restored from a previous state,
            // then we don't need to do anything and should return or else
            // we could end up with overlapping fragments.

            selectBrandFragment = new SelectBrandFragment();
            // Set initial total quantity and amount
            setTotalQuantityText(0);
            setTotalAmount(0);

            // Add the fragment to the 'fragment_container' FrameLayout
            getSupportFragmentManager().beginTransaction()
                    .add(R.id.fragment_container, selectBrandFragment).commit();


        }

    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_DOWN) {
            View v = getCurrentFocus();
            if ( v instanceof EditText) {
                Rect outRect = new Rect();
                v.getGlobalVisibleRect(outRect);
                if (!outRect.contains((int)event.getRawX(), (int)event.getRawY())) {
                    v.clearFocus();
                    InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                    imm.hideSoftInputFromWindow(v.getWindowToken(), 0);
                }
            }
        }
        return super.dispatchTouchEvent( event );
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {

        if (requestCode == MY_SCAN_REQUEST_CODE) {
            String resultDisplayStr;
            if (data != null && data.hasExtra(CardIOActivity.EXTRA_SCAN_RESULT)) {
                CreditCard scanResult = data.getParcelableExtra(CardIOActivity.EXTRA_SCAN_RESULT);

                // Never log a raw card number. Avoid displaying it, but if necessary use getFormattedCardNumber()
                resultDisplayStr = "Card Number: " + scanResult.getRedactedCardNumber() + "\n";

                // Do something with the raw number, e.g.:
                // myService.setCardNumber( scanResult.cardNumber );

                if (scanResult.isExpiryValid()) {
                    resultDisplayStr += "Expiration Date: " + scanResult.expiryMonth + "/" + scanResult.expiryYear + "\n";
                }

                if (scanResult.cvv != null) {
                    // Never log or display a CVV
                    resultDisplayStr += "CVV has " + scanResult.cvv.length() + " digits.\n";
                }

                if (scanResult.postalCode != null) {
                    resultDisplayStr += "Postal Code: " + scanResult.postalCode + "\n";
                }
            }

            else {
                resultDisplayStr = "Scan was canceled.";
            }
            // do something with resultDisplayStr, maybe display it in a textView
            // resultTextView.setText(resultDisplayStr);
        }
    }
    // Lifecycle methods to hideKeyboard
    @Override
    protected void onDestroy() {
        dbStore.close();
        hideKeyboard();
        super.onDestroy();
    }

    @Override
    protected void onPause() {
        hideKeyboard();
        super.onPause();
    }

    @Override
    public void onBackPressed() {
        // Back always takes you home, prevents problems
        goHome();
    }


    // Actual heavylifting

    // This is called when a brand is selected. It passes the brandSelected from chooseBrand and passes opens the sku fragment
    public void selectBrand(String brandSelected, ArrayList<String> skus) {
        // Creating a new sku fragment
        selectSKUFragment = new SelectSKUFragment();

        // Creating bundle and sending skus and brandSelected
        Bundle bundle = new Bundle();
        bundle.putString(SelectSKUFragment.BRAND_SELECTED, brandSelected);
        bundle.putStringArrayList(SelectSKUFragment.SKUS_RECEIVED, skus);

        // Setting the arguments
        selectSKUFragment.setArguments(bundle);

        // Replacing fragments
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, selectSKUFragment).addToBackStack(null).commit();
    }

    public void repurposeButton(Button button, String newName, View.OnClickListener newClickListener) {
        button.setOnClickListener(newClickListener);
        button.setText(newName);
    }

    public void setButtonsToDefault(boolean clearText) {
        if (clearText) {
            TextView searchText = (TextView) findViewById(R.id.search_text);
            searchText.setText("");
        }
        repurposeButton((Button) findViewById(R.id.sync_button), "Sync", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Returning to the original
                updateStore(view);
            }
        });

        // After search, change cancel back to original
        repurposeButton((Button) findViewById(R.id.home_button), "Home", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Returning to the original
                goHome(view);
            }
        });
    }

    public void setHomeButtonToDefault(boolean clearText) {
        if (clearText) {
            TextView searchText = (TextView) findViewById(R.id.search_text);
            searchText.setText("");
        }
        // After search, change cancel back to original
        repurposeButton((Button) findViewById(R.id.home_button), "Home", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Returning to the original
                goHome(view);
            }
        });
    }

    public void setSyncButtonToDefault(boolean clearText) {
        if (clearText) {
            TextView searchText = (TextView) findViewById(R.id.search_text);
            searchText.setText("");
        }
        repurposeButton((Button) findViewById(R.id.sync_button), "Sync", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Returning to the original
                updateStore(view);
            }
        });
    }

    public void setHomeButtonText(String newText) {
        Button homeButton = (Button) findViewById(R.id.home_button);
        homeButton.setText(newText);
    }

    public void setSyncButtonText(String newText) {
        Button syncButton = (Button) findViewById(R.id.sync_button);
        syncButton.setText(newText);
    }

    public void setSearchBarHint(String newHint) {
        EditText searchText = (EditText) findViewById(R.id.search_text);
        searchText.setHint(newHint);
    }


    // Disable search
    public void disableSearch() {
        // Disable focus on search
        EditText searchInput = (EditText) findViewById(R.id.search_text);

        // First remove focus if it's there
        if (searchInput.isFocused()) {
            searchInput.clearFocus();
        }
        searchInput.setFocusable(false);
        searchInput.setOnEditorActionListener(null);
    }


    public void activateSearch(View.OnFocusChangeListener listener) {
        EditText searchInput = (EditText)findViewById(R.id.search_text);

        searchInput.setFocusable(true);
        searchInput.setFocusableInTouchMode(true);

        // First remove focus if it's there (necessary)
        if (searchInput.isFocused()) {
            searchInput.clearFocus();
        }

        // Sets the focus change listener
        searchInput.setOnFocusChangeListener(listener);
    }



    public void activateSearch(View.OnFocusChangeListener focusListener, TextView.OnEditorActionListener enterKeyListener) {
        EditText searchInput = (EditText)findViewById(R.id.search_text);

        searchInput.setFocusable(true);
        searchInput.setFocusableInTouchMode(true);

        // First remove focus if it's there (necessary)
        if (searchInput.isFocused()) {
            searchInput.clearFocus();
        }

        // Sets the focus change listener
        searchInput.setOnFocusChangeListener(focusListener);
        searchInput.setOnEditorActionListener(enterKeyListener);

    }

    // This is called when an sku is selected, passes the sku item chosen from chooseSKU and opens the quantity fragment
    public void selectSKU(String brandSelected, String skuSelected, DataStore.PriceObject price) {

        // Creating a new select quantity fragment
        selectQuantityFragment = new SelectQuantityFragment();

        // Creating bundle and sending information to fragment
        Bundle bundle = new Bundle();
        bundle.putString(SelectQuantityFragment.BRAND_SELECTED, brandSelected);
        bundle.putString(SelectQuantityFragment.SKU_SELECTED, skuSelected);
        bundle.putString(SelectQuantityFragment.PRICE, price.price);
        bundle.putString(SelectQuantityFragment.COST_PRICE, price.costPrice);

//        disableSearch();

        // Setting the arguments
        selectQuantityFragment.setArguments(bundle);

        // Add the fragment to the 'fragment_container' FrameLayout
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, selectQuantityFragment).commit();
    }

    public void selectQuantity(OutputItem item) {

        // Addidng the ordered item to the arraylist of ordered items and incrementing the total price
        orderedItems.add(item);
        setTotalQuantityText(item);
        setTotalAmount(item);
        goHome();

    }



    // Utility functions -- you can clear but not set

    // deletes ordered items
    public void deleteOrderedItem(EditRecyclerViewAdapter adapter, int index) {
        // Setting new quantity
        long newQuantity = getTotalQuantityText() - orderedItems.get(index).getQuantity();
        setTotalQuantityText(newQuantity);

        // Setting the new amounts
        double newAmount = getTotalAmountText() - orderedItems.get(index).getTotalPrice();
        setTotalAmount(newAmount);

        // Removing the ordered items
        orderedItems.remove(index);
        adapter.notifyItemRemoved(index);
        adapter.notifyItemRangeChanged(index, adapter.getItemCount());

    }

    // get total quantity
    private int getTotalQuantityText() {

        TextView totalQuantityText = (TextView) findViewById(R.id.total_quantity);

        try {
            String quantity = totalQuantityText.getText().toString();
            int quantityInt = Integer.parseInt(quantity);
            return quantityInt;
        } catch (NumberFormatException ex) {
            // In case it is not already set
            return 0;
        }
    }
    // sets total quantity text
    private void setTotalQuantityText(OutputItem item) {

        TextView totalQuantityText = (TextView) findViewById(R.id.total_quantity);

        try {
            String currentQuantity = totalQuantityText.getText().toString();
            long newQuantity = Long.parseLong(currentQuantity) + item.getQuantity();
            totalQuantityText.setText(Long.toString(newQuantity));
        } catch (NumberFormatException ex) {
            // In case it is not already set
            totalQuantityText.setText(Long.toString(item.getQuantity()));
        }
    }

    private void setTotalQuantityText(long newQuantity) {
        TextView totalQuantityText = (TextView) findViewById(R.id.total_quantity);
        try {
            totalQuantityText.setText(Long.toString(newQuantity));
        } catch (NumberFormatException ex) {
            // In case it is not already set
            Toast.makeText(getApplicationContext(), "There was an error updating the total quantity", Toast.LENGTH_LONG);
        }
    }

    // clears the total quantity text
    public void clearTotalQuantityText() {
       setTotalQuantityText(0);
    }

    // gets the total amount text
    private double getTotalAmountText() {

        TextView totalAmountText = (TextView) findViewById(R.id.total_amount);

        try {
            String amount = totalAmountText.getText().toString();
            double amountDouble = currencyFormatter.parse(amount).doubleValue();
            return amountDouble;
        } catch (ParseException ex) {
            // In case it is not already set
            return 0;
        }
    }

    // sets the total amount text
    private void setTotalAmount(OutputItem item) {
        TextView totalAmountText = (TextView) findViewById(R.id.total_amount);
        double newAmount;
        try {
            String currentAmount = totalAmountText.getText().toString();
            newAmount = currencyFormatter.parse(currentAmount).doubleValue() + item.getTotalPrice();
            String moneyString = currencyFormatter.format(newAmount);
            totalAmountText.setText(moneyString);
        }
        // In case it is not already set
        catch (ParseException ex) {
            String moneyString = currencyFormatter.format(item.getTotalPrice());
            totalAmountText.setText(moneyString);
        }
    }

    private void setTotalAmount(double newAmount) {
        TextView totalAmountText = (TextView) findViewById(R.id.total_amount);
        String moneyString = currencyFormatter.format(newAmount);
        try {
            totalAmountText.setText(moneyString);
        } catch (NumberFormatException ex) {
            // In case it is not already set
            Toast.makeText(getApplicationContext(), "There was an error updating the total amount", Toast.LENGTH_LONG);
        }
    }



    // clears the total amount text
    public void clearTotalAmountText() {
        setTotalAmount(0);
    }

    // opens edit orders fragment
    public void openEditOrdersFragment(View view) {
        hideKeyboard();

        //Disable search
        disableSearch();

        //Add fragments
        EditOrderFragment editOrderFragment = new EditOrderFragment();
        editOrderFragment.setOutputItems(orderedItems);

        getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.fragment_container, editOrderFragment)
                .addToBackStack(null)
                .commit();

        System.out.println("Button clicked");
    }

    // hides the keyboard -- useful for closing after entering amount
    public void hideKeyboard() {
        InputMethodManager imm = (InputMethodManager) getSystemService(Activity.INPUT_METHOD_SERVICE);
        //Find the currently focused view, so we can grab the correct window token from it.
        View view = getCurrentFocus();
        //If no view currently has focus, create a new one, just so we can grab a window token from it
        if (view == null) {
            view = new View(this);
        }
        imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
    }


    // Card io function
    public void onScanPress(View v) {
        Intent scanIntent = new Intent(this, CardIOActivity.class);

        // customize these values to suit your needs.
        scanIntent.putExtra(CardIOActivity.EXTRA_REQUIRE_EXPIRY, true); // default: false
        scanIntent.putExtra(CardIOActivity.EXTRA_REQUIRE_CVV, false); // default: false
        scanIntent.putExtra(CardIOActivity.EXTRA_REQUIRE_POSTAL_CODE, false); // default: false
        scanIntent.putExtra(CardIOActivity.EXTRA_HIDE_CARDIO_LOGO, true);
        scanIntent.putExtra(CardIOActivity.EXTRA_SCAN_INSTRUCTIONS, true);

        // MY_SCAN_REQUEST_CODE is arbitrary and is only used within this activity.
        startActivityForResult(scanIntent, MY_SCAN_REQUEST_CODE);
    }

    // update function
    public void updateStore(View view) {
        if (hasUserBeenSaved()) {
            if (haveTerminalDetailsBeenAdded())
                showSyncFragment();
            else
                showAddTerminalFragment();
        }

        else {
            showLoginFragment();
        }
    }

    public void showSyncFragment() {
        DialogFragment newFragment = new SyncFragment();
        newFragment.show(getSupportFragmentManager(), "update_store");
    }

    public void showLoginFragment() {
        DialogFragment newFragment = new EnterLoginFragment();
        newFragment.show(getSupportFragmentManager(), "enter_login");
    }

    public void showLogoutFragment() {
        // Have option to keep data and to discard data, have text do you want to keep stored transaction data or not?
        DialogFragment newFragment = new LogoutFragment();
        newFragment.show(getSupportFragmentManager(), "logout");
    }

    public void showAddTerminalFragment() {
        DialogFragment newFragment = new AddTerminalFragment();
        newFragment.show(getSupportFragmentManager(), "add_terminal");
    }

    public void logout(boolean clearData) {
        if (clearData) {
            dbStore.clearStoreTable();
            dbStore.clearTransactionTable();
            clearSharedPreferences();
        }   else {
            dbStore.clearStoreTable();
            clearSharedPreferences();
        }
        restart();
    }

    public void sync() {
        new StoreUpdater(this).execute(getUsername(), getPassword());
    }

    public void uploadTransactions() {
        new ArchivedTransactionsUploader(this).execute(getUsername(), getPassword());
    }
    // restart function to re-insert the home fragment after successfully syncing data
    public void restart() {
        selectBrandFragment = new SelectBrandFragment();
        clearTotalQuantityText();
        clearTotalAmountText();
        orderedItems = new ArrayList<OutputItem>();
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, selectBrandFragment).commit();
    }

    public void goHome(View v) {
        goHome();
    }

    public void goHome() {
        hideKeyboard();

        // Make everything default again
        setHomeButtonText("Home");
        setSyncButtonText("Sync");

        selectBrandFragment = new SelectBrandFragment();
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, selectBrandFragment).commit();
    }

    public void openCheckoutView(View v) {
        hideKeyboard();
        checkoutFragment = new CheckoutFragment();
        // Disable search
        disableSearch();
        getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, checkoutFragment).addToBackStack(null).commit();
    }

    public void openPayCashView(View v) {
        payCashFragment = new PayCashFragment();
        // Disable search
        disableSearch();
        getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, payCashFragment).addToBackStack(null).commit();

    }

    public void enterCash(double amount) {
        double change = amount - getTotalAmountText();
        String changeString = currencyFormatter.format(change);
        String totalAmountPaid = currencyFormatter.format(amount);
        Intent intent = new Intent(this, CashReceiptActivity.class);
        intent.putExtra(CASH_RECEIPT_CHANGE, changeString);
        intent.putExtra(CASH_RECEIPT_AMOUNT_PAID, totalAmountPaid);
        intent.putExtra(ORDERED_ITEMS, orderedItems);
        startActivity(intent);
    }


    // Things for users
    public String getUsername() {
        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        String username = settings.getString(KEY_NAME_USERNAME, null);
        return username;
    }

    public String getPassword() {
        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        String password = settings.getString(KEY_NAME_PASSWORD, null);
        return password;
    }

    public String getTerminalDetails() {
        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        String terminalDetails = settings.getString(KEY_NAME_TERMINAL_DETAILS, null);
        return terminalDetails;
    }

    public void setUsername(String username) {
        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        SharedPreferences.Editor editor = settings.edit();
        editor.putString(KEY_NAME_USERNAME, username);
        editor.commit();
    }

    public void setPassword(String password) {
        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        SharedPreferences.Editor editor = settings.edit();
        editor.putString(KEY_NAME_PASSWORD, password);
        editor.commit();
    }

    public void setTerminalDetails(String terminalDetails, String bluetoothPrinter) {
        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        SharedPreferences.Editor editor = settings.edit();
        editor.putString(KEY_NAME_TERMINAL_DETAILS, terminalDetails);
        editor.putString(KEY_NAME_BLUETOOTH_PRINTER, bluetoothPrinter);
        editor.commit();
    }

    public void setCompany(String company) {
        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        SharedPreferences.Editor editor = settings.edit();
        editor.putString(KEY_NAME_COMPANY, company);
        editor.commit();
    }

    private void clearSharedPreferences() {
        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        SharedPreferences.Editor editor = settings.edit();
        editor.clear();
        editor.commit();
    }

    private void clearTerminalPreferences() {
        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        SharedPreferences.Editor editor = settings.edit();
        editor.remove(KEY_NAME_TERMINAL_DETAILS);
        editor.remove(KEY_NAME_BLUETOOTH_PRINTER);
        editor.commit();
    }

    public void changeTerminal() {
        clearTerminalPreferences();
        updateStore(null);
    }

    public boolean hasUserBeenSaved() {
        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        String username = settings.getString(KEY_NAME_USERNAME, null);
        String password = settings.getString(KEY_NAME_PASSWORD, null);
        if (username == null || password == null) {
            return false;
        }   else {
            return true;
        }
    }

    public boolean haveTerminalDetailsBeenAdded() {

        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        String terminalDetails = settings.getString(KEY_NAME_TERMINAL_DETAILS, null);

        if (terminalDetails == null) {
            return false;
        }   else {
            return true;
        }

    }

    public String getBluetoothPrinter() {

        SharedPreferences settings = getSharedPreferences(TABLE_NAME, 0);
        String bluetoothPrinter = settings.getString(KEY_NAME_BLUETOOTH_PRINTER, null);

        if (bluetoothPrinter == null) {
            return "";
        }   else {
            return bluetoothPrinter;
        }

    }

    public void respondToLogin(boolean successful) {
        this.updateStore(null);

    }


}
