from sqlalchemy import CheckConstraint, Numeric

from .extensions import db


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    menu_items = db.relationship(
        "MenuItem",
        back_populates="category",
        cascade="all, delete-orphan",
    )


class MenuItem(db.Model):
    __tablename__ = "menu_items"
    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_menu_items_price_nonnegative"),
    )

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(
        db.Integer,
        db.ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = db.Column(db.String(120), nullable=False)
    price = db.Column(Numeric(10, 2), nullable=False)
    available = db.Column(db.Boolean, nullable=False, default=True)
    category = db.relationship("Category", back_populates="menu_items")
