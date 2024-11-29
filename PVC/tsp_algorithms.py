import itertools
import time
import numpy as np

import itertools

def brute_force_tsp(dist_matrix, start=0):
    """
    Solves the TSP using the brute force method.
    
    Parameters:
        dist_matrix (list of list of int): Distance matrix of the cities.
        start (int): Starting city (default is 0).

    Returns:
        tuple: Optimal cycle and its cost.
    """
    n = len(dist_matrix)
    cities = list(range(n))
    cities.remove(start)

    min_cost = float('inf')
    best_cycle = None

    # Generate all permutations of cities (excluding start)
    for perm in itertools.permutations(cities):
        cycle = [start] + list(perm) + [start]
        cost = sum(dist_matrix[cycle[i]][cycle[i + 1]] for i in range(len(cycle) - 1))
        
        if cost < min_cost:
            min_cost = cost
            best_cycle = cycle

    return best_cycle, min_cost


from collections import defaultdict

def kruskal_tsp(dist_matrix):
    """
    Approximates the TSP using Kruskal's MST algorithm.
    
    Parameters:
        dist_matrix (list of list of int): Distance matrix of the cities.

    Returns:
        tuple: Approximate cycle and its cost.
    """
    n = len(dist_matrix)

    # Step 1: Prepare edges for Kruskal's algorithm
    edges = []
    for i in range(n):
        for j in range(i + 1, n):
            edges.append((dist_matrix[i][j], i, j))
    edges.sort()  # Sort edges by weight

    # Step 2: Union-Find to construct MST
    parent = list(range(n))
    rank = [0] * n

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(x, y):
        root_x, root_y = find(x), find(y)
        if root_x != root_y:
            if rank[root_x] > rank[root_y]:
                parent[root_y] = root_x
            elif rank[root_x] < rank[root_y]:
                parent[root_x] = root_y
            else:
                parent[root_y] = root_x
                rank[root_x] += 1

    mst_edges = []
    for weight, u, v in edges:
        if find(u) != find(v):
            union(u, v)
            mst_edges.append((u, v))

    # Step 3: Traverse MST to form an approximate tour
    adj_list = defaultdict(list)
    for u, v in mst_edges:
        adj_list[u].append(v)
        adj_list[v].append(u)

    visited = [False] * n
    tour = []

    def preorder(node):
        visited[node] = True
        tour.append(node)
        for neighbor in adj_list[node]:
            if not visited[neighbor]:
                preorder(neighbor)

    preorder(0)  # Start traversal from node 0
    tour.append(0)  # Return to the starting city
    cost = sum(dist_matrix[tour[i]][tour[i + 1]] for i in range(len(tour) - 1))

    return tour, cost
