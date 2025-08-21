class Plotter {
    constructor(containerId, xSelectId, ySelectId, plotButtonId, chartTypeId) {
        this.container = document.getElementById(containerId);
        this.xSelect = document.getElementById(xSelectId);
        this.ySelect = document.getElementById(ySelectId);
        this.plotButton = document.getElementById(plotButtonId);
        this.chartTypeSelect = document.getElementById(chartTypeId); // New property
        this.processedData = null;

        this.plotButton.addEventListener('click', () => {
            this.generatePlot(); // We will rename this method
        });

        const transposeButton = document.getElementById('transpose-button');

        transposeButton.addEventListener('click', async () => {
    if (!plotter.processedData) {
        statusMessage.textContent = 'Please upload a file first.';
        statusMessage.className = 'status-message error-message';
        return;
    }

    statusMessage.textContent = 'Transposing data...';
    statusMessage.className = 'status-message';
    
    try {
        const response = await fetch('/transpose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(plotter.processedData), // Send the current processed data to the backend
        });

        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }

        const data = await response.json();
        
        // Load the new, transposed data back into the Plotter class
        plotter.loadData(data);
        
        statusMessage.textContent = 'Data transposed successfully! Select new columns to plot.';
        statusMessage.className = 'status-message success-message';
        
        } catch (error) {
            statusMessage.textContent = `Error transposing data: ${error.message}`;
            statusMessage.className = 'status-message error-message';
            console.error('Transpose failed:', error);
        }
        });
    }

    // Stores the data and populates the dropdowns
    loadData(data) {
        this.processedData = data;
        this.populateColumnSelects();
    }

    // Populates the dropdown menus with column names from the data
    populateColumnSelects() {
        if (!this.processedData || this.processedData.length === 0) {
            return;
        }

        const columnNames = Object.keys(this.processedData[0]);
        this.xSelect.innerHTML = '';
        this.ySelect.innerHTML = '';

        columnNames.forEach(col => {
            const optionX = document.createElement('option');
            optionX.value = col;
            optionX.textContent = col;
            this.xSelect.appendChild(optionX);

            const optionY = document.createElement('option');
            optionY.value = col;
            optionY.textContent = col;
            this.ySelect.appendChild(optionY);
        });

        // Set default selected options
        if (columnNames.length > 1) {
            this.xSelect.value = columnNames[0];
            this.ySelect.value = columnNames[1];
        }
    }

    generatePlot() {
        const xColumn = this.xSelect.value;
        const yColumn = this.ySelect.value;
        const chartType = this.chartTypeSelect.value;
        const statusMessage = document.getElementById('status-message'); // Get the status element

        if (!this.processedData || !xColumn || !yColumn) {
            return;
        }

        // A simple check to see if a column is numeric
        const isXNumeric = typeof this.processedData[0][xColumn] === 'number';
        const isYNumeric = typeof this.processedData[0][yColumn] === 'number';

        // Basic validation based on chart type
        if (chartType === 'box' || chartType === 'bar') {
            if (isXNumeric && isYNumeric) {
                statusMessage.textContent = 'Warning: Bar and Box plots are best for comparing numerical data across categories. Try selecting a non-numeric column for the X-axis.';
                statusMessage.className = 'status-message error-message';
            } else {
                statusMessage.textContent = 'Plot generated successfully!';
                statusMessage.className = 'status-message success-message';
            }
        } else {
            // Scatter plot validation
            if (!isXNumeric || !isYNumeric) {
                statusMessage.textContent = 'Warning: Scatter plots are best for comparing two numerical variables. Try selecting numerical columns for both axes.';
                statusMessage.className = 'status-message error-message';
            } else {
                statusMessage.textContent = 'Plot generated successfully!';
                statusMessage.className = 'status-message success-message';
            }
        }

        let trace = null;
        let layout = {};

        switch (chartType) {
            case 'scatter':
                trace = this.getScatterTrace(xColumn, yColumn);
                layout = this.getLayout(xColumn, yColumn, 'Scatter Plot');
                break;
            case 'bar':
                trace = this.getBarTrace(xColumn, yColumn);
                layout = this.getLayout(xColumn, yColumn, 'Bar Chart');
                break;
            case 'box':
                trace = this.getBoxTrace(xColumn, yColumn);
                layout = this.getLayout(xColumn, yColumn, 'Box Plot');
                break;
            default:
                console.error("Unknown chart type");
                return;
        }

        Plotly.newPlot(this.container, [trace], layout, { responsive: true });
    }

        // Reusable layout generation
    getLayout(xColumn, yColumn, title) {
        return {
            title: `${title} of ${xColumn} vs ${yColumn}`,
            xaxis: { title: xColumn },
            yaxis: { title: yColumn }
        };
    }

    // Logic for a scatter plot
    getScatterTrace(xColumn, yColumn) {
        const xData = this.processedData.map(row => row[xColumn]);
        const yData = this.processedData.map(row => row[yColumn]);
        return {
            x: xData,
            y: yData,
            mode: 'markers',
            type: 'scatter',
            name: `${xColumn} vs ${yColumn}`
        };
    }

    // Logic for a bar chart
    getBarTrace(xColumn, yColumn) {
        const xData = this.processedData.map(row => row[xColumn]);
        const yData = this.processedData.map(row => row[yColumn]);
        return {
            x: xData,
            y: yData,
            type: 'bar',
            name: `${xColumn} vs ${yColumn}`
        };
    }

    // Logic for a box plot
    getBoxTrace(xColumn, yColumn) {
        // Box plots often use one categorical and one numerical column.
        // We will need to handle this later, but for now, this will work.
        const xData = this.processedData.map(row => row[xColumn]);
        const yData = this.processedData.map(row => row[yColumn]);
        return {
            x: xData,
            y: yData,
            type: 'box',
            name: `${xColumn} vs ${yColumn}`
        };
    }

    
}