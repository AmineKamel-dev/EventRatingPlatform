from flask import Flask, request, jsonify
from app import create_app
from app.extensions import socketio


app = create_app()

# Run the server (Frontend :3000, Backend :5000)
if __name__ == "__main__":
    socketio.run(app, port=5000)
