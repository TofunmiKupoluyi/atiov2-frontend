package com.example.tofunmi.thermalprinterproject;

import android.content.Context;
import android.graphics.Color;
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
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class SelectBrandFragment extends Fragment {
    // The main activity
    private MainActivity mainActivity;
    private DataStore dbStore;
    private ArrayList<DataStore.BrandObject> brands;
    // useful for search indicates what brands the user can actually see
    private ArrayList<DataStore.BrandObject> visibleBrands;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        dbStore = new DataStore(getContext());
        brands = dbStore.getBrands();
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        // Inflate the layout for this fragment
        View rootView = inflater.inflate(R.layout.fragment_select_brand, container, false);
        return rootView;


    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        mainActivity = (MainActivity) getActivity();
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {

        // Creating the table row
        // First hide keyboard if it's open
        mainActivity.hideKeyboard();

        fillBrandsTable();

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
                            clearBrandsTable();
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
                                    clearBrandsTable();
                                    fillBrandsTable();
                                    visibleBrands = brands;
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

    private void search(String query) {
        ArrayList<DataStore.BrandObject> matching = new ArrayList<DataStore.BrandObject>();
        // The (?i) adds case insensitivity
        Pattern pattern = Pattern.compile("(?i)"+query);

        for (int i = 0; i < brands.size(); i++) {
            Matcher m = pattern.matcher(brands.get(i).brand);
            if (m.find())
                matching.add(brands.get(i));
        }
        // Fill the brands table
        fillBrandsTable(matching);

        // Returning buttons to default
        mainActivity.setSyncButtonToDefault(false);
    }


    private void fillBrandsTable() {
        LinearLayout tableRow = (LinearLayout) getLayoutInflater().inflate(R.layout.menu_row, null);

        // Looping through the brands
        for (int i = 0; i < brands.size(); i++) {

            // Creating the button
            Button button = (Button)getLayoutInflater().inflate(R.layout.menu_button, null);
            button.setLayoutParams(new LinearLayout.LayoutParams(0, TableRow.LayoutParams.MATCH_PARENT, 1));
            button.setId(i);
            button.setText(brands.get(i).brand);

            // IDEA TO GIVE GRIDS COLORS -- FULLY IMPLEMENTED BUT DOESN'T LOOK NICE
//            button.setBackgroundColor(Color.parseColor(brands.get(i).color));
            button.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    chooseBrand(view);
                }
            });

            // Adding the button to the row
            tableRow.addView(button);

            // Using i+1 to avoid corner case of first row being singular, adding last element too
            if ((i + 1) % 2 == 0 || i == brands.size() - 1 ) {
                // Adding row to table layout
                LinearLayout tableLayout = (LinearLayout) getView().findViewById(R.id.select_brand_table);
                tableLayout.addView(tableRow);

                // Create a new row
                tableRow = (LinearLayout) getLayoutInflater().inflate(R.layout.menu_row, null);

            }

        }

        visibleBrands = brands;
    }

    private void fillBrandsTable(ArrayList<DataStore.BrandObject> brands) {
        LinearLayout tableRow = (LinearLayout) getLayoutInflater().inflate(R.layout.menu_row, null);

        // Looping through the brands
        for (int i = 0; i < brands.size(); i++) {

            // Creating the button
            Button button = (Button)getLayoutInflater().inflate(R.layout.menu_button, null);
            button.setLayoutParams(new LinearLayout.LayoutParams(0, TableRow.LayoutParams.MATCH_PARENT, 1));
            button.setId(i);
            button.setText(brands.get(i).brand);

            // IDEA TO GIVE GRIDS COLORS -- FULLY IMPLEMENTED BUT DOESN'T LOOK NICE
//            button.setBackgroundColor(Color.parseColor(brands.get(i).color));
            button.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    chooseBrand(view);
                }
            });

            // Adding the button to the row
            tableRow.addView(button);

            // Using i+1 to avoid corner case of first row being singular, adding last element too
            if ((i + 1) % 2 == 0 || i == brands.size() - 1 ) {
                // Adding row to table layout
                LinearLayout tableLayout = (LinearLayout) getView().findViewById(R.id.select_brand_table);
                tableLayout.addView(tableRow);

                // Create a new row
                tableRow = (LinearLayout) getLayoutInflater().inflate(R.layout.menu_row, null);

            }

        }

        visibleBrands = brands;
    }

    private void clearBrandsTable() {
        LinearLayout tableLayout = (LinearLayout) getView().findViewById(R.id.select_brand_table);
        tableLayout.removeAllViews();

    }

    @Override
    public void onDestroyView() {
        mainActivity.setButtonsToDefault(true);
        mainActivity.disableSearch();
        super.onDestroyView();
    }

    @Override
    public void onDetach() {

        super.onDetach();
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

    // This handles brand selection, and opens the sku fragment (calling from main activity) based on the view
    public void chooseBrand(View view) {

        // Id of the button received
        int id = view.getId();

        // Parameters to be passed to select brand
        String brandSelected = visibleBrands.get(id).brand;
        ArrayList<String> skus = dbStore.getSkusFromBrand(brandSelected);

        mainActivity.selectBrand(brandSelected, skus);
    }

}
