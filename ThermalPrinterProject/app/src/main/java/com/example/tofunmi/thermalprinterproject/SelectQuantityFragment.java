package com.example.tofunmi.thermalprinterproject;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;


public class SelectQuantityFragment extends Fragment {
    private MainActivity mainActivity;

    // Constants
    public static final String BRAND_SELECTED = "BRAND_SELECTED";
    public static final String SKU_SELECTED = "SKU_SELECTED";
    public static final String PRICE = "PRICE_SELECTED";
    public static final String COST_PRICE = "COST_PRICE_SELECTED";


    // Private properties
    private String brandSelected;
    private String skuSelected;
    private String price;
    private String costPrice;

    public SelectQuantityFragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_select_quantity, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {

        // Setting the onClick listener
        Button submitButton = getView().findViewById(R.id.qty_button);

        submitButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                chooseQuantity(view);
            }
        });
        mainActivity.setHomeButtonText(brandSelected);

        // Getting the keyboard to show once the fragment is up
        EditText edit = (EditText) view.findViewById(R.id.quantity_input);
        edit.requestFocus();
        InputMethodManager imgr = (InputMethodManager) getActivity().getSystemService(Context.INPUT_METHOD_SERVICE);
        imgr.toggleSoftInput(InputMethodManager.SHOW_FORCED, InputMethodManager.HIDE_IMPLICIT_ONLY);
        super.onViewCreated(view, savedInstanceState);
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        mainActivity = (MainActivity) getActivity();
    }

    @Override
    public void onDestroyView() {
        // Ensure all views are removed when going back home
        super.onDestroyView();
    }

    @Override
    public void onDetach() {
        super.onDetach();
    }

    @Override
    public void setArguments(@Nullable Bundle args) {
        brandSelected = args.getString(BRAND_SELECTED);
        skuSelected = args.getString(SKU_SELECTED);
        price = args.getString(PRICE);
        costPrice = args.getString(COST_PRICE);
    }

    public void chooseQuantity(View view) {
        int quantityInputted;
        // Getting the quantity inputted and parsing it to an integer
        EditText quantityInputtedView = (EditText) mainActivity.findViewById(R.id.quantity_input);
        try {
            quantityInputted = Integer.parseInt(quantityInputtedView.getText().toString());
        } catch (Exception ex) {
            quantityInputted = 0;
        }

        // Getting the price of the item and parsing it to a double, if conversion fails, return 0
        double priceDouble;
        double costPriceDouble;
        try {
            priceDouble = Double.parseDouble(price);
            costPriceDouble = Double.parseDouble(costPrice);
        } catch (Exception ex) {
            priceDouble = 0;
            costPriceDouble = 0;
        }
        // New quantity item object
        OutputItem outputItem = new OutputItem(brandSelected, skuSelected, priceDouble, costPriceDouble, quantityInputted);
        mainActivity.hideKeyboard();
        mainActivity.selectQuantity(outputItem);
    }

    public interface OnFragmentInteractionListener {
        // TODO: Update argument type and name
        void onFragmentInteraction(Uri uri);
    }

}
