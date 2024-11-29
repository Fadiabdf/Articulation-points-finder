let nodes = [];
let edges = [];
let numCities = 0;
let costsMatrix = [];
let startCity = 0;

// Function to generate the initial graph
function generateGraph() {
    numCities = document.getElementById('num-cities').value;

    // Update city options dynamically based on the number of cities
    const citySelect = document.getElementById('start-city');
    citySelect.innerHTML = '';
    for (let i = 0; i < numCities; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Ville ${i}`;
        citySelect.appendChild(option);
    }

    nodes = Array.from({ length: numCities }, (v, k) => ({ id: k, label: `Ville ${k}` }));

    // Create the initial edges (without costs yet)
    edges = [];
    for (let i = 0; i < numCities; i++) {
        for (let j = i + 1; j < numCities; j++) {
            edges.push({ from: i, to: j, label: '0' });  // Default cost to 0
        }
    }

    // Display the graph
    renderGraph('network-container', nodes, edges);

    // Create the input matrix for edge costs
    createCostMatrixInputs();
}

// Function to create input fields for edge costs
function createCostMatrixInputs() {
    const matrixInputsDiv = document.getElementById('matrix-inputs');
    matrixInputsDiv.innerHTML = '';  // Clear previous inputs

    let table = document.createElement('table');
    let headerRow = document.createElement('tr');
    table.appendChild(headerRow);

    for (let i = 0; i < numCities; i++) {
        let th = document.createElement('th');
        th.textContent = `Ville ${i}`;
        headerRow.appendChild(th);
    }

    for (let i = 0; i < numCities; i++) {
        let row = document.createElement('tr');
        let th = document.createElement('th');
        th.textContent = `Ville ${i}`;
        row.appendChild(th);
        for (let j = 0; j < numCities; j++) {
            let td = document.createElement('td');
            let input = document.createElement('input');
            input.type = 'number';
            input.id = `cost-${i}-${j}`;
            input.value = (i === j) ? 0 : '';  // No cost for a city to itself
            td.appendChild(input);
            row.appendChild(td);
        }
        table.appendChild(row);
    }

    matrixInputsDiv.appendChild(table);
    document.getElementById('solve-btn').classList.remove('hidden');
}

// Function to solve TSP and show results
function solveTSP() {
    const startTime = performance.now();  // Start time for execution

    // Get the costs from the inputs
    costsMatrix = [];
    for (let i = 0; i < numCities; i++) {
        let row = [];
        for (let j = 0; j < numCities; j++) {
            const cost = document.getElementById(`cost-${i}-${j}`).value || 0;
            row.push(Number(cost));
        }
        costsMatrix.push(row);
    }

    // Update the edges with the new costs
    edges = [];
    for (let i = 0; i < numCities; i++) {
        for (let j = i + 1; j < numCities; j++) {
            edges.push({ from: i, to: j, label: costsMatrix[i][j].toString() });
        }
    }

    // Re-render the graph with updated costs
    renderGraph('network-container', nodes, edges);

    // Get the starting city
    startCity = document.getElementById('start-city').value;

    // Highlight the start city in blue
    colorStartCity(startCity);

    // Call methods to solve TSP (heuristic and exact)
    let heuristicPath = solveTSPHeuristic(startCity);
    let exactPath = solveTSPExact(startCity);

    // Calculate execution time
    const endTime = performance.now();
    const executionTime = (endTime - startTime) / 1000;

    // Display the two solutions
    renderGraph('graph-heuristic', nodes, getPathEdges(heuristicPath, 'heuristic'));
    renderGraph('graph-exact', nodes, getPathEdges(exactPath, 'exact'));

    // Display the results: path costs and execution time
    document.getElementById('cost-heuristic').innerText = getPathCost(heuristicPath);
    document.getElementById('cost-exact').innerText = getPathCost(exactPath);
    document.getElementById('time-heuristic').innerText = `${executionTime.toFixed(3)} s`;
    document.getElementById('time-exact').innerText = `${executionTime.toFixed(3)} s`;
}

// Function to render a graph
function renderGraph(containerId, nodes, edges) {
    const container = document.getElementById(containerId);
    const data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };
    const options = {
        nodes: { shape: 'dot', size: 10 },
        edges: { width: 2, color: '#000000' },
        physics: false  // Disable physics for static graph
    };
    new vis.Network(container, data, options);
}

// Function to color the start city
function colorStartCity(startCity) {
    nodes.forEach(node => {
        if (node.id === parseInt(startCity)) {
            node.color = { background: 'blue', border: 'blue' };
        } else {
            node.color = { background: 'white', border: 'black' }; // Reset other cities to default
        }
    });
    renderGraph('network-container', nodes, edges); // Re-render graph to apply color change
}

// Function to extract edges from a path (array of node ids)
function getPathEdges(path, method) {
    let pathEdges = [];
    for (let i = 0; i < path.length - 1; i++) {
        pathEdges.push({
            from: path[i],
            to: path[i + 1],
            color: method === 'heuristic' ? 'lightblue' : 'red',  // Light blue for heuristic, red for exact
            width: 3,
            arrows: 'to'
        });
    }
    // Add the last edge to complete the loop
    pathEdges.push({
        from: path[path.length - 1],
        to: path[0],
        color: method === 'heuristic' ? 'lightblue' : 'red',  // Light blue for heuristic, red for exact
        width: 3,
        arrows: 'to'
    });
    return pathEdges;
}

// Heuristic TSP solution (using a basic approach, e.g., nearest neighbor)
function solveTSPHeuristic(start) {
    let path = [parseInt(start)]; // Start at city 0
    let visited = new Array(numCities).fill(false);
    visited[start] = true;

    for (let i = 1; i < numCities; i++) {
        let lastCity = path[path.length - 1];
        let nextCity = -1;
        let minCost = Infinity;

        for (let j = 0; j < numCities; j++) {
            if (!visited[j] && costsMatrix[lastCity][j] < minCost) {
                nextCity = j;
                minCost = costsMatrix[lastCity][j];
            }
        }
        path.push(nextCity);
        visited[nextCity] = true;
    }
    return path;
}

// Exact TSP solution (for simplicity, let's use a brute force approach here)
function solveTSPExact() {
    // This is just a placeholder; you can replace it with a more efficient algorithm
    return solveTSPHeuristic(0);  // For now, it will be the same as the heuristic
}

// Helper function to calculate the cost of a path
function getPathCost(path) {
    let cost = 0;
    for (let i = 0; i < path.length - 1; i++) {
        cost += costsMatrix[path[i]][path[i + 1]];
    }
    cost += costsMatrix[path[path.length - 1]][path[0]];  // Add the cost to return to the start city
    return cost;
}
