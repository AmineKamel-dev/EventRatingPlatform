from flask import Flask
from flask_cors import CORS
from .sockets import register_sockets
from .extensions import socketio

def create_app():
    app = Flask(__name__)

    CORS(app)
    
    # handles events
    from app.routes.event_controller import event_bp
    app.register_blueprint(event_bp)

    # handles templates
    from app.routes.template_controller import template_bp
    app.register_blueprint(template_bp)

    # handles dashboard
    from app.routes.dashboard_controller import dashboard_bp
    app.register_blueprint(dashboard_bp)

    # handles votes
    from app.routes.vote_controller import vote_bp
    app.register_blueprint(vote_bp)
    
    
    # Register Socket.IO event handlers
    socketio.init_app(app)
    register_sockets(socketio)


    return app