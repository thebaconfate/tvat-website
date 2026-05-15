import os
from typing import Dict, cast
from mysql.connector.types import RowItemType
import psycopg
import dotenv
from mysql.connector import connection

dotenv.load_dotenv()
credentials = {"HOST", "PASSWORD", "USER", "DATABASE"}


def get_db_config(prefix):
    config: Dict[str, str | int | None] = {
        credential.lower(): os.getenv(f"{prefix}_{credential}")
        for credential in credentials
    }
    for k, v in config.items():
        if v is None:
            raise Exception(f"Missing value for key: {k}")
    port = os.getenv(f"{prefix}_PORT")
    if port is None:
        raise Exception(f"Missing {prefix}_PORT")
    config["port"] = int(port)
    return config


POSTGRES_CONFIG = get_db_config("POSTGRES")
MYSQL_CONFIG = get_db_config("MYSQL")

pgc = " ".join(
    [
        f"host={POSTGRES_CONFIG['host']}",
        f"dbname={POSTGRES_CONFIG['database']}",
        f"user={POSTGRES_CONFIG['user']}",
        f"password={POSTGRES_CONFIG['password']}",
        f"port={POSTGRES_CONFIG['port']}",
    ]
)
Row = Dict[str, RowItemType]


def migrate(select_sql, params, insert_sql, create_params):
    if params is None:
        params = []
    with connection.MySQLConnection(**MYSQL_CONFIG) as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(select_sql, params)
        with psycopg.connect(pgc) as conn:
            with conn.cursor() as c:
                row = cursor.fetchone()
                while row is not None:
                    row = cast(Row, row)
                    c.execute(insert_sql, create_params(row))
                    row = cursor.fetchone()


select_pickups_sql = """
        SELECT
            c.first_name,
            c.last_name,
            c.email,
            c.owed_euros * 100 + c.owed_cents AS total_owed,
            c.paid,
            c.created_at,
            c.fulfilled,
            p.description,
            JSON_ARRAYAGG(JSON_OBJECT('amount', o.amount, 'product_name', products.name)) AS orders
        FROM krambambouli_customers c
        JOIN krambambouli_orders o
            ON c.id = o.customer_id
        JOIN krambambouli_pickup_locations pl
            ON pl.customer_id = c.id
        JOIN pickup_locations p
            ON p.id = pl.pickup_location_id
        JOIN products
            ON products.id = o.product_id
        GROUP BY
            c.id,
            p.description
        ORDER BY c.id ASC;
    """
select_deliveries_sql = """
        SELECT
            kc.first_name,
            kc.last_name,
            kc.email,
            kc.owed_euros * 100 + kc.owed_cents AS total_owed,
            kc.paid,
            kc.created_at,
            kc.fulfilled,
            kda.street_name,
            kda.house_number,
            kda.bus,
            kda.post,
            kda.city,
            JSON_ARRAYAGG(JSON_OBJECT('product_name', p.name, 'amount', ko.amount)) AS orders
        FROM krambambouli_customers kc
        JOIN krambambouli_orders ko
            ON kc.id = ko.customer_id
        JOIN products p
            ON p.id = ko.product_id
        JOIN krambambouli_delivery_addresses kda
            ON kc.id = kda.customer_id
        GROUP BY
            kc.first_name,
            kc.last_name,
            kc.email,
            total_owed,
            kc.paid,
            kc.created_at,
            kc.fulfilled,
            kda.street_name,
            kda.house_number,
            kda.bus,
            kda.post,
            kda.city,
            p.id;"
    """


def migrate_products():
    select_sql = """
        SELECT
            p.name,
            p.description,
            p.image_url,
            p.euros * 100 + p.cents AS 'price'
        FROM products p
    """
    insert_sql = """
        INSERT INTO products
        (name, description, category, image_url, price)
        VALUES (%s, %s, %s, %s, %s)
    """

    def create_row(row):
        return (
            row["name"],
            row["description"],
            "krambambouli",
            row["image_url"],
            row["price"],
        )

    migrate(select_sql, None, insert_sql, create_row)


def migrate_customers():
    select_sql = """
        SELECT
            c.first_name,
            c.last_name,
            c.email
        FROM krambambouli_customers c
        ORDER BY c.id ASC;
    """
    insert_sql = """
        INSERT INTO krambambouli_customers (email, first_name, last_name)
        VALUES (%s, %s, %s)
        ON CONFLICT (email) DO NOTHING
    """

    def create_row(row):
        return (
            row["email"],
            row["first_name"],
            row["last_name"],
        )

    migrate(select_sql, None, insert_sql, create_row)


def migrate_pickup_locations():
    select_sql = """
        SELECT description, active
        FROM pickup_locations
    """
    insert_sql = """
        INSERT INTO krambambouli_pickup_locations (name, active)
        VALUES (%s, %s)
    """

    def create_params(row):
        return (row["description"], bool(row["active"]))

    migrate(select_sql, None, insert_sql, create_params)


def migrate_orders():
    pass


def migrate_pickup_orders():
    select_sql = """
        SELECT
            c.email,
            c.owed_euros * 100 + c.owed_cents AS total_owed,
            c.paid,
            c.created_at,
            c.fulfilled,
            pl.description,
            JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'amount', o.amount,
                        'product_name', p.name,
                        'product_description', p.description,
                        'price', p.euros * 100 + p.cents,
                        'image_url', p.image_url)) AS orders
        FROM krambambouli_customers c
        JOIN krambambouli_orders o
        ON c.id = o.customer_id
        JOIN products p
        ON o.product_id = p.id
        JOIN krambambouli_pickup_locations kpl
        ON c.id = kpl.customer_id
        JOIN pickup_locations pl
        ON kpl.pickup_location_id = pl.id
        GROUP BY c.id
    """
    with connection.MySQLConnection(**MYSQL_CONFIG) as conn:
        cursor = conn.cursor()
        cursor.execute(select_sql, [])
        row = cursor.fetchone()
        while row is not None:
            print(row)
            row = cursor.fetchone()


def migrate_users():
    select_sql = """
        SELECT
            email,
            password
        FROM users;
    """
    insert_sql = """
        INSERT INTO users (email, password, first_name, last_name)
        VALUES (%s, %s, %s, %s)
    """

    def create_params(row):
        return (row["email"], row["password"], "", "")

    migrate(select_sql, [], insert_sql, create_params)


def migrate_all():
    migrate_users()
    migrate_pickup_locations()
    migrate_products()
    migrate_customers()


if __name__ == "__main__":
    migrate_pickup_orders()
