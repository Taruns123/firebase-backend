from flask import Flask, jsonify, request
from flask_cors import CORS

from firebase_admin import credentials, firestore, db
import firebase_admin

cred = credentials.Certificate("./permissions.json")

firebase_admin.initialize_app(cred)

app = Flask(__name__)
cors = CORS(app)

db = firestore.client()

dishes = db.collection("products")

@app.route("/dishes/update/<int:dishId>")
def update(dishId):
    
    dish_ref = dishes.document(str(dishId))
    dish = dish_ref.get().to_dict()
    dish["price"] = 100
    dish_ref.set(dish)

    return jsonify({"success": True}), 200

@app.route("/dishes/read/<string:dishId>")
def read(dishId):
    
    dish = dishes.document(dishId).get()
    return jsonify(dish.to_dict()), 200

@app.route("/dishes/create")
def create():
    all_dish_data = []
    
    for dish in dishes.stream():
        dish_data = dish.to_dict()
        all_dish_data.append(dish_data)
        
    last_element_id = all_dish_data[-1]['id']
    
    description = "Created"
    name = "Tandoori"
    price = 300
    
    dishes.document(str(last_element_id + 1)).set({"description": description, "name": name, "id": last_element_id + 1, "price": price})
    return jsonify({"success": True}), 200

@app.route("/dishes/delete/<string:dishId>")
def delete(dishId):
    
    dishes.document(dishId).delete()

    return jsonify({"success": True}), 200


@app.route("/dishes/alldishes")
def all_dish():
    all_dish_data = []
    
    for doc_snapshot in dishes.stream():
        doc_data = doc_snapshot.to_dict()
        all_dish_data.append(doc_data)
    
    return jsonify({"documents": all_dish_data}), 200

if __name__ == "__main__":
    app.run(debug=True)