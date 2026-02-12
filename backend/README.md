```plaintext
########################################################################################################
##################################     BACKEND STRUCTURE     ###########################################

backend/
│
├── app/
│   ├── __init__.py
│   ├── config.py                      # Handles environment-based config
│   ├── extensions.py
│   └── ...
│   │
│   ├── api/
│   │   ├── routes/                    # Contains all Flask route blueprints
│   │   │   ├── user_routes.py
│   │   │   ├── chat_routes.py
│   │   │   └── ...
│   │   └── schemas/                   # Schemas handle data validation/serialization (e.g., API input/output).
│   │       └── user_schema.py
│   │       └── ...
│   │
│   ├── socketio/                      # Real-time event handlers
│   │   ├── events.py
│   │   ├── namespaces/
│   │   │   ├── chat_namespace.py
│   │   │   └── ...
│   │
│   ├── models/                        # Data models or Firestore schemas / Models define data structure (e.g., DB fields).
│   │   └── firebase_models.py
│   │   └── ...
│   │
│   ├── services/
│   │   ├── firebase_service.py
│   │   ├── auth_service.py
│   │   └── business_logic.py
│   │   └── ...
│   │
│   └── utils/
│       ├── validation.py
│       └── helpers.py
│       └── ...
│
├── run.py
├── requirements.txt                   # Python dependencies
├── .env                               # Environment variables (not committed)
└── README.md
```

#############################################################################################################################
############################################## BACKEND MILESTONES ###########################################################

## Milestone 1: Project Skeleton & Basics

**Goal:** Setup Flask project with modular structure and connect to Firebase.

- Setup virtual environment and install dependencies
- Create `create_app()` function with environment-based config
- Connect to Firebase Firestore
- Implement basic `/ping` route
- Return sample user data from Firebase

---

## Milestone 2: Authentication & Firebase Integration

**Goal:** Implement Firebase authentication and user management.

- Firebase Admin SDK token verification
- Create `@require_auth` for protected routes
- Add endpoints:
  - `GET /users/me` — current user info
  - `POST /users` — create new user in Firestore

---

## Milestone 3: REST API & Business Logic

**Goal:** Build RESTful APIs with input validation and service layer.

- Design RESTful endpoints (`GET`, `POST`, `PUT`, `DELETE`)
- Validate input data (using Marshmallow or manually)
- Separate business logic into service modules / Put core operations (e.g., reading/writing data) in dedicated Python files (services/), keeping routes simple and maintainable.
- Implement Firestore querying and nested collections / Write code to fetch and update data from Firestore, including handling subcollections inside documents.

---
