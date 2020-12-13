DROP FUNCTION IF EXISTS `cantidadProporcional`;

#############################################################################
## Esta funcion permite calcular los recursos devueltos a los usuarios con
## respecto al coste inicial de la construccion o investigacion, teniendo en
## cuenta cuando se inicio la construccion/investigacion y cuando termina.
##
## Ademas tiene como parametro un valor porcentual, el cual indica la
## cantidad maxima que se puede quitar en total a los recursos.
##
##  Ej: 0.8 (proporcionalidad)
##      justo cuando llegue al final del tiempo, si se cancela y el usuario
##      pag� 100 de recursos, solo se le devolveran 19.9......
#############################################################################
CREATE FUNCTION `cantidadProporcional` (proporcion FLOAT, tiempoInicial TIMESTAMP, tiempoFinal TIMESTAMP, cantidad FLOAT)
RETURNS FLOAT
NOT DETERMINISTIC READS SQL DATA
BEGIN
	SET cantidad = cantidad-(((proporcion*cantidad)/(UNIX_TIMESTAMP(tiempoFinal)-UNIX_TIMESTAMP(tiempoInicial)))*(UNIX_TIMESTAMP(CURRENT_TIMESTAMP)-UNIX_TIMESTAMP(tiempoInicial)));
	IF cantidad < 0 THEN
		SET cantidad = 0;
	END IF;

	RETURN cantidad;
END;
