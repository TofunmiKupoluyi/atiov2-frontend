package com.example.tofunmi.thermalprinterproject;

import android.content.Context;

public interface Loginable {
    // Needs to be implemented in activities that call login task
    public String getUsername();

    public String getPassword();

    public void setUsername(String username);

    public void setPassword(String password);

    public boolean hasUserBeenSaved();

    public void respondToLogin();

    public Context getApplicationContext();
}
