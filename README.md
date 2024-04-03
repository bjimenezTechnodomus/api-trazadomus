# API para ciclos de Plasma de Trazadomus

**Advertencia** La API aún se encuentra en desarrollo y en pruebas. Usela con precaución.

## Servicios disponibles.

Solo se puede solicitar datos con solicitudes http `GET` a la URL `trazadomus-api.technodomus.com` en los endpoints `ciclos` que devuelve los últimos 50 ciclos y `equipos` que devuelve los idGDR que identifican a cada equipo y su ubicación. Con el idGRD se puede hacer una solicitud a `ciclos/{idGRD}` para obtener los últimos 20 ciclos realizados por ese equipo, en formato JSON.

## Ejemplo de uso

```bash
curl 'https://trazadomus-api.technodomus.com/ciclos' | jq
```
Devuelve la lista de los últimos 50 ciclos.

```bash
curl 'https://trazadomus-api.technodomus.com/equipos' | jq
```
Devuelve la lista de los idGDR de los equipos.

```bash
curl 'https://trazadomus-api.technodomus.com/ciclos/861' | jq
```
Devuelve los primeros 20 ciclos del equipo con idGRD 1.

## TODO
- [ ] Habilitar seguridad
- [x] Solicitar más o menos registros
- [ ] Hacer solicitudes para fechas especificas
- [x] Incluir los endpoints en el dominio de Technodomus.
