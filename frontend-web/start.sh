#!/bin/bash

echo "🎨 Starting Expense Management Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --no-bin-links
fi

echo "✅ Starting development server..."
echo "Frontend will be available at: http://localhost:3000"
echo ""

npx vite --host
