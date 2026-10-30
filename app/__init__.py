from pathlib import Path

from flask import Flask, jsonify, send_from_directory
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from .extensions import db, migrate


PROJECT_ROOT = Path(__file__).resolve().parent.parent


def create_app(test_config=None):
    app = Flask(
        __name__,
        static_folder=None,
        instance_relative_config=True,
    )
    app.config.from_object("config.Config")
    if test_config:
        app.config.update(test_config)

    if app.config["APP_ENV"] == "production":
        if not app.config["SECRET_KEY"]:
            raise RuntimeError("SECRET_KEY must be configured in production")
        if not app.config["SQLALCHEMY_DATABASE_URI"].startswith(
            "mysql+pymysql://"
        ):
            raise RuntimeError(
                "Production requires a MySQL DATABASE_URL using PyMySQL"
            )

    Path(app.instance_path).mkdir(parents=True, exist_ok=True)
    db.init_app(app)
    migrate.init_app(app, db)

    from . import models  # noqa: F401

    @app.get("/")
    def index():
        return send_from_directory(PROJECT_ROOT, "index.html")

    @app.get("/styles.css")
    def stylesheet():
        return send_from_directory(PROJECT_ROOT, "styles.css")

    @app.get("/script.js")
    def javascript():
        return send_from_directory(PROJECT_ROOT, "script.js")

    @app.get("/api/health")
    def health():
        try:
            db.session.execute(text("SELECT 1"))
        except SQLAlchemyError:
            app.logger.exception("Database health check failed")
            return jsonify(status="error", database="unavailable"), 503
        return jsonify(status="ok", database="available")

    @app.get("/api/menu")
    def menu():
        from .models import MenuItem

        items = (
            db.session.query(MenuItem)
            .join(MenuItem.category)
            .filter(MenuItem.available.is_(True))
            .order_by(MenuItem.category_id, MenuItem.name)
            .all()
        )
        return jsonify(
            items=[
                {
                    "id": item.id,
                    "name": item.name,
                    "category": item.category.name,
                    "price": format(item.price, ".2f"),
                }
                for item in items
            ]
        )

    return app
