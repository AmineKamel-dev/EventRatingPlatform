from app.sockets.rating_socket import register_rating_handlers

def register_sockets(socketio):
    register_rating_handlers(socketio)
