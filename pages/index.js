//----------------------------------------------------------------------------- BAR GRAPH START -----------------------------------------------------------------------------
let graphMode;
let vwRecipes = ['', '', '', '', '-TIG-TKM-', '-TIG-LKM-', '-TAY-TKM-', '-TAY-LKM-', 'FORD', 'BC3', 'CUV', 'TT'];
let brands = ['', 'VW', 'FORD'];

let intervalId;
let longIntervalTime = 1.5 * 60 * 1000;
let normalIntervalTime = 45 * 1000;
let shortIntervalTime = 45 * 1000;

const ctx = document.getElementById('haftalikUretimGraph').getContext('2d');
const pieCtx = document.getElementById('anlikKumulatif').getContext('2d');
const pieCtx2 = document.getElementById('gecmisKumulatif').getContext('2d');

// Global variables to store quantities
let fttQuantities = [];
let scrapQuantities = [];
let polishQuantities = [];
let polishsScrapQuantities = [];
let dates = [];
let fttPercentages = [];
let scrapPercentages = [];
let polishPercentages = [];
let polishsScrapPercentages = [];

let currentTotalFTT;
let currentTotalScrap;
let currentTotalPolishOK;
let currentTotalPolishScrap;
let currentTotalFTTPercantage;
let currentTotalScrapPercantage;
let currentTotalPolishOKPercantage;
let currentTotalPolishScrapPercantage;

let pastWeekTotalFTT;
let pastWeekTotalScrap;
let pastWeekTotalPolishOK;
let pastWeekotalPolishScrap;
let pastWeekTotalFTTPercantage;
let pastWeekTotalScrapPercantage;
let pastWeekTotalPolishOKPercantage;
let pastWeekotalPolishScrapPercantage;

// Initialize the bar chart
const haftalikUretimGraph = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [], // Dates will be populated dynamically
        datasets: [
            {
                label: 'Direkt OK Oranı', // Change this label to indicate it's showing quantities, if needed
                data: [], // Will be populated with `fttQuantities`
                backgroundColor: 'rgba(0, 255, 0, 0.5)',
                borderColor: 'rgba(0, 185, 0, 1)',
                borderWidth: 0,
                stack: 'Stack 1'
            },
            {
                label: 'Polişten OK Oranı',
                data: [], // Will be populated with `polishQuantities`
                backgroundColor: 'rgba(0, 168, 255, 0.5)',
                borderColor: 'rgba(255, 165, 0, 1)',
                borderWidth: 0,
                stack: 'Stack 1'
            },
            {
                label: 'Direkt Iskarta Oranı',
                data: [], // Will be populated with `scrapQuantities`
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                borderColor: 'rgba(162, 0, 0, 1)',
                borderWidth: 0,
                stack: 'Stack 2'
            },
            {
                label: 'Polişten Iskarta Oranı',
                data: [], // Will be populated with `polishsScrapQuantities`
                backgroundColor: 'rgba(255, 130, 0, 0.5)',
                borderColor: 'rgba(162, 0, 0, 1)',
                borderWidth: 0,
                stack: 'Stack 2'
            }
        ]
    },
    options: {
        plugins: {
            datalabels: {
                anchor: 'center',
                align: 'center',
                color: 'white',
                formatter: function (value, context) {
                    const index = context.dataIndex;
                    let perc;

                    switch (context.datasetIndex) {
                        case 0:
                            perc = fttPercentages[index];
                            break;
                        case 1:
                            perc = polishPercentages[index];
                            break;
                        case 2:
                            perc = scrapPercentages[index];
                            break;
                        case 3:
                            perc = polishsScrapPercentages[index];
                            break;
                    }
                    if (perc == '0') {
                        return ``;
                    }
                    else {
                        return `${value}\n${perc}%`;  // Showing quantity instead of percentage
                    }
                },
                font: {
                    weight: 'bold',
                    size: 14
                }
            },
            legend: {
                labels: {
                    color: 'white'
                }
            }
        },
        scales: {
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    color: 'rgba(237, 237, 237, 1)'
                },
                grid: {
                    color: 'transparent',
                    lineWidth: 1,
                }
            },
            x: {
                stacked: true,
                ticks: {
                    color: 'rgba(237, 237, 237, 1)'
                },
                grid: {
                    color: 'transparent',
                    lineWidth: 3,
                }
            }
        }
    },
    plugins: [ChartDataLabels]
});


const pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
        labels: ['Direkt OK', 'Direkt Iskarta', 'Polişten OK', 'Polişten Iskarta'],
        datasets: [{
            data: [], // This will be populated dynamically with quantities
            backgroundColor: [
                'rgba(0, 255, 0, 0.5)',      // FTT
                'rgba(255, 0, 0, 0.5)',      // Scrap
                'rgba(0, 168, 255, 0.5)',    // Polişten OK
                'rgba(255, 130, 0, 0.5)',    // Polişten Iskarta
            ],
            borderColor: [
                'rgba(0, 185, 0, 1)',        // FTT border
                'rgba(162, 0, 0, 1)',        // Scrap border
                'rgba(255, 165, 0, 1)',      // Polişten OK border
                'rgba(162, 0, 0, 1)',        // Polişten Iskarta border
            ],
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Bu Haftanın Kümülatifi',  // Title for the pie chart
                color: 'white',  // Set title color
                font: {
                    size: 18,      // Adjust font size
                    weight: 'bold' // Make the title bold
                },
                padding: {
                    top: 10,
                    bottom: 30    // Adjust padding
                }
            },
            legend: {
                labels: {
                    color: 'white' // Set the legend text color to white
                }
            },
            // Enable ChartDataLabels plugin to display both quantity and percentage
            datalabels: {
                color: 'white',  // Label color
                anchor: 'end',   // Adjust the label positioning
                align: 'start',  // Align labels properly
                formatter: function (value, context) {
                    // Retrieve the percentage data for each segment
                    let percentage = '';
                    if (context.dataIndex === 0 && currentTotalFTTPercantage) {
                        percentage = currentTotalFTTPercantage;
                    } else if (context.dataIndex === 1 && currentTotalScrapPercantage) {
                        percentage = currentTotalScrapPercantage;
                    } else if (context.dataIndex === 2 && currentTotalPolishOKPercantage) {
                        percentage = currentTotalPolishOKPercantage;
                    } else if (context.dataIndex === 3 && currentTotalPolishScrapPercantage) {
                        percentage = currentTotalPolishScrapPercantage;
                    }
                    if (!value) {
                        return '';
                    }
                    else {
                        return percentage + '%' + ' (' + value + ')';
                    }

                },
                font: {
                    weight: 'bold',
                    size: 14
                }
            }
        }
    },
    plugins: [ChartDataLabels]  // Register the plugin
});

function updateDateTime() {
    const now = new Date();
    const formatted = now.toLocaleString('tr-TR');
    document.getElementById('datetime').textContent = formatted;
}
updateDateTime();
setInterval(updateDateTime, 1000);

