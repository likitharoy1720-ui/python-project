CREATE DATABASE peak_horizon;

USE peak_horizon;

CREATE TABLE temperature_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperatures VARCHAR(255),
    result VARCHAR(255)
);

INSERT INTO temperature_data
(temperatures, result)
VALUES
('73,74,75,71,69,72,76,73',
 '1,1,4,2,1,1,0,0');

SELECT * FROM temperature_data;
