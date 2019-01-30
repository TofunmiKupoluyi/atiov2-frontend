package com.example.tofunmi.thermalprinterproject;

import android.content.Intent;
import android.content.SharedPreferences;
import android.support.annotation.NonNull;
import android.support.v4.app.DialogFragment;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Locale;

public class CashReceiptActivity extends AppCompatActivity implements Loginable, Receiptible {
    private ArrayList<OutputItem> orderedItems;
    private String change;
    private String totalAmountPaid;
    private Locale locale = new Locale("en", "NG");
    private NumberFormat currencyFormatter =  NumberFormat.getCurrencyInstance(locale);
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cash_receipt);
        Intent intent = getIntent();

        // Getting the change and the ordered items
        change = intent.getStringExtra(MainActivity.CASH_RECEIPT_CHANGE);
        totalAmountPaid = intent.getStringExtra(MainActivity.CASH_RECEIPT_AMOUNT_PAID);
        orderedItems = (ArrayList<OutputItem>) intent.getSerializableExtra(MainActivity.ORDERED_ITEMS);


        setChangeText(change);
        createRecyclerView();
    }

    protected void onActivityResult(int requestCode, int resultCode, Intent data) {

        if (requestCode == BluetoothPrint.REQUEST_ENABLE_BT) {
            // Make sure the request was successful
            if (resultCode == RESULT_OK) {
                System.out.println("Bluetooth now up");
            } else {
                //close the application
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    private void setChangeText(String newChange) {
        TextView changeTextView = (TextView) findViewById(R.id.cash_receipt_change);
        changeTextView.setText("Change: "+change);
    }

//    public void goToNextOrder(View v) {
//        // Archive transaction
//        new ArchivedTransactionsUpdater(this).execute(orderedItems);
//        Intent intent = new Intent(this, MainActivity.class);
//        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
//        startActivity(intent);
//    }

    public void openCustomerDetailsFragment(View v) {
        DialogFragment newFragment = new EnterCustomerDetails();
        newFragment.show(getSupportFragmentManager(), "customer_details");
    }

    public void goToNextOrder(String customerName, String phoneNumber) {
        // Archive transaction
        new ArchivedTransactionsUpdater(this).execute(orderedItems, customerName, phoneNumber);
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
    }

    public void showEnterEmailDialog(View v) {
        if (hasUserBeenSaved()) {
            DialogFragment newFragment = new EnterEmailFragment();
            newFragment.show(getSupportFragmentManager(), "enter_email");
        }
        else {
            DialogFragment newFragment = new EnterLoginFragment();
            newFragment.show(getSupportFragmentManager(), "enter_login");
        }
    }

    public void sendEmail(String email) {
        String modeOfPayment = "Cash";
        String amountPaid = totalAmountPaid;
        String change = this.change;
        new EmailReceipt(this, orderedItems).execute(getUsername(), getPassword(), email, modeOfPayment, amountPaid, change);
    }

    public void printMessage(View v) {
        try {
            new BluetoothPrint(this, orderedItems, "Cash" , currencyFormatter.parse(this.change).doubleValue()).execute();
        }   catch (Exception ex) {
            new BluetoothPrint(this, orderedItems, "Cash").execute();
        }
    }

    private void createRecyclerView() {
        RecyclerView parentView = (RecyclerView) findViewById(R.id.cash_receipt_list_view);
        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        parentView.setLayoutManager(layoutManager);
        parentView.setAdapter(new ReceiptRecyclerViewAdapter(orderedItems));
    }


    // Loginable implementations
    public String getUsername() {
        SharedPreferences settings = getSharedPreferences(MainActivity.TABLE_NAME, 0);
        String username = settings.getString(MainActivity.KEY_NAME_USERNAME, null);
        return username;
    }

    public String getPassword() {
        SharedPreferences settings = getSharedPreferences(MainActivity.TABLE_NAME, 0);
        String password = settings.getString(MainActivity.KEY_NAME_PASSWORD, null);
        return password;
    }

    public void setUsername(String username) {
        SharedPreferences settings = getSharedPreferences(MainActivity.TABLE_NAME, 0);
        SharedPreferences.Editor editor = settings.edit();
        editor.putString(MainActivity.KEY_NAME_USERNAME, username);
        editor.commit();
    }

    public void setPassword(String password) {
        SharedPreferences settings = getSharedPreferences(MainActivity.TABLE_NAME, 0);
        SharedPreferences.Editor editor = settings.edit();
        editor.putString(MainActivity.KEY_NAME_PASSWORD, password);
        editor.commit();
    }

    public boolean hasUserBeenSaved() {
        SharedPreferences settings = getSharedPreferences(MainActivity.TABLE_NAME, 0);
        String username = settings.getString(MainActivity.KEY_NAME_USERNAME, null);
        String password = settings.getString(MainActivity.KEY_NAME_PASSWORD, null);
        if (username == null || password == null) {
            return false;
        }   else {
            return true;
        }
    }

    public void respondToLogin() {
        this.showEnterEmailDialog(null);
    }



}

class ReceiptRecyclerViewAdapter extends RecyclerView.Adapter<ReceiptRecyclerViewAdapter.ViewHolder> {

    ArrayList<OutputItem> orderedItems;
    private Locale nigeria = new Locale("en", "NG");
    private NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(nigeria);

    public static class ViewHolder extends RecyclerView.ViewHolder {
        // each data item is just a string in this case
        public LinearLayout linearLayout;

        public ViewHolder(LinearLayout linearLayout) {
            super(linearLayout);
            this.linearLayout = linearLayout;
        }
    }

    public ReceiptRecyclerViewAdapter(ArrayList<OutputItem> orderedItems) {
        this.orderedItems = orderedItems;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LinearLayout linearLayout = (LinearLayout) LayoutInflater.from(parent.getContext()).inflate(R.layout.receipt_recycle_item, parent, false);

        ViewHolder vh = new ViewHolder(linearLayout);
        return vh;
    }

    public void onBindViewHolder(ViewHolder holder, int position) {
        OutputItem orderedItem = orderedItems.get(position);

        // Getting the text section
        LinearLayout textSection = (LinearLayout) holder.linearLayout;

        // Getting all relevant textviews in the text section
        TextView titleText = (TextView)  textSection.getChildAt(0);
        TextView pricePerQuantityText = (TextView) ((LinearLayout) ((ScrollView) textSection.getChildAt(1)).getChildAt(0)).getChildAt(0);
        TextView quantityText = (TextView) ((LinearLayout) ((ScrollView) textSection.getChildAt(1)).getChildAt(0)).getChildAt(1);
        TextView totalPriceText = (TextView) ((LinearLayout) ((ScrollView) textSection.getChildAt(1)).getChildAt(0)).getChildAt(2);

        // Setting the text of relevant fields
        String unitPrice = currencyFormatter.format(orderedItem.getPrice())+ " /pcs";
        String quantity = String.valueOf(orderedItem.getQuantity()) + " pcs";
        String totalPrice = currencyFormatter.format(orderedItem.getTotalPrice());

        titleText.setText(orderedItem.getBrandSelected() + " " + orderedItem.getSkuSelected());
        pricePerQuantityText.setText(unitPrice);
        quantityText.setText(quantity);
        totalPriceText.setText(totalPrice);

    }

    @Override
    public int getItemCount() {
        return orderedItems.size();
    }
}



