package com.example.tofunmi.thermalprinterproject;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Locale;


public class EditOrderFragment extends Fragment {
    private ArrayList<OutputItem> outputItems;
    private MainActivity mainActivity;

    public EditOrderFragment() {
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
        return inflater.inflate(R.layout.fragment_edit_order, container, false);
    }

    // Allows output items to be set
    public void setOutputItems(ArrayList<OutputItem> outputItems) {
        this.outputItems = outputItems;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        createRecyclerView();
        super.onViewCreated(view, savedInstanceState);

    }

    private void createRecyclerView() {
        RecyclerView parentView = (RecyclerView) getView().findViewById(R.id.edit_order_view);
        LinearLayoutManager layoutManager = new LinearLayoutManager(getContext());
        parentView.setLayoutManager(layoutManager);
        parentView.setAdapter(new EditRecyclerViewAdapter(mainActivity, outputItems));
    }


    @Override
    public void onAttach(Context context) {
        mainActivity = (MainActivity) getActivity();
        super.onAttach(context);
    }

    @Override
    public void onDetach() {
        super.onDetach();
    }

    public void deleteItem(int index) {
        outputItems.remove(index);
        // call mainactivity.setOutputItems from here
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

class EditRecyclerViewAdapter extends RecyclerView.Adapter<EditRecyclerViewAdapter.ViewHolder> {

    ArrayList<OutputItem> orderedItems;
    MainActivity activity;
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

    public EditRecyclerViewAdapter(MainActivity activity, ArrayList<OutputItem> orderedItems) {
        this.activity = activity;
        this.orderedItems = orderedItems;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LinearLayout linearLayout = (LinearLayout) LayoutInflater.from(parent.getContext()).inflate(R.layout.recycle_view_linear_layout, parent, false);

        ViewHolder vh = new ViewHolder(linearLayout);
        return vh;
    }

    public void onBindViewHolder(ViewHolder holder, int position) {
        OutputItem orderedItem = orderedItems.get(position);

        // Getting the text section
        LinearLayout textSection = (LinearLayout) holder.linearLayout.getChildAt(0);

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

        // Adding an on click listener to the delete button
        Button deleteButton = (Button) holder.linearLayout.getChildAt(1);
        deleteButton.setOnClickListener(new DeleteOnClickListener(activity, this, position));

    }

    @Override
    public int getItemCount() {
        return orderedItems.size();
    }
}

class DeleteOnClickListener implements View.OnClickListener {
    private MainActivity activity;
    private EditRecyclerViewAdapter adapter;
    private int itemIndex;

    public DeleteOnClickListener(MainActivity activity, EditRecyclerViewAdapter adapter, int itemIndex) {
        this.activity = activity;
        this.adapter = adapter;
        this.itemIndex = itemIndex;
    }
    @Override
    public void onClick(View view) {
        activity.deleteOrderedItem(adapter, itemIndex);
    }
}
