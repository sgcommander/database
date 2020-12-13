DROP PROCEDURE IF EXISTS `eliminarUnidadMision`;

#############################################################################
#
# Este procedimiento, permite eliminar de cualquier mision, una unidad
# que esta contenga. Teniendo en cuenta que si solo habia ese tipo de unidad
# la mision sera eliminada definitivamente, mientras que si existian mas
# tipos de unidades, la mision proseguira, pero sin la unidad eliminada
#
#############################################################################
CREATE PROCEDURE eliminarUnidadMision (IN idUnd INT, IN idJug INT)
BEGIN
	DECLARE fin INT;
	DECLARE otrasUnidades INT;
	DECLARE idMis INT;

	#Obtenemos los identificadores de mision y la cantidad de distitnas unidades que hay en ellas
	DECLARE misionesAfectadas CURSOR FOR
		SELECT COUNT(*)>1, idMision
		FROM unidadJugadorPlanetaMision
		WHERE idMision IN(
				SELECT id FROM mision AS m
				JOIN unidadJugadorPlanetaMision AS u ON m.id=u.idMision
				WHERE u.idUnidad=idUnd AND m.idJugador=idJug
			)
		GROUP BY idMision;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET fin = 1;#Cuando no se encuentran mas lineas se marcala variable fin

	SET fin=0;

	OPEN misionesAfectadas;

	REPEAT
		FETCH misionesAfectadas INTO otrasUnidades, idMis;

		IF NOT fin THEN
			#Eliminamos las unidades especiales de la mision
			DELETE FROM unidadJugadorPlanetaMision WHERE idUnidad=idUnd AND idJugador=idJug AND idMision=idMis;

			#Si no hay otras unidades a parte de las especiales, se elimina la mision
			IF NOT otrasUnidades THEN
				DELETE FROM mision WHERE id=idMis;
			END IF;
		END IF;
	UNTIL fin END REPEAT;
END