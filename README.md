# API para ciclos de Plasma de Trazadomus

**Advertencia** La API aún se encuentra en desarrollo y en pruebas. Usela con precaución.

## Servicios disponibles.

Solo se puede solicitar datos con solicitudes http `GET` a la URL `trazadomus-api-63s4f7twrq-uc.a.run.app` en los endpoints `ciclos` que devuelve los ultimos 20 ciclos y `equipos` que devuelve los idGDR que identifican a cada equipo y su ubicación. Con el idGRD se puede hacer una solicitud a `equipos/idGRD` para obtener los ultimos 20 ciclos realizados por ese equipo.

## TODO
- [ ] Habilitar seguridad
- [ ] Solicitar más o menos registros
- [ ] Hacer solicitudes para fechas especificas
- [ ] Incluir los endpoints en el dominio de Technodomus.
