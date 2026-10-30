# Unica Café Website

The project currently contains the customer-facing website and the first Flask backend foundation. The site still uses sample menu data in the browser, and checkout is a demo; no real orders or payments are processed.

## Run the Flask app locally

Requires Python 3.11 or newer.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
flask --app run.py db upgrade
flask --app run.py run --debug
```

Open `http://127.0.0.1:5000`. Flask uses a local SQLite database by default, stored under `instance/`. Set `DATABASE_URL` before running the app to use another database. For MySQL, install the dependencies from `requirements.txt` and configure a URI such as:

```text
mysql+pymysql://USER:PASSWORD@HOST:3306/DATABASE
```

Keep credentials in environment variables, not in source control. The `.gitignore` excludes the local database and `.env` files.

## Backend endpoints

- `GET /api/health` — checks that the configured database is reachable.
- `GET /api/menu` — returns available menu items stored in the database. Prices are returned as decimal strings to avoid floating-point currency errors.

The database currently contains `Category` and `MenuItem` models. No menu items are seeded: confirm the café's menu and prices before loading them. After changing models, create and apply a migration:

```powershell
flask --app run.py db migrate -m "Describe the schema change"
flask --app run.py db upgrade
```

## Existing frontend and QR preview

You can still open `index.html` directly or use VS Code Live Server. To use the Flask-served version, run the app as above. A URL such as `http://127.0.0.1:5000/?table=4` only displays a frontend preview label; the table number is not authenticated or verified.

The browser menu remains hardcoded in `script.js` and is not yet connected to `/api/menu`. The checkout button intentionally does not submit an order or accept payment.

## Before a production launch

- Verify the café's menu, prices, customizations, tax/billing rules, and order workflow.
- Connect the frontend to the API and implement server-validated order creation.
- Add secure staff authentication and authorization, kitchen and admin workflows, and order tracking.
- Add recipe-based inventory only after agreeing on recipes and stock-deduction rules.
- Integrate and verify a payment provider on the server only if online payments are required.
- Replace demo photos with approved café assets or properly licensed images.
- Configure production secrets, HTTPS, backups and restore testing, monitoring, and deployment rollback.
- Review applicable local business, food-service, payment, privacy, and data-retention requirements.
- Check all asset, font, and dependency licenses before commercial use.

## Project structure

- `app/` — Flask application, extensions, and database models
- `migrations/` — database schema history
- `tests/` — backend tests
- `index.html` — customer-facing page
- `styles.css` — responsive visual system
- `script.js` — current sample menu and cart interactions
- `run.py` — Flask entry point
