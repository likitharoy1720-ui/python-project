import os

from flask import Flask, jsonify, request, send_from_directory

try:
    import mysql.connector
except ImportError:
    mysql = None

app = Flask(__name__)


def save_calculation(temperatures, result):
    if mysql is None or not os.getenv("MYSQL_HOST"):
        return False

    connection = None
    cursor = None

    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST"),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DATABASE", "peak_horizon"),
        )
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO temperature_data (temperatures, result) VALUES (%s, %s)",
            (",".join(map(str, temperatures)), ",".join(map(str, result))),
        )
        connection.commit()
        return True
    except mysql.connector.Error:
        return False
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.get_json()
    temperatures = data["temperatures"]
    result = []

    for i in range(len(temperatures)):
        days = 0

        for j in range(i + 1, len(temperatures)):
            if temperatures[j] > temperatures[i]:
                days = j - i
                break

        result.append(days)

    saved_to_database = save_calculation(temperatures, result)

    return jsonify({
        "temperatures": temperatures,
        "result": result,
        "saved_to_database": saved_to_database,
    })


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/<path:filename>")
def assets(filename):
    if filename in {"style.css", "script.js"}:
        return send_from_directory(".", filename)
    return "Not Found", 404


if __name__ == "__main__":
    app.run(debug=True)
