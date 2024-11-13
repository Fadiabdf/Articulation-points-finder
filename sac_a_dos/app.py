from flask import Flask, render_template, jsonify, request
from items import ITEMS

app = Flask(__name__)

@app.route('/')
def index():
    """ Renders the main game page and sends item data """
    return render_template('game.html', items=ITEMS)

# Knapsack solving route
@app.route('/solve_knapsack', methods=['POST'])
def solve_knapsack():
    data = request.get_json()
    max_weight = data['max_weight']
    selected_items_ids = data['selected_items']
    
    # Get selected items based on their IDs
    selected_items = [item for item in ITEMS if item['id'] in selected_items_ids]

    # Calculate total weight and value of selected items
    total_weight = sum(item['weight'] for item in selected_items)
    total_value = sum(item['value'] for item in selected_items)

    # Check if the selected items exceed max weight
    is_valid = total_weight <= max_weight

    # Simple greedy approach for optimal solution (based on value-to-weight ratio)
    # Sorting items by value-to-weight ratio, highest first
    optimal_solution = sorted(ITEMS, key=lambda x: (x['value'] / x['weight']), reverse=True)

    # Find the optimal solution without exceeding the max weight
    optimal_solution_items = []
    optimal_solution_value = 0
    total_optimal_weight = 0

    for item in optimal_solution:
        if total_optimal_weight + item['weight'] <= max_weight:
            optimal_solution_items.append(item)
            optimal_solution_value += item['value']
            total_optimal_weight += item['weight']

    # Prepare selected items for display (simplified to names and other relevant info)
    selected_items_display = [
        {'name': item['name'], 'weight': item['weight'], 'value': item['value']}
        for item in selected_items
    ]
    optimal_solution_display = [
        {'name': item['name'], 'weight': item['weight'], 'value': item['value']}
        for item in optimal_solution_items
    ]

    return jsonify({
        'is_valid': is_valid,
        'total_weight': total_weight,
        'total_value': total_value,
        'selected_items': selected_items_display,
        'optimal_solution': optimal_solution_display,
        'optimal_solution_value': optimal_solution_value
    })


if __name__ == '__main__':
    app.run(debug=True)
