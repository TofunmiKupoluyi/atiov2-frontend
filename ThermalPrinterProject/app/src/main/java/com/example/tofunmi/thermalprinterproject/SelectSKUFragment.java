package com.example.tofunmi.thermalprinterproject;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class SelectSKUFragment extends Fragment {
    // the constant for the arguments received
    public final static String BRAND_SELECTED = "BRAND_SELECTED";
    public final static String SKUS_RECEIVED = "SKUS_RECEIVED";

    // getting the main activity
    MainActivity mainActivity;

    // the argument received
    private String brandSelected;
    private ArrayList<String> skusSelected;
    private ArrayList<String> visibleSkus;
    private DataStore dbStore;

    // the button listener
    View.OnClickListener buttonClickListener = new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            chooseSKU(view);
        }
    };

    public SelectSKUFragment() {
        // Required empty public constructor
    }

    @Override
    public void setArguments(@Nullable Bundle args) {
        brandSelected = args.getString(BRAND_SELECTED);
        skusSelected = args.getStringArrayList(SKUS_RECEIVED);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        dbStore = new DataStore(getContext());
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        // Inflate the layout for this fragment
        View rootView = inflater.inflate(R.layout.fragment_select_sku, container, false);

        return rootView;
    }


    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        mainActivity = (MainActivity) getActivity();
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {

        fillSkuTable();
        mainActivity.setHomeButtonText(brandSelected);
        mainActivity.activateSearch(
                // Focus listener
                new View.OnFocusChangeListener() {
                    @Override
                    public void onFocusChange(View v, boolean hasFocus) {
                        if (!hasFocus) {
//                    fillBrandsTable();
                            // In case the text hasn't been changed back, if it lost focus by going home or some other method, reset here, the functions

                        }
                        if (hasFocus) {
                            clearSkuTable();
                            // Changing the syncButton to search button
                            mainActivity.repurposeButton((Button) mainActivity.findViewById(R.id.sync_button), "Search", new View.OnClickListener() {
                                @Override
                                public void onClick(View view) {
                                    TextView searchText = (TextView) mainActivity.findViewById(R.id.search_text);
                                    search(searchText.getText().toString());
                                }
                            });

                            // Changing the home button to cancel button
                            mainActivity.repurposeButton((Button) mainActivity.findViewById(R.id.home_button), "Cancel", new View.OnClickListener() {
                                @Override
                                public void onClick(View view) {
                                    TextView searchText = (TextView) mainActivity.findViewById(R.id.search_text);
                                    searchText.clearFocus();
                                    mainActivity.setButtonsToDefault(true);
                                    mainActivity.setSyncButtonText(brandSelected);
                                    clearSkuTable();
                                    fillSkuTable();
                                    visibleSkus = skusSelected;
                                }
                            });
                        }
                    }
                },
                new TextView.OnEditorActionListener() {
                    @Override
                    public boolean onEditorAction(TextView textView, int id, KeyEvent keyEvent) {
                        // Check if enter, next or done is pressed
                        if (keyEvent != null || id == EditorInfo.IME_ACTION_NEXT || id == EditorInfo.IME_ACTION_DONE) {
                            TextView searchText = (TextView) mainActivity.findViewById(R.id.search_text);
                            mainActivity.hideKeyboard();
                            searchText.clearFocus();
                            search(searchText.getText().toString());
                        }
                        return true;
                    }
                }
        );


        super.onViewCreated(view, savedInstanceState);
    }

    private void fillSkuTable() {
        // Creating the table row
        LinearLayout tableRow = (LinearLayout) getLayoutInflater().inflate(R.layout.menu_row, null);
//        tableRow.setLayoutParams(new TableLayout.LayoutParams(TableLayout.LayoutParams.MATCH_PARENT, TableLayout.LayoutParams.MATCH_PARENT, 1));

        // Looping through the brands
        for (int i = 0; i < skusSelected.size(); i++) {

            // Creating the button
            Button button = (Button)getLayoutInflater().inflate(R.layout.menu_button, null);
            button.setLayoutParams(new LinearLayout.LayoutParams(0, TableRow.LayoutParams.MATCH_PARENT, 1));

            button.setId(i);
            button.setText(skusSelected.get(i));

            // Setting the onclick listener
            button.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    chooseSKU(view);
                }
            });

            // Adding the button to the row
            tableRow.addView(button);

            // Using i+1 to avoid corner case of first row being singular, adding last element too
            if ((i + 1) % 2 == 0 || i == skusSelected.size() - 1 ) {
                // Adding row to table layout
                LinearLayout tableLayout = (LinearLayout) getView().findViewById(R.id.select_sku_table);
                tableLayout.addView(tableRow);

                // Create a new row
                tableRow = (LinearLayout) getLayoutInflater().inflate(R.layout.menu_row, null);

            }

        }

        visibleSkus = skusSelected;
    }

    private void fillSkuTable(ArrayList<String> skusSelected) {
        // Creating the table row
        LinearLayout tableRow = (LinearLayout) getLayoutInflater().inflate(R.layout.menu_row, null);
//        tableRow.setLayoutParams(new TableLayout.LayoutParams(TableLayout.LayoutParams.MATCH_PARENT, TableLayout.LayoutParams.MATCH_PARENT, 1));

        // Looping through the brands
        for (int i = 0; i < skusSelected.size(); i++) {

            // Creating the button
            Button button = (Button)getLayoutInflater().inflate(R.layout.menu_button, null);
            button.setLayoutParams(new LinearLayout.LayoutParams(0, TableRow.LayoutParams.MATCH_PARENT, 1));

            button.setId(i);
            button.setText(skusSelected.get(i));

            // Setting the onclick listener
            button.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    chooseSKU(view);
                }
            });

            // Adding the button to the row
            tableRow.addView(button);

            // Using i+1 to avoid corner case of first row being singular, adding last element too
            if ((i + 1) % 2 == 0 || i == skusSelected.size() - 1 ) {
                // Adding row to table layout
                LinearLayout tableLayout = (LinearLayout) getView().findViewById(R.id.select_sku_table);
                tableLayout.addView(tableRow);

                // Create a new row
                tableRow = (LinearLayout) getLayoutInflater().inflate(R.layout.menu_row, null);

            }

        }

        visibleSkus = skusSelected;
    }

    private void search(String query) {
        ArrayList<String> matching = new ArrayList<String>();
        // The (?i) adds case insensitivity
        Pattern pattern = Pattern.compile("(?i)"+query);

        for (int i = 0; i < skusSelected.size(); i++) {
            Matcher m = pattern.matcher(skusSelected.get(i));
            if (m.find())
                matching.add(skusSelected.get(i));
        }

        // Fill the brands table
        fillSkuTable(matching);

        // Returning buttons to default
        mainActivity.setSyncButtonToDefault(false);
    }

    private void clearSkuTable() {
        LinearLayout tableLayout = (LinearLayout) getView().findViewById(R.id.select_sku_table);
        tableLayout.removeAllViews();
    }


    @Override
    public void onDetach() {
        super.onDetach();
    }


    // We get the id selected, create a new output item and send it to mainActivity.selectSKU. This in turn replaces the fragment and goes back home
    public void chooseSKU(View view) {

        // Id of the button received
        int id = view.getId();

        // Parameters to be passed to select brand
        String skuSelected = visibleSkus.get(id);
        DataStore.PriceObject price = dbStore.getPrice(brandSelected, skuSelected);
        mainActivity.selectSKU(brandSelected, skuSelected, price);

    }

    @Override
    public void onDestroyView() {
        mainActivity.setButtonsToDefault(true);
        mainActivity.disableSearch();
        super.onDestroyView();
    }

    /**
     * This interface must be implemented by activities that contain this
     * fragment to allow an interaction in this fragment to be communicated
     * to the activity and potentially other fragments contained in that
     * activity.
     * <p>
     * See the Android Training lesson <a href=
     * "http://developer.android.com/training/basics/fragments/communicating.html"
     * >Communicating with Other Fragments</a> for more information.
     */
    public interface OnFragmentInteractionListener {
        // TODO: Update argument type and name
        void onFragmentInteraction(Uri uri);
    }
}
