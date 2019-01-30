package com.example.tofunmi.thermalprinterproject;


import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.support.v4.app.DialogFragment;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

public class LogoutFragment extends DialogFragment {
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        LayoutInflater inflater = getActivity().getLayoutInflater();
        // Use the Builder class for convenient dialog construction
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        final View view = inflater.inflate(R.layout.fragment_logout, null);

        builder.setView(view);

        builder.setPositiveButton("Keep Data", new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                ((MainActivity)getActivity()).logout(false);
                // User cancelled the dialog
            }
        });



        builder.setNegativeButton("Clear Data", new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                // User cancelled the dialog
                ((MainActivity)getActivity()).logout(true);
            }
        });
        // Create the AlertDialog object and return it
        return builder.create();

    }

}
