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


public class PayCashFragment extends Fragment {
    private MainActivity mainActivity;

    // Constants
    public static final String BRAND_SELECTED = "BRAND_SELECTED";
    public static final String SKU_SELECTED = "SKU_SELECTED";
    public static final String PRICE = "PRICE_SELECTED";


    // Private properties
    private String brandSelected;
    private String skuSelected;
    private String price;

    public PayCashFragment() {
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
        return inflater.inflate(R.layout.fragment_pay_cash, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {

        // Setting the onClick listener
        Button cashButton = getView().findViewById(R.id.cash_button);

        cashButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                enterCash(view);
            }
        });

        // Getting the keyboard to show once the fragment is up
        EditText edit = (EditText) view.findViewById(R.id.cash_input);
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
    public void onDetach() {
        super.onDetach();
    }

    @Override
    public void setArguments(@Nullable Bundle args) {
        brandSelected = args.getString(BRAND_SELECTED);
        skuSelected = args.getString(SKU_SELECTED);
        price = args.getString(PRICE);
    }

    public void enterCash(View view) {
        double cashInputted;
        // Getting the quantity inputted and parsing it to an integer
        EditText cashInputtedView = (EditText) mainActivity.findViewById(R.id.cash_input);
        try {
            cashInputted = Double.parseDouble(cashInputtedView.getText().toString());
        } catch (Exception ex) {
            cashInputted = 0;
        }

        mainActivity.hideKeyboard();
        mainActivity.enterCash(cashInputted);
    }

    public interface OnFragmentInteractionListener {
        // TODO: Update argument type and name
        void onFragmentInteraction(Uri uri);
    }

}
