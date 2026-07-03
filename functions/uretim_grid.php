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

$hatParameter = '%' . $_POST['hatParameter'] . '%';

// SQL Query
$query = "
SELECT 
    RECETE,  
    0 as BOYAHANE,
    COUNT(*) AS POLISAJ_ADET,
    SUM(CASE WHEN SONUC = 'OK' THEN 1 ELSE 0 END) AS [OK],
    SUM(CASE WHEN SONUC = 'ISKARTA' THEN 1 ELSE 0 END) AS [NOK],
    CASE 
        WHEN SUM(CASE WHEN SONUC = 'OK' THEN 1 ELSE 0 END) = 0 THEN 0
        ELSE 
            ROUND(
                CAST(SUM(CASE WHEN SONUC = 'ISKARTA' THEN 1 ELSE 0 END) AS FLOAT) / 
                SUM(CASE WHEN SONUC = 'OK' OR SONUC = 'ISKARTA' THEN 1 ELSE 0 END) * 100,
                2
            )
    END AS [NOK %]
FROM [BOYAHANE].[dbo].[POLISAJ_A3] 
WHERE RECETE LIKE ? 
AND KAYIT_TARIHI >= DATEADD(DAY, -7, CAST(GETDATE() AS DATE))
GROUP BY RECETE 
ORDER BY RECETE DESC;
";

$params = array($hatParameter);
// Execute the query
$result = sqlsrv_query($conn_uvt, $query, $params);

if ($result === false) {
    echo json_encode(['error' => print_r(sqlsrv_errors(), true)]);
    exit();
}

// Initialize an empty array to hold the data
$data = [];

while ($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC)) {
    $data[] = $row;
}

// Free the statement and close the connection
sqlsrv_free_stmt($result);
sqlsrv_close($conn_uvt);

// Return the data as JSON
echo json_encode($data);
exit();
?>
