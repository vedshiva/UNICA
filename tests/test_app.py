import unittest
from decimal import Decimal

from app import create_app
from app.extensions import db
from app.models import Category, MenuItem


class AppTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": "sqlite://",
            }
        )
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            category = Category(name="Hot Beverages")
            db.session.add(category)
            db.session.flush()
            db.session.add_all(
                [
                    MenuItem(
                        category=category,
                        name="Cappuccino",
                        price=Decimal("160.00"),
                    ),
                    MenuItem(
                        category=category,
                        name="Unavailable item",
                        price=Decimal("99.00"),
                        available=False,
                    ),
                ]
            )
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_health_reports_database_available(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"status": "ok", "database": "available"})

    def test_menu_returns_available_items_with_exact_price(self):
        response = self.client.get("/api/menu")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json,
            {
                "items": [
                    {
                        "id": 1,
                        "name": "Cappuccino",
                        "category": "Hot Beverages",
                        "price": "160.00",
                    }
                ]
            },
        )

    def test_frontend_and_assets_are_served(self):
        for path in ("/", "/styles.css", "/script.js"):
            with self.subTest(path=path):
                with self.client.get(path) as response:
                    self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
