<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boyahane Grafik</title>
    <link rel="stylesheet" href="styles.css"> 
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
</head>
<body>
    <h2 id="header1" style="text-align: center;">Polisaj Haftalık Üretim</h2>

    <div class="footer">
        <span style="color: #0000A8;">Bilgehan</span>
        <span id="datetime" style="margin-left: 15px;"></span>
        <span>Developed by A-Plas IT - Version 3.3</span>
    </div>

    <!-- Container for both charts -->
    <div class="chart-wrapper">
        <div>
            <!-- Canvas element where the bar chart will be rendered -->
            <canvas id="haftalikUretimGraph" width="400px" height="250px"></canvas>
        </div>
        <div>
            <!-- Canvas element where the pie chart will be rendered -->
            <canvas id="anlikKumulatif" width="80px" height="80px"></canvas>
            <canvas id="gecmisKumulatif" width="80px" height="80px"></canvas>
        </div>
    </div>

    <div id="chartsContainer" class="charts-row"></div>
    <div id="vwGrid1" class="grid-row"></div>
    <div id="vwGrid2" class="grid-row"></div>
    <div id="vwGrid3" class="grid-row"></div>
    <div id="vwGrid4" class="grid-row"></div>
    <div id="vwGrid5" class="grid-row"></div>
    <div id="vwGrid6" class="grid-row"></div>
    <div id="vwGrid7" class="grid-row"></div>
    <div id="vwGrid8" class="grid-row"></div>
    <script src="index.js"></script>
</body>
</html>