// Initialize the pie chart
const pieChart2 = new Chart(pieCtx2, {
    type: 'pie',
    data: {
        labels: ['Direkt OK', 'Direkt Iskarta', 'Polişten OK', 'Polişten Iskarta'],
        datasets: [{
            data: [], // This will be populated dynamically
            backgroundColor: [
                'rgba(0, 255, 0, 0.5)',
                'rgba(255, 0, 0, 0.5)',
                'rgba(0, 168, 255, 0.5)',
                'rgba(255, 130, 0, 0.5)',
            ],
            borderColor: [
                'rgba(0, 185, 0, 1)',
                'rgba(162, 0, 0, 1)',
                'rgba(255, 165, 0, 1)',
                'rgba(162, 0, 0, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Geçen Haftanın Kümülatifi',  // Title for the pie chart
                color: 'white',  // Set title color
                font: {
                    size: 18,      // Adjust font size
                    weight: 'bold' // Make the title bold
                },
                padding: {
                    top: 10,
                    bottom: 30    // Adjust padding
                }
            },
            legend: {
                labels: {
                    color: 'white' // Set the legend text color to white
                }
            },
            // Enable ChartDataLabels plugin to display both quantity and percentage
            datalabels: {
                color: 'white',  // Label color
                anchor: 'end',   // Adjust the label positioning
                align: 'start',  // Align labels properly
                formatter: function (value, context) {
                    // Retrieve the percentage data for each segment
                    let percentage = '';
                    if (context.dataIndex === 0 && pastWeekTotalFTTPercantage) {
                        percentage = pastWeekTotalFTTPercantage;
                    } else if (context.dataIndex === 1 && pastWeekTotalScrapPercantage) {
                        percentage = pastWeekTotalScrapPercantage;
                    } else if (context.dataIndex === 2 && pastWeekTotalPolishOKPercantage) {
                        percentage = pastWeekTotalPolishOKPercantage;
                    } else if (context.dataIndex === 3 && pastWeekotalPolishScrapPercantage) {
                        percentage = pastWeekotalPolishScrapPercantage;
                    }
                    if (!value) {
                        return '';
                    }
                    else {
                        return percentage + '%' + ' (' + value + ')';
                    }

                },
                font: {
                    weight: 'bold',
                    size: 14
                }
            }
        }
    },
    plugins: [ChartDataLabels]  // Register the plugin
});


async function getProdData(recete) {
    $.ajax({
        type: "POST",
        url: "../functions/uretim_orani.php",
        data: { recete: recete },
        success: function (response) {
            const rows = response.trim().split("\n");

            dates = [];
            fttPercentages = [];
            scrapPercentages = [];
            polishPercentages = [];
            polishsScrapPercentages = [];

            fttQuantities = [];
            scrapQuantities = [];
            polishQuantities = [];
            polishsScrapQuantities = [];

            rows.forEach(row => {
                const columns = row.split('|');

                const date = columns[0];
                let fttQuantity = parseFloat(columns[1]);
                let scrapQuantity = parseFloat(columns[3]);
                let polishQuantity = parseFloat(columns[2]);
                let polishsScrapQuantity = parseFloat(columns[8]);
                let fttPercentage = parseFloat(columns[7].replace('% ', ''));
                let scrapPercentage = parseFloat(columns[4].replace('% ', ''));
                let polishPercentage = parseFloat(columns[5].replace('% ', ''));
                let polishsScrapPercentage = parseFloat(columns[9].replace('% ', ''));


                dates.push(date);
                fttQuantities.push(fttQuantity || 0);
                scrapQuantities.push(scrapQuantity || 0);
                polishQuantities.push(polishQuantity || 0);
                polishsScrapQuantities.push(polishsScrapQuantity || 0);
                fttPercentages.push(fttPercentage || 0);
                scrapPercentages.push(scrapPercentage || 0);
                polishPercentages.push(polishPercentage || 0);
                polishsScrapPercentages.push(polishsScrapPercentage || 0);

            });

            // Update the bar chart data with quantities
            haftalikUretimGraph.data.labels = dates;
            haftalikUretimGraph.data.datasets[0].data = fttQuantities;
            haftalikUretimGraph.data.datasets[1].data = polishQuantities;
            haftalikUretimGraph.data.datasets[2].data = scrapQuantities;
            haftalikUretimGraph.data.datasets[3].data = polishsScrapQuantities;
            haftalikUretimGraph.update();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('AJAX Error:', textStatus, errorThrown);
            console.error('Response Text:', jqXHR.responseText);
        }
    });

    $.ajax({
        type: "POST",
        url: "../functions/kumulatif.php",
        data: { hafta: '0', recete: recete },  // Adjust 'hafta' value as needed
        dataType: 'json',
        success: function (response) {
            if (response.error) {
                console.error('Error fetching grid data:', response.error);
                return;
            }

            // Iterate over the response to map the correct SAYI values
            response.forEach(row => {
                if (row.ISLEM === 'POLISH' && row.SONUC === 'OK') {
                    currentTotalPolishOK = row.SAYI;
                    currentTotalPolishOKPercantage = row.SAYI_PCT
                } else if (row.ISLEM === 'POLISH' && row.SONUC === 'ISKARTA') {
                    currentTotalPolishScrap = row.SAYI;
                    currentTotalPolishScrapPercantage = row.SAYI_PCT
                } else if (row.ISLEM === 'OK' && row.SONUC === 'OK') {
                    currentTotalFTT = row.SAYI;
                    currentTotalFTTPercantage = row.SAYI_PCT;
                } else if (row.ISLEM === 'ISKARTA' && row.SONUC === 'ISKARTA') {
                    currentTotalScrap = row.SAYI;
                    currentTotalScrapPercantage = row.SAYI_PCT;
                }
            });

            // Update the pie chart data
            pieChart.data.datasets[0].data = [currentTotalFTT, currentTotalScrap, currentTotalPolishOK, currentTotalPolishScrap];
            pieChart.update();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('AJAX Error:', textStatus, errorThrown);
        }
    });

    $.ajax({
        type: "POST",
        url: "../functions/kumulatif.php",
        data: { hafta: '1', recete: recete },
        dataType: 'json',
        success: function (response) {
            if (response.error) {
                console.error('Error fetching grid data:', response.error);
                return;
            }


            // Iterate over the response to map the correct SAYI values
            response.forEach(row => {
                if (row.ISLEM === 'POLISH' && row.SONUC === 'OK') {
                    pastWeekTotalPolishOK = row.SAYI;
                    pastWeekTotalPolishOKPercantage = row.SAYI_PCT;
                } else if (row.ISLEM === 'POLISH' && row.SONUC === 'ISKARTA') {
                    pastWeekotalPolishScrap = row.SAYI;
                    pastWeekotalPolishScrapPercantage = row.SAYI_PCT;
                } else if (row.ISLEM === 'OK' && row.SONUC === 'OK') {
                    pastWeekTotalFTT = row.SAYI;
                    pastWeekTotalFTTPercantage = row.SAYI_PCT;
                } else if (row.ISLEM === 'ISKARTA' && row.SONUC === 'ISKARTA') {
                    pastWeekTotalScrap = row.SAYI;
                    pastWeekTotalScrapPercantage = row.SAYI_PCT;
                }
            });

            pieChart2.data.datasets[0].data = [pastWeekTotalFTT, pastWeekTotalScrap, pastWeekTotalPolishOK, pastWeekotalPolishScrap];
            pieChart2.update();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('AJAX Error:', textStatus, errorThrown);
        }
    });


}

async function fetchKumulatif(hafta) {

    $.ajax({
        type: "POST",
        url: "../functions/kumulatif.php",
        data: { hafta: hafta, recete: '' },
        dataType: 'json',
        success: function (response) {
            if (response.error) {
                console.error('Error fetching grid data:', response.error);
                return;
            }

            console.log(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('AJAX Error:', textStatus, errorThrown);
        }
    });
}


async function refreshChart() {
    try {
        // await getProdData(); // Call the function to update chart data
        brands.forEach(async element => {
            await getProdData(element);
        });
        console.log('REFRESH')
    } catch (error) {
        console.error('Error refreshing chart:', error);
    }
}

// Call refreshChart every 10 minutes (600000 milliseconds)
setInterval(refreshChart, 10 * 60 * 1000);

//----------------------------------------------------------------------------- BAR GRAPH END -----------------------------------------------------------------------------


//----------------------------------------------------------------------------- PIE GRAPH START -----------------------------------------------------------------------------
function createPieChart(chartId, labels, data) {
    const totalDowntime = data.reduce((acc, curr) => acc + curr, 0);
    const totalSecondsInADay = 28800;
    const uretimValue = totalSecondsInADay - totalDowntime;

    labels.push("ÜRETİM");
    data.push(uretimValue);

    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(0, 255, 0, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(0, 255, 0, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const value = tooltipItem.raw;
                            const formattedTime = formatTime(value);
                            return `${tooltipItem.label}: ${formattedTime}`;
                        }
                    }
                }
            }
        }
    });
    const valuesContainer = document.createElement('div');
    valuesContainer.classList.add('values-container');

    const valueList = labels.map((label, index) => {
        const formattedTime = formatTime(data[index]);
        return `<li><strong>${label}:</strong> ${formattedTime}</li>`;
    }).join('');

    valuesContainer.innerHTML = `<ul>${valueList}</ul>`;
    document.getElementById(chartId).parentNode.appendChild(valuesContainer);
}

