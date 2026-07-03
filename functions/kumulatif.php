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

$hafta = $_POST['hafta'];
$recete = '%' . $_POST['recete'] . '%';

// SQL Query
$query = "
    WITH HAFTA AS (
        SELECT 
            DATEADD(WEEK, DATEDIFF(WEEK, 0, GETDATE()) - {$hafta}, 0) AS PAZARTESI,
            DATEADD(DAY, 6, DATEADD(WEEK, DATEDIFF(WEEK, 0, GETDATE()) - {$hafta}, 0)) AS PAZAR
    ),
    DistinctCombinations AS (
        SELECT DISTINCT 
            ISLEM, 
            SONUC 
        FROM 
            POLISAJ_A3
    ),
    FilteredData AS (
        SELECT 
            ISLEM, 
            SONUC, 
            COUNT(*) AS [SAYI]
        FROM 
            POLISAJ_A3
        WHERE 
            ISLEM_BITIS >= (SELECT PAZARTESI FROM HAFTA) 
            AND ISLEM_BITIS < DATEADD(DAY, 1, (SELECT PAZAR FROM HAFTA))
            AND RECETE LIKE ?
        GROUP BY 
            ISLEM, 
            SONUC
    )
    SELECT 
        DC.ISLEM, 
        DC.SONUC, 
        COALESCE(FD.SAYI, 0) AS [SAYI],
        -- Calculate the ratio of SAYI to the total count, handling nulls gracefully
        COALESCE(
            ROUND(
                CAST(FD.SAYI AS FLOAT) / NULLIF(SUM(FD.SAYI) OVER (), 0) * 100, 2
            ), 0
        ) AS [SAYI_PCT]
    FROM 
        DistinctCombinations DC
    LEFT JOIN 
        FilteredData FD ON DC.ISLEM = FD.ISLEM AND DC.SONUC = FD.SONUC
    ORDER BY 
        DC.ISLEM, 
        DC.SONUC;
";

// Execute the query
$params = array($recete);
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
