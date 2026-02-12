from flask_socketio import emit


# This function registers our event handlers to the socketio instance.
def register_rating_handlers(socketio):
    
    # This decorator tells Flask-SocketIO:
    # "When a client sends a message with the event name 'submit_vote_realtime',
    # run the function below (handle_vote)."
    @socketio.on("submit_vote_realtime")
    
    def handle_vote(data):
        print("Vote received from client:", data)
        
        # 'emit' is used to send messages to clients
        # This line sends the same message back to *all connected clients*,
        emit('submit_vote_realtime', data, broadcast=True)