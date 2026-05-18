from datetime import datetime
import os
from typing import Dict, List, cast
from mysql.connector.types import RowItemType
import psycopg
import dotenv
import json
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
        INSERT INTO customers (email, first_name, last_name)
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


def migrate_order_items(order_id, order_items, pg_cursor):
    select_product_id = """
        SELECT p.id
        FROM products p
        WHERE p.name = %s
        AND p.description = %s
        AND p.price = %s
        AND p.image_url = %s
    """
    insert_order_item_sql = """
        INSERT INTO krambambouli_order_items
        (order_id, product_id, amount)
        VALUES (%s, %s, %s)
    """
    for item in order_items:
        params = (
            item["product_name"],
            item["product_description"],
            item["price"],
            item["image_url"],
        )
        pg_cursor.execute(select_product_id, params)
        product_id = pg_cursor.fetchone()
        if product_id is None:
            raise Exception("Product id not found")
        product_id = product_id[0]
        pg_cursor.execute(insert_order_item_sql, (order_id, product_id, item["amount"]))


def migrate_pickup_orders():
    select_from_mysql = """
        SELECT
            c.email,
            c.owed_euros * 100 + c.owed_cents AS total_owed,
            c.paid,
            c.created_at,
            c.fulfilled,
            pl.description,
            pl.active,
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
        GROUP BY c.id, pl.description, pl.active
    """
    select_customer_id_sql = """
        SELECT id
        FROM customers c
        WHERE c.email = %s
    """
    select_pickup_location_id_sql = """
        SELECT id
        FROM krambambouli_pickup_locations l
        WHERE l.name = %s AND l.active = %s
    """
    insert_order_sql = """
        INSERT INTO krambambouli_orders
        (customer_id, delivery_option, pickup_location_id, total_owed, paid,
         received, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
    """
    with connection.MySQLConnection(**MYSQL_CONFIG) as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(select_from_mysql, [])
        row = cursor.fetchone()
        with psycopg.connect(pgc) as conn:
            with conn.cursor() as c:
                while row is not None:
                    row = cast(Row, row)
                    c.execute(select_customer_id_sql, [row["email"]])
                    customer_id = c.fetchone()
                    if customer_id is None:
                        raise Exception("customer_id not found")
                    customer_id = customer_id[0]
                    c.execute(
                        select_pickup_location_id_sql,
                        (row["description"], bool(row["active"])),
                    )
                    pickup_id = c.fetchone()
                    if pickup_id is None:
                        raise Exception("pickup id not found")
                    pickup_id = pickup_id[0]
                    created_at = cast(datetime, row["created_at"])
                    order_items = row["orders"]
                    order_items = cast(str, order_items)
                    order_items = json.loads(order_items)
                    order_items = cast(List[Dict[str, int | str]], order_items)
                    order = (
                        customer_id,
                        "pickup",
                        pickup_id,
                        row["total_owed"],
                        bool(row["paid"]),
                        bool(row["fulfilled"])
                        if created_at > datetime(2025, 1, 1)
                        else bool(row["paid"]),
                        row["created_at"],
                    )
                    c.execute(insert_order_sql, order)
                    order_insert_result = c.fetchone()
                    if order_insert_result is None:
                        raise Exception("""
                                        Something went wrong when inserting the
                                        order
                                        """)
                    order_id = order_insert_result[0]
                    migrate_order_items(order_id, order_items, c)
                    row = cursor.fetchone()


def migrate_delivery_orders():
    select_from_mysql = """
        SELECT
            c.email,
            c.owed_euros * 100 + c.owed_cents AS total_owed,
            c.paid,
            c.created_at,
            c.fulfilled,
            a.street_name,
            a.house_number,
            a.bus,
            a.post,
            a.city,
            JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'amount', o.amount,
                        'product_name', p.name,
                        'product_description', p.description,
                        'price', p.euros * 100 + p.cents,
                        'image_url', p.image_url)) AS orders
        FROM krambambouli_customers c
        JOIN krambambouli_delivery_addresses a
        ON c.id = a.customer_id
        JOIN krambambouli_orders o
        ON c.id = o.customer_id
        JOIN products p
        ON o.product_id = p.id
        GROUP BY
            c.id,
            a.street_name,
            a.house_number,
            a.bus,
            a.post,
            a.city
    """
    select_customer_id_sql = """
        SELECT id
        FROM customers
        WHERE email = %s
    """
    insert_order_sql = """
        INSERT INTO krambambouli_orders (
                customer_id,
                delivery_option,
                total_owed,
                paid,
                received,
                created_at
        )
        VALUES
        (%s, %s, %s, %s, %s, %s)
        RETURNING id;
    """
    insert_delivery_sql = """
        INSERT INTO krambambouli_delivery_locations (
                order_id,
                street_name,
                house_number,
                bus,
                postal_code,
                city
        )
        VALUES
        (%s, %s, %s, %s, %s, %s)
    """
    with connection.MySQLConnection(**MYSQL_CONFIG) as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(select_from_mysql, [])
        row = cursor.fetchone()
        with psycopg.connect(pgc) as conn:
            with conn.cursor() as c:
                while row is not None:
                    row = cast(Row, row)
                    email = row["email"]
                    c.execute(select_customer_id_sql, [email])
                    customer_id = c.fetchone()
                    if customer_id is None:
                        raise Exception(f"customer_id not found for {email}")
                    customer_id = customer_id[0]
                    created_at = row["created_at"]
                    created_at = cast(datetime, created_at)
                    order = (
                        customer_id,
                        "delivery",
                        row["total_owed"],
                        bool(row["paid"]),
                        bool(row["fulfilled"])
                        if created_at > datetime(2025, 1, 1)
                        else bool(row["paid"]),
                        row["created_at"],
                    )
                    c.execute(insert_order_sql, order)
                    order_id = c.fetchone()
                    if order_id is None:
                        raise Exception("order id not generated for some reason")
                    order_id = order_id[0]
                    order_items = row["orders"]
                    order_items = cast(str, order_items)
                    order_items = json.loads(order_items)
                    order_items = cast(List[Dict[str, int | str]], order_items)
                    delivery = (
                        order_id,
                        row["street_name"],
                        row["house_number"],
                        row["bus"],
                        row["post"],
                        row["city"],
                    )
                    c.execute(insert_delivery_sql, delivery)
                    migrate_order_items(order_id, order_items, c)
                    row = cursor.fetchone()


def migrate_delivery_zones():
    select_delivery_zones = """
        SELECT
            l.name,
            l.euros * 100 + l.cents AS "price",
            l.area_start,
            l.area_end
        FROM delivery_zones l;
    """
    insert_delivery_sql = """
        INSERT INTO krambambouli_delivery_zones (
                postal_code_from,
                postal_code_to,
                name,
                price
        )
        VALUES (%s, %s, %s, %s)
    """

    def create_params(row):
        return (row["area_start"], row["area_end"], row["name"], row["price"])

    migrate(select_delivery_zones, [], insert_delivery_sql, create_params)


def migrate_orders():
    migrate_pickup_orders()
    migrate_delivery_orders()


def migrate_all():
    migrate_users()
    migrate_pickup_locations()
    migrate_products()
    migrate_customers()
    migrate_orders()
    migrate_delivery_zones()


if __name__ == "__main__":
    migrate_all()
