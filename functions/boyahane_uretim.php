<?php
include 'connection_path';

// Turn off output buffering to prevent accidental output before JSON
ob_start();

// Check if data is received via POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the data from the POST request
    $recete = '%;' . $_POST['recete'] . ';%'; // Adjust the variable names as needed to append '%' for LIKE

    // Prepare an SQL statement to prevent SQL injection
    $stmt = $conn->prepare(
        "SELECT 
            COALESCE(SUM(Boyahane_Miktar), 0) AS Boyahane
        FROM
            (SELECT 
                COALESCE(COUNT(*) * MIKTAR, 0) AS Boyahane_Miktar
            FROM
                boyahane.print
            WHERE
                BARKOD LIKE ? AND
                UNLOADING_TIME >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY 
                TYP_NAME, COLOR_NAME, MIKTAR
            ) AS subquery;"
    );
    
    // Bind the parameter (adding 's' for string type)
    $stmt->bind_param("s", $recete);

    // Execute the statement and check for success
    if ($stmt->execute()) {
        // Fetch the result
        $result = $stmt->get_result();

        // Check if any rows were returned
        if ($result->num_rows > 0) {
            // Output the results as JSON
            $rows = array();
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            echo json_encode($rows);
        } else {
            echo json_encode(array("message" => "No results found"));
        }
    } else {
        echo json_encode(array("error" => $stmt->error)); // Return errors as JSON
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(array("error" => "Invalid request method"));
}
?>