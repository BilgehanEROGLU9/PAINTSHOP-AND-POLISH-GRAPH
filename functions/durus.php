<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include the connection file
$connectionFile = "connection_path";

if (!file_exists($connectionFile)) {
    echo json_encode(['error' => 'Connection file does not exist']);
    exit();
}

include($connectionFile);

// Set Content-Type to JSON
header('Content-Type: application/json; charset=UTF-8');

// SQL Query
$query = "
SELECT 
    DURUS_SEBEBI,
    VARDIYA,
    CAST(DURUS_BASLANGIC AS DATE) AS DURUS_TARIHI,
    SUM(DATEDIFF(SECOND, '00:00:00', DURUS_SURESI)) AS TOTAL_DURUS_SURESI_IN_SECONDS
FROM 
    DURUS_A3
WHERE 
    DURUS_BASLANGIC >= DATEADD(DAY, -1, CAST(GETDATE() AS DATE))
    AND DURUS_BASLANGIC < CAST(GETDATE() AS DATE)
GROUP BY 
    DURUS_SEBEBI,
    CAST(DURUS_BASLANGIC AS DATE),
    VARDIYA
ORDER BY 
    DURUS_TARIHI DESC, VARDIYA;
";

// Execute the query
$result = sqlsrv_query($conn_uvt, $query);

if ($result === false) {
    echo json_encode(['error' => print_r(sqlsrv_errors(), true)]);
    exit();
}

// Fetch data and group by VARDIYA
$data = [];
while ($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC)) {
    $vardiya = $row['VARDIYA'];
    $data[$vardiya][] = [
        'DURUS_TARIHI' => $row['DURUS_TARIHI']->format('Y-m-d'),
        'DURUS_SEBEBI' => $row['DURUS_SEBEBI'],
        'TOTAL_DURUS_SURESI_IN_SECONDS' => $row['TOTAL_DURUS_SURESI_IN_SECONDS']
    ];
}

// Free the statement and close the connection
sqlsrv_free_stmt($result);
sqlsrv_close($conn_uvt);

// Return the data as JSON
echo json_encode($data);
exit();
?>
