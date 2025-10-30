// visualization.js - Plotly visualization helpers

function createScatterPlot(elementId, xData, yData, xLabel, yLabel, title) {
    const trace = {
        x: xData,
        y: yData,
        mode: 'markers',
        type: 'scatter',
        marker: { size: 8, color: '#2563eb', opacity: 0.6 }
    };
    
    const layout = {
        title: title,
        xaxis: { title: xLabel },
        yaxis: { title: yLabel },
        hovermode: 'closest'
    };
    
    Plotly.newPlot(elementId, [trace], layout, { responsive: true });
}

function createCorrelationHeatmap(elementId, matrix, labels) {
    const trace = {
        z: matrix,
        x: labels,
        y: labels,
        type: 'heatmap',
        colorscale: 'RdBu',
        zmid: 0,
        zmin: -1,
        zmax: 1
    };
    
    const layout = {
        title: 'Correlation Matrix',
        xaxis: { tickangle: -45 },
        yaxis: { autorange: 'reversed' }
    };
    
    Plotly.newPlot(elementId, [trace], layout, { responsive: true });
}
