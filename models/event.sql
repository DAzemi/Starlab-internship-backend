DELIMITER //
CREATE EVENT NullifyExpiredTokens
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
  UPDATE temporaryUsers
  SET verification_token = NULL
  WHERE verification_token IS NOT NULL AND TIMESTAMPDIFF(SECOND, verification_token_created, NOW()) >= 86400;
END;
//
DELIMITER ;

SET GLOBAL event_scheduler = ON;

