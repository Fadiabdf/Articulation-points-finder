from flask import Flask, render_template, request, jsonify
import networkx as nx

app = Flask(__name__)
graph = nx.Graph()  # Initialize the graph globally to keep state across requests

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_node', methods=['POST'])
def add_node():
    node = request.json['node']
    if node not in graph:
        graph.add_node(node)
    return jsonify({"status": "success", "message": f"Le noeud {node} a été ajouté !"})

@app.route('/remove_node', methods=['POST'])
def remove_node():
    node = request.json['node']
    if node in graph:
        graph.remove_node(node)
    return jsonify({"status": "success", "message": f"Le noeud {node} a été supprimé !"})

@app.route('/add_edge', methods=['POST'])
def add_edge():
    node1 = request.json['node1']
    node2 = request.json['node2']
    if node1 in graph and node2 in graph and node1 != node2:
        graph.add_edge(node1, node2)
    return jsonify({"status": "success", "message": f"Arête ajoutée entre {node1} et {node2} !"})

@app.route('/calculate_articulation', methods=['GET'])
def calculate_articulation():
    articulation_points = find_articulation_points(graph)
    # Return articulation points
    return jsonify({"articulation_points": list(articulation_points)})

def find_articulation_points(graph):
    articulation_points = set()
    visited, disc, low, parent = {}, {}, {}, {}
    time = [0]

    for vertex in graph.nodes():
        visited[vertex] = False
        parent[vertex] = None

    for vertex in graph.nodes():
        if not visited[vertex]:
            dfs(graph, vertex, visited, disc, low, parent, articulation_points, time)

    return articulation_points

def dfs(graph, u, visited, disc, low, parent, articulation_points, time):
    visited[u] = True
    disc[u] = low[u] = time[0]
    time[0] += 1
    children = 0

    for v in graph.neighbors(u):
        if not visited[v]:
            parent[v] = u
            children += 1
            dfs(graph, v, visited, disc, low, parent, articulation_points, time)
            low[u] = min(low[u], low[v])

            # If u is root and has more than one child
            if parent[u] is None and children > 1:
                articulation_points.add(u)
            # If u is not root and low[v] >= disc[u]
            if parent[u] is not None and low[v] >= disc[u]:
                articulation_points.add(u)

        elif v != parent[u]:  # Back edge
            low[u] = min(low[u], disc[v])

if __name__ == '__main__':
    app.run(debug=True)
