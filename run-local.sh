#!/bin/bash

# Secure Local Command Centre Dashboard
# Accessible on local network with password protection

cd "$(dirname "$0")"

echo "🔐 Starting Secure Command Centre Dashboard..."
echo "📱 Access from mobile: http://192.168.0.70:3000"
echo "🔑 Username: adam"  
echo "🔑 Password: CommandCentre2026!"
echo ""
echo "Press Ctrl+C to stop"

npm run dev