function fetchVardiyaData() {
    $.ajax({
        type: "POST",
        url: "../functions/durus.php",
        success: function (response) {
            $('#chartsContainer').empty();

            for (const [vardiya, data] of Object.entries(response)) {
                const labels = data.map(item => item.DURUS_SEBEBI);
                const durations = data.map(item => item.TOTAL_DURUS_SURESI_IN_SECONDS);
                const tarih = data.map(item => item.DURUS_TARIHI);
                const chartId = `chart_${vardiya}`;

                $('#chartsContainer').append(`
                    <div class="chart-container">
                        <h3>${tarih} - VARDIYA ${vardiya}</h3>
                        <div style="display: flex;">
                            <canvas id="${chartId}"></canvas>
                            <div id="values_${chartId}"></div>
                        </div>
                    </div>
                `);

                createPieChart(chartId, labels, durations);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('AJAX Error:', textStatus, errorThrown);
        }
    });
}

$(document).ready(function () {
    // Fetch data and create charts on page load
    fetchVardiyaData();

    // Refresh the charts every 10 minutes
    setInterval(fetchVardiyaData, 10 * 60 * 1000);
});

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

$(document).ready(function () {
    fetchVardiyaData();
    setInterval(fetchVardiyaData, 10 * 60 * 1000);
});

//----------------------------------------------------------------------------- PIE GRAPH END -----------------------------------------------------------------------------


//----------------------------------------------------------------------------- GRID START -----------------------------------------------------------------------------

async function getBoyahaneUretim(recete) {
    try {
        const response = await fetch('../functions/boyahane_uretim.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'recete=' + encodeURIComponent(recete)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse JSON response
        const data = await response.json();

        // Check if the Boyahane property exists and return 0 if it's missing
        if (data.length > 0 && data[0].Boyahane !== undefined) {
            return data[0].Boyahane;
        } else {
            return 0;  // Return 0 if Boyahane is not defined or the data array is empty
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return 0;  // Return 0 in case of an error as a fallback
    }
}


async function fetchGridData(hatParameter) {
    $.ajax({
        type: "POST",
        url: "../functions/uretim_grid.php",
        data: { hatParameter: hatParameter },
        dataType: 'json',
        success: async function (response) {
            if (response.error) {
                console.error('Error fetching grid data:', response.error);
                return;
            }

            vwGrid1.innerHTML = ''; // Clear any existing content

            // Create table structure
            const table = document.createElement('table');
            table.classList.add('data-grid');

            // Create table header
            const headerRow = document.createElement('tr');
            const headers = ['Recete', 'Boyahane', 'Polisaj', 'OK', 'NOK', 'NOK %'];
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            // Populate table with data
            for (const row of response) {
                const dataRow = document.createElement('tr');

                // Create a Boyahane cell that will be updated asynchronously
                let boyahaneCell = document.createElement('td');
                boyahaneCell.textContent = 'Loading...';  // Placeholder text

                // Add other columns first
                Object.keys(row).forEach((key, index) => {
                    let td = document.createElement('td');  // Changed const to let
                    if (key !== 'BOYAHANE') { // Skip the BOYAHANE for now
                        td.textContent = row[key];
                    } else {
                        td = boyahaneCell; // Use the placeholder for Boyahane
                    }
                    dataRow.appendChild(td);
                });

                // Append row to the table
                table.appendChild(dataRow);

                // Now fetch and update the Boyahane value for the current Recete
                const recete = row.RECETE;
                try {
                    const boyahaneValue = await getBoyahaneUretim(recete);
                    boyahaneCell.textContent = boyahaneValue;
                } catch (error) {
                    boyahaneCell.textContent = 'Error';
                    console.error(`Failed to fetch Boyahane for Recete: ${recete}`, error);
                }
            }


            // Append the table to the grid container
            vwGrid1.appendChild(table);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('AJAX Error:', textStatus, errorThrown);
        }
    });
}


//----------------------------------------------------------------------------- GRID END -----------------------------------------------------------------------------

// Get the canvas elements
const haftalikUretimCanvas = document.getElementById('haftalikUretimGraph');
const pieGraph = document.getElementById('anlikKumulatif');
const pieGraph2 = document.getElementById('gecmisKumulatif');
const chartsContainer = document.getElementById('chartsContainer');
const vwGrid1 = document.getElementById('vwGrid1');
const vwGrid2 = document.getElementById('vwGrid1');
const vwGrid3 = document.getElementById('vwGrid1');
const vwGrid4 = document.getElementById('vwGrid1');
const vwGrid5 = document.getElementById('vwGrid1');
const vwGrid6 = document.getElementById('vwGrid1');
const vwGrid7 = document.getElementById('vwGrid1');
const vwGrid8 = document.getElementById('vwGrid1');

// Function to toggle visibility of the charts
async function toggleCharts() {
    switch (graphMode) {
        case 0:
            await getProdData(brands[graphMode]);
            clearInterval(intervalId);
            intervalId = setInterval(toggleCharts, longIntervalTime);
            haftalikUretimCanvas.style.display = 'block';
            pieGraph.style.display = 'block';
            pieGraph2.style.display = 'block';
            chartsContainer.style.display = 'none';
            vwGrid1.style.display = 'none';
            document.getElementById("header1").innerHTML = 'Polisaj Haftalık Üretim';
            graphMode++;
            break;

        case 1:
            await getProdData(brands[graphMode]);
            clearInterval(intervalId);
            intervalId = setInterval(toggleCharts, longIntervalTime);
            document.getElementById("header1").innerHTML = brands[graphMode] + ' Haftalık Üretim';
            graphMode++;
            break;

        case 2:
            await getProdData(brands[graphMode]);
            clearInterval(intervalId);
            intervalId = setInterval(toggleCharts, longIntervalTime);
            document.getElementById("header1").innerHTML = brands[graphMode] + ' Haftalık Üretim';
            graphMode++;
            break;

        case 3:
            clearInterval(intervalId);
            intervalId = setInterval(toggleCharts, normalIntervalTime);
            haftalikUretimCanvas.style.display = 'none';
            pieGraph.style.display = 'none';
            pieGraph2.style.display = 'none';
            chartsContainer.style.display = 'block';
            vwGrid1.style.display = 'none';
            document.getElementById("header1").innerHTML = 'Polisaj Üretim/Duruş Oranı';
            graphMode++;
            break;

        case 4:
            let hatParameter = vwRecipes[graphMode];
            fetchGridData(hatParameter); // Fetch and display the grid data
            haftalikUretimCanvas.style.display = 'none';
            chartsContainer.style.display = 'none';
            vwGrid1.style.display = 'block';
            document.getElementById("header1").innerHTML = 'Haftalık VW TIGUAN TKM Üretim Bilgileri';
            clearInterval(intervalId);
            intervalId = setInterval(toggleCharts, shortIntervalTime);
            graphMode++;
            break;

        case 5:
            let hatParameter4 = vwRecipes[graphMode];
            fetchGridData(hatParameter4); // Fetch and display the grid data
            vwGrid1.style.display = 'none';
            vwGrid2.style.display = 'block';
            document.getElementById("header1").innerHTML = 'Haftalık VW TIGUAN LKM Üretim Bilgileri';
            graphMode++;
            break;

        case 6:
            let hatParameter5 = vwRecipes[graphMode];
            fetchGridData(hatParameter5); // Fetch and display the grid data
            vwGrid2.style.display = 'none';
            vwGrid3.style.display = 'block';
            document.getElementById("header1").innerHTML = 'Haftalık VW TAYRON TKM Üretim Bilgileri';
            graphMode++;
            break;

        case 7:
            let hatParameter6 = vwRecipes[graphMode];
            fetchGridData(hatParameter6); // Fetch and display the grid data
            vwGrid3.style.display = 'none';
            vwGrid4.style.display = 'block';
            document.getElementById("header1").innerHTML = 'Haftalık VW TAYRON LKM Üretim Bilgileri';
            graphMode++;
            break;

        case 8:
            let hatParameter7 = vwRecipes[graphMode];
            fetchGridData(hatParameter7); // Fetch and display the grid data
            vwGrid4.style.display = 'none';
            vwGrid5.style.display = 'block';
            document.getElementById("header1").innerHTML = 'Haftalık FORD LOGO Üretim Bilgileri';
            graphMode++;
            break;

        case 9:
            let hatParameter8 = vwRecipes[graphMode];
            fetchGridData(hatParameter8); // Fetch and display the grid data
            vwGrid5.style.display = 'none';
            vwGrid6.style.display = 'block';
            document.getElementById("header1").innerHTML = 'Haftalık Hyundai BC3 Üretim Bilgileri';
            graphMode++;
            break;

        case 10:
            let hatParameter9 = vwRecipes[graphMode];
            fetchGridData(hatParameter9); // Fetch and display the grid data
            vwGrid6.style.display = 'none';
            vwGrid7.style.display = 'block';
            document.getElementById("header1").innerHTML = 'Haftalık Hyundai CUV Üretim Bilgileri';
            graphMode++;
            break;

        case 11:
            let hatParameter10 = vwRecipes[graphMode];
            fetchGridData(hatParameter10); // Fetch and display the grid data
            vwGrid7.style.display = 'none';
            vwGrid8.style.display = 'block';
            document.getElementById("header1").innerHTML = 'Haftalık Türk Traktör Üretim Bilgileri';
            graphMode = 0;
            break;

        default:
            // Optional: Handle unexpected graphMode values if necessary
            break;
    }

}


// Initial call to show haftalikUretimGraph and hide chartsContainer
haftalikUretimCanvas.style.display = 'block';
pieGraph.style.display = 'block';
pieGraph2.style.display = 'block';
chartsContainer.style.display = 'none';
vwGrid1.style.display = 'none';
vwGrid2.style.display = 'none';
vwGrid3.style.display = 'none';
vwGrid4.style.display = 'none';
vwGrid5.style.display = 'none';
vwGrid6.style.display = 'none';
vwGrid7.style.display = 'none';
vwGrid8.style.display = 'none';

// Set interval to toggle charts every 5 seconds (5000 milliseconds)
intervalId = setInterval(toggleCharts, longIntervalTime);
window.onload = function () {
    getProdData(brands[0]);
    graphMode = 1;
    fetchKumulatif(0);
};
