USE lost_pet_network;

SELECT report_id, pet_id, last_seen_location, status
FROM Lost_Reports
WHERE status IN ('LOST', 'UNDER_INVESTIGATION')
ORDER BY lost_datetime DESC;

SELECT pet_id, pet_name, animal_type
FROM Pets
WHERE breed IS NULL;

SELECT status, COUNT(*) AS report_count
FROM Lost_Reports
GROUP BY status
HAVING COUNT(*) >= 1
ORDER BY report_count DESC;

SELECT ROUND(AVG(match_score), 2) AS average_score,
       MAX(match_score) AS highest_score,
       MIN(match_score) AS lowest_score
FROM Potential_Matches;

SELECT u.full_name AS owner_name,
       p.pet_name,
       lr.last_seen_location,
       pm.match_score,
       pm.match_status,
       rc.recovered_at
FROM Users AS u
JOIN Pets AS p ON p.owner_id = u.user_id
JOIN Lost_Reports AS lr ON lr.pet_id = p.pet_id
JOIN Potential_Matches AS pm ON pm.report_id = lr.report_id
LEFT JOIN Recovery_Cases AS rc ON rc.match_id = pm.match_id
ORDER BY pm.match_score DESC;

SELECT u.user_id, u.full_name,
       COUNT(s.sighting_id) AS sighting_count
FROM Users AS u
LEFT JOIN Sightings AS s ON s.reported_by = u.user_id
GROUP BY u.user_id, u.full_name
ORDER BY sighting_count DESC, u.full_name;

SELECT full_name, role
FROM Users
WHERE role = 'OWNER'
UNION
SELECT full_name, role
FROM Users
WHERE role = 'COMMUNITY';

SELECT full_name
FROM Users
WHERE role = 'OWNER'
UNION ALL
SELECT full_name
FROM Users
WHERE role = 'COMMUNITY';

SELECT match_id, report_id, match_score
FROM Potential_Matches
WHERE match_score > (
    SELECT AVG(match_score)
    FROM Potential_Matches
)
ORDER BY match_score DESC;

SELECT u.user_id, u.full_name
FROM Users AS u
WHERE EXISTS (
    SELECT 1
    FROM Pets AS p
    WHERE p.owner_id = u.user_id
);

SELECT match_id, match_score,
       CASE
           WHEN match_score >= 95 THEN 'VERY HIGH'
           WHEN match_score >= 90 THEN 'HIGH'
           WHEN match_score >= 70 THEN 'MEDIUM'
           ELSE 'LOW'
       END AS match_category
FROM Potential_Matches
ORDER BY match_score DESC;

SELECT DATE_FORMAT(recovered_at, '%Y-%m') AS recovery_month,
       COUNT(*) AS recoveries
FROM Recovery_Cases
GROUP BY DATE_FORMAT(recovered_at, '%Y-%m')
ORDER BY recovery_month;

WITH score_summary AS (
    SELECT AVG(match_score) AS avg_score
    FROM Potential_Matches
)
SELECT pm.match_id, pm.match_score,
       ROUND(ss.avg_score, 2) AS average_score
FROM Potential_Matches AS pm
CROSS JOIN score_summary AS ss
WHERE pm.match_score > ss.avg_score
ORDER BY pm.match_score DESC;

SELECT match_id, report_id, match_score,
       RANK() OVER (ORDER BY match_score DESC) AS score_rank
FROM Potential_Matches;

CREATE OR REPLACE VIEW vw_pet_match_summary AS
SELECT p.pet_name,
       p.animal_type,
       lr.report_id,
       lr.status AS report_status,
       pm.match_score,
       pm.match_status
FROM Pets AS p
JOIN Lost_Reports AS lr ON lr.pet_id = p.pet_id
JOIN Potential_Matches AS pm ON pm.report_id = lr.report_id;

SELECT *
FROM vw_pet_match_summary
ORDER BY match_score DESC;

CREATE FULLTEXT INDEX ft_lost_report_description
ON Lost_Reports(description);

SELECT report_id, description
FROM Lost_Reports
WHERE MATCH(description)
AGAINST ('collar dog' IN NATURAL LANGUAGE MODE);

DROP PROCEDURE IF EXISTS GetMatchesAboveScore;
DELIMITER //
CREATE PROCEDURE GetMatchesAboveScore(IN minimum_score DECIMAL(5,2))
BEGIN
    SELECT match_id, report_id, sighting_id, match_score, match_status
    FROM Potential_Matches
    WHERE match_score >= minimum_score
    ORDER BY match_score DESC;
END //
DELIMITER ;

CALL GetMatchesAboveScore(90);

DROP FUNCTION IF EXISTS MatchScoreLabel;
DELIMITER //
CREATE FUNCTION MatchScoreLabel(score DECIMAL(5,2))
RETURNS VARCHAR(10)
DETERMINISTIC
NO SQL
BEGIN
    RETURN CASE
        WHEN score >= 95 THEN 'VERY HIGH'
        WHEN score >= 90 THEN 'HIGH'
        WHEN score >= 70 THEN 'MEDIUM'
        ELSE 'LOW'
    END;
END //
DELIMITER ;

SELECT match_id, match_score, MatchScoreLabel(match_score) AS score_label
FROM Potential_Matches;

DROP TRIGGER IF EXISTS trg_recovery_updates_report;
DELIMITER //
CREATE TRIGGER trg_recovery_updates_report
AFTER INSERT ON Recovery_Cases
FOR EACH ROW
BEGIN
    UPDATE Lost_Reports
    SET status = 'RECOVERED'
    WHERE report_id = NEW.report_id;
END //
DELIMITER ;
