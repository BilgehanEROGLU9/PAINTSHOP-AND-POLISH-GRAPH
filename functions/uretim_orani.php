<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include the connection file
$connectionFile = "connection_path";

if (!file_exists($connectionFile)) {
    echo 'Error: Connection file does not exist';
    exit();
}

include($connectionFile);

$recete = '%' . $_POST['recete'] . '%';

// Set Content-Type to plain text
header('Content-Type: text/plain; charset=UTF-8');

// SQL Query
$query = "
WITH PolishCTE AS (
    SELECT 
        YEAR([KAYIT_TARIHI]) AS YEAR,
        MONTH([KAYIT_TARIHI]) AS MONTH,
        CAST([KAYIT_TARIHI] AS DATE) AS DATE,
        [ISLEM] AS PROCESS,
        CAST(COUNT([ISLEM]) AS INT) AS QUANTITY
    FROM [BOYAHANE].[dbo].[POLISAJ_A3]
    WHERE [ISLEM] = 'POLISH' AND [SONUC] = 'OK' AND RECETE LIKE ?
    GROUP BY YEAR([KAYIT_TARIHI]), MONTH([KAYIT_TARIHI]), CAST([KAYIT_TARIHI] AS DATE), [ISLEM]
),
PolishISK AS (
    SELECT 
        YEAR([KAYIT_TARIHI]) AS YEAR,
        MONTH([KAYIT_TARIHI]) AS MONTH,
        CAST([KAYIT_TARIHI] AS DATE) AS DATE,
        [ISLEM] AS PROCESS,
        CAST(COUNT([ISLEM]) AS INT) AS QUANTITY
    FROM [BOYAHANE].[dbo].[POLISAJ_A3]
    WHERE [ISLEM] = 'POLISH' AND [SONUC] = 'ISKARTA' AND RECETE LIKE ?
    GROUP BY YEAR([KAYIT_TARIHI]), MONTH([KAYIT_TARIHI]), CAST([KAYIT_TARIHI] AS DATE), [ISLEM]
),
FTTCTE AS (
    SELECT 
        YEAR([KAYIT_TARIHI]) AS YEAR,
        MONTH([KAYIT_TARIHI]) AS MONTH,
        CAST([KAYIT_TARIHI] AS DATE) AS DATE,
        [ISLEM] AS PROCESS,
        CAST(COUNT([ISLEM]) AS INT) AS QUANTITY
    FROM [BOYAHANE].[dbo].[POLISAJ_A3]
    WHERE [ISLEM] = 'OK' AND RECETE LIKE ?
    GROUP BY YEAR([KAYIT_TARIHI]), MONTH([KAYIT_TARIHI]), CAST([KAYIT_TARIHI] AS DATE), [ISLEM]
),
IskartaCTE AS (
    SELECT 
        YEAR([KAYIT_TARIHI]) AS YEAR,
        MONTH([KAYIT_TARIHI]) AS MONTH,
        CAST([KAYIT_TARIHI] AS DATE) AS DATE,
        CAST(COUNT([ISLEM]) AS DECIMAL(18, 4)) AS QUANTITY
    FROM [BOYAHANE].[dbo].[POLISAJ_A3]
    WHERE ([ISLEM] = 'ISKARTA' OR ( ISLEM = 'OK' AND SONUC = 'ISKARTA')) AND RECETE LIKE ?
    GROUP BY YEAR([KAYIT_TARIHI]), MONTH([KAYIT_TARIHI]), CAST([KAYIT_TARIHI] AS DATE)
)
SELECT 
    TAB1.YEAR,
    TAB1.MONTH,
    TAB1.DATE,
	TAB1.[TOTAL QTY],
    TAB1.[FTT QTY],
    TAB1.[PLS QTY],
	TAB1.[PLS ISK QTY],
    TAB1.[SCP QTY],
    '% ' + CAST(CAST(TAB1.[FTT QTY] * 100.0 / TAB1.[TOTAL QTY] AS DECIMAL(18, 2)) AS NVARCHAR(10)) AS [FTT %],
	'% ' + CAST(CAST(TAB1.[PLS QTY] * 100.0 / TAB1.[TOTAL QTY] AS DECIMAL(18, 2)) AS NVARCHAR(10)) AS [POLISH %],
	'% ' + CAST(CAST(TAB1.[PLS ISK QTY] * 100.0 / TAB1.[TOTAL QTY] AS DECIMAL(18, 2)) AS NVARCHAR(10)) AS [POLISH ISK %],
	'% ' + CAST(CAST(TAB1.[SCP QTY] * 100.0 / TAB1.[TOTAL QTY] AS DECIMAL(18, 2)) AS NVARCHAR(10)) AS [SCRAP %]
FROM (
    SELECT 
    F.YEAR,
    F.MONTH,
    F.DATE,
    CAST(COALESCE(F.QUANTITY, 0) AS INT) AS [FTT QTY],
    CAST(COALESCE(P.QUANTITY, 0) AS INT) AS [PLS QTY],
    CAST(COALESCE(PISK.QUANTITY, 0) AS INT) AS [PLS ISK QTY],
    CAST(COALESCE(I.QUANTITY, 0) AS INT) AS [SCP QTY],
    CAST((COALESCE(F.QUANTITY, 0) + COALESCE(P.QUANTITY, 0) + COALESCE(I.QUANTITY, 0) + COALESCE(PISK.QUANTITY, 0)) AS INT) AS [TOTAL QTY]
	FROM FTTCTE F
	LEFT OUTER JOIN PolishCTE P ON F.DATE = P.DATE    
	LEFT OUTER JOIN IskartaCTE I ON F.DATE = I.DATE
	LEFT OUTER JOIN PolishISK PISK ON F.DATE = PISK.DATE   
) TAB1
WHERE TAB1.DATE >= DATEADD(DAY, -7, CAST(GETDATE() AS DATE))
ORDER BY TAB1.DATE ASC;
";

// Execute the query
$params = array($recete, $recete, $recete, $recete);
$result = sqlsrv_query($conn_uvt, $query, $params);

if ($result === false) {
    echo 'Error: ' . print_r(sqlsrv_errors(), true);
    exit();
}




// Initialize an empty string to hold the data
$output = '';

while ($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC)) {
    // Format the data as plain text (pipe-separated)
    $output .= $row['DATE']->format('Y-m-d') . '|' . 
               $row['FTT QTY'] . '|' . 
               $row['PLS QTY'] . '|' . 
               $row['SCP QTY'] . '|' . 
               $row['SCRAP %'] . '|' . 
               $row['POLISH %'] . '|' .
               $row['TOTAL QTY'] . '|' . 
               $row['FTT %'] . '|' . 
               $row['PLS ISK QTY'] . '|' . 
               $row['POLISH ISK %'] . "\n";
}

// Free the statement and close the connection
sqlsrv_free_stmt($result);
sqlsrv_close($conn_uvt);

// Return the output as plain text
echo $output;
exit();
?>