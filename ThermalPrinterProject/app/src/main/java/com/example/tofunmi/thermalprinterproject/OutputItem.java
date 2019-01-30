package com.example.tofunmi.thermalprinterproject;

import java.io.Serializable;

public class OutputItem implements Serializable{
    // Private members
    private String brandSelected;
    private String skuSelected;
    private double price;
    private double costPrice;
    private long quantity;
    private double totalPrice;
    private double totalCostPrice;

    // Constructor
//    OutputItem(String brandSelected, String skuSelected, double price, int quantity) {
//        this.brandSelected = brandSelected;
//        this.skuSelected = skuSelected;
//        this.price = price;
//        this.costPrice = 0;
//        this.quantity = quantity;
//        this.totalPrice = price * quantity;
//        this.totalCostPrice = 0;
//    }

    OutputItem(String brandSelected, String skuSelected, double price, double costPrice, int quantity) {
        this.brandSelected = brandSelected;
        this.skuSelected = skuSelected;
        this.price = price;
        this.costPrice = costPrice;
        this.quantity = quantity;
        this.totalPrice = price * quantity;
        this.totalCostPrice = costPrice * quantity;
    }

    // Getters and setters
    String getBrandSelected() {
        return brandSelected;
    }

    String getSkuSelected() {
        return skuSelected;
    }

    double getPrice() {
        return price;
    }

    double getCostPrice() { return costPrice; }

    long getQuantity() {
        return quantity;
    }

    double getTotalPrice() {
        return totalPrice;
    }

    double getTotalCostPrice() { return totalCostPrice; }
}
