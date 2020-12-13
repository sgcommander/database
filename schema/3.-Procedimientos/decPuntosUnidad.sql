DROP PROCEDURE IF EXISTS `decPuntosUnidad`;

#############################################################################
## Este procedimiento decrementa los puntos de una unidad a un usuario
#############################################################################
CREATE PROCEDURE `decPuntosUnidad` (IN idJugadorConstruye INTEGER UNSIGNED, IN idUnidad INTEGER UNSIGNED, IN cantidad INTEGER UNSIGNED)
BEGIN
    DECLARE idTipo TINYINT UNSIGNED;
    DECLARE puntuacion INTEGER UNSIGNED;

	#Calculo de los puntos obtenidos
	SELECT idTipoUnidad, puntos INTO idTipo, puntuacion FROM unidad WHERE id=idUnidad;
	SET puntuacion=puntuacion*cantidad;

	#Asignando los puntos obtenidos
	CASE idTipo
		WHEN 1 THEN
 			UPDATE jugadorInfoPuntuaciones SET puntosNaves=puntosNaves-puntuacion WHERE idJugador=idJugadorConstruye;
		WHEN 2 THEN
			UPDATE jugadorInfoPuntuaciones SET puntosSoldados=puntosSoldados-puntuacion WHERE idJugador=idJugadorConstruye;
		WHEN 3 THEN
			UPDATE jugadorInfoPuntuaciones SET puntosDefensas=puntosDefensas-puntuacion WHERE idJugador=idJugadorConstruye;
	END CASE;
END;