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

    // We will rename this method and add a new parameter
    generatePlot() {
        const xColumn = this.xSelect.value;
        const yColumn = this.ySelect.value;
        const chartType = this.chartTypeSelect.value;

        if (!this.processedData || !xColumn || !yColumn) {
            return;
        }

        // Use a switch statement to select the correct chart function
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