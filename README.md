# Unica Café Website

The project currently contains the customer-facing website and the first Flask backend foundation. The site still uses sample menu data in the browser, and checkout is a demo; no real orders or payments are processed.

## Run the Flask app locally

Requires Python 3.11.9 (`.python-version`).

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
flask --app run.py db upgrade
flask --app run.py run --debug
```

Open `http://127.0.0.1:5000`. Flask uses a local SQLite database by default, stored under `instance/`. The `.env.example` file is a template; replace the example `SECRET_KEY` before using sessions and do not commit `.env`.

For MySQL, set `DATABASE_URL` to a connection URL such as:

```text
mysql+pymysql://USER:PASSWORD@HOST:3306/DATABASE
```

The `mysql://` URL prefix is also normalized to `mysql+pymysql://`. Keep real database credentials in environment variables, not in source control. The `.gitignore` excludes local database and `.env` files.

## Render deployment

The root `render.yaml` configures a native Python web service with Python 3.11.9 (from `.python-version`), Gunicorn, a health check, and database migrations as a pre-deploy command. It uses Render's paid `0.5c-512mb` plan; check current pricing and change the plan in `render.yaml` before creating the Blueprint if needed. Importing the Blueprint creates cloud resources and can incur charges.

Render Blueprints manage Render Postgres databases directly, not MySQL. Provision MySQL separately before creating the web service:

1. Create a private MySQL service using a reviewed, maintained MySQL image or template; place it in the same Render region as the web service.
2. Configure `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_ROOT_PASSWORD` in the MySQL service's environment settings. Use strong, distinct passwords and never commit them.
3. Attach persistent storage at the MySQL image's data directory (commonly `/var/lib/mysql`). Choose a disk size based on actual needs and configure separate backups; a disk alone is not a backup.
4. Wait for the database service to become healthy and obtain its private hostname. Keep public database access disabled where possible.

Then connect the app:

1. Push the project to your GitHub repository and create a Render Blueprint from the repository's `render.yaml`.
2. Provide `DATABASE_URL` when prompted. Use `mysql+pymysql://USER:PASSWORD@PRIVATE_HOST:3306/DATABASE`; URL-encode special characters in the username or password.
3. Review the selected paid plan and Blueprint changes before confirming resource creation. The Blueprint generates `SECRET_KEY` and sets `APP_ENV=production`.
4. Deploy and verify `/`, `/api/health`, and `/api/menu` in the Render URL and logs.

The app refuses to start without `SECRET_KEY` or a MySQL `DATABASE_URL`. The pre-deploy migration command must be able to reach MySQL. This repository does not provision MySQL, connect a GitHub repository, or create/deploy cloud resources automatically.

The Blueprint uses:

- **Build command:** `pip install -r requirements.txt`
- **Pre-deploy command:** `flask --app run.py db upgrade`
- **Start command:** `gunicorn --bind 0.0.0.0:$PORT run:app`
- **Health check:** `/api/health`

The pre-deploy command runs on a separate instance, so ensure it can reach the configured MySQL server. Never commit production credentials or paste them into project files.

## Backend endpoints

- `GET /api/health` — checks that the configured database is reachable.
- `GET /api/menu` — returns available menu items stored in the database. Prices are returned as decimal strings to avoid floating-point currency errors.

The database currently contains `Category` and `MenuItem` models. No menu items are seeded: confirm the café's menu and prices before loading them. After changing models, create and apply a migration:

```powershell
flask --app run.py db migrate -m "Describe the schema change"
flask --app run.py db upgrade
```

On Render, run `flask --app run.py db upgrade` as the pre-deploy command for a paid web service. If deploying on a plan without pre-deploy commands, apply migrations through an approved one-off command workflow before starting the new app version; do not run migrations independently in every Gunicorn worker.

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
