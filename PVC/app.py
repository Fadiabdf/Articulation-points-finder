from flask import Flask, render_template, request, jsonify
import numpy as np
from tsp_algorithms import kruskal_tsp, brute_force_tsp  # Updated imports
import time

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve_tsp():
    data = request.json
    matrix = np.array(data['matrix'])
    start = int(data['start'])

    # Measure execution time for Brute Force method
    start_time_bf = time.time()
    cycle_bf, cost_bf = brute_force_tsp(matrix, start)
    end_time_bf = time.time()

    # Measure execution time for Kruskal's MST method
    start_time_mst = time.time()
    cycle_mst, cost_mst = kruskal_tsp(matrix)
    end_time_mst = time.time()

    # Calculate execution times for both methods
    time_bf = end_time_bf - start_time_bf
    time_mst = end_time_mst - start_time_mst

    return jsonify({
        'cycle_bf': cycle_bf,
        'cost_bf': cost_bf,
        'cycle_mst': cycle_mst,
        'cost_mst': cost_mst,
        'time_bf': time_bf,
        'time_mst': time_mst
    })

if __name__ == '__main__':
    app.run(debug=True)
