#!/bin/bash

# Script to clear AsyncStorage for the Expense Management app
# This will force the app to show the login screen on next launch

echo "Clearing AsyncStorage for Expense Management app..."

# For Android
if command -v adb &> /dev/null; then
    echo "Clearing Android app data..."
    adb shell pm clear host.exp.exponent
    echo "✓ Android AsyncStorage cleared"
else
    echo "⚠ adb not found, skipping Android clear"
fi

# For iOS Simulator
if command -v xcrun &> /dev/null; then
    echo "Clearing iOS Simulator app data..."
    xcrun simctl privacy booted reset all host.exp.Exponent
    echo "✓ iOS Simulator AsyncStorage cleared"
else
    echo "⚠ xcrun not found, skipping iOS clear"
fi

echo ""
echo "Done! Restart your app to see the login screen."
