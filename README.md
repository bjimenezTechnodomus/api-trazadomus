# API para ciclos de Plasma de Trazadomus

**Advertencia** La API aún se encuentra en desarrollo y en pruebas. Usela con precaución.

## Servicios disponibles.

Se pueden solicitar datos con solicitudes http `GET` a la URL `trazadomus-api.technodomus.com` en los siguientes endpoints:

*   `/ciclos`: Devuelve los últimos 50 ciclos.
    *   `size`: (opcional) Especifica el número de ciclos a devolver.
    *   `startDate`: (opcional) Fecha de inicio para filtrar los ciclos (formato YYYY-MM-DD).
    *   `endDate`: (opcional) Fecha de fin para filtrar los ciclos (formato YYYY-MM-DD).
*   `/equipos`: Devuelve los identificadores `idGRD` de cada equipo y su ubicación.
*   `/ciclos/{idGRD}`: Devuelve los últimos 50 ciclos del equipo especificado.
    *   `size`: (opcional) Especifica el número de ciclos a devolver.
    *   `start`: (opcional) Fecha de inicio para filtrar los ciclos (formato YYYY-MM-DD).
    *   `end`: (opcional) Fecha de fin para filtrar los ciclos (formato YYYY-MM-DD).
*   `/equipos/status/{idGRD}`: Devuelve el estado del equipo especificado.

## Ejemplo de uso

`curl 'https://trazadomus-api.technodomus.com/ciclos' | jq`
Devuelve la lista de los últimos 50 ciclos.

`curl 'https://trazadomus-api.technodomus.com/ciclos?size=10' | jq`
Devuelve la lista de los últimos 10 ciclos.

`curl 'https://trazadomus-api.technodomus.com/ciclos?startDate=2023-01-01&endDate=2023-01-31' | jq`
Devuelve la lista de ciclos entre el 1 y el 31 de enero de 2023.

`curl 'https://trazadomus-api.technodomus.com/equipos' | jq`
Devuelve la lista de los `idGRD` de los equipos.

`curl 'https://trazadomus-api.technodomus.com/ciclos/861' | jq`
Devuelve los últimos 50 ciclos del equipo con `idGRD` 861.

`curl 'https://trazadomus-api.technodomus.com/ciclos/861?size=5' | jq`
Devuelve los últimos 5 ciclos del equipo con `idGRD` 861.

`curl 'https://trazadomus-api.technodomus.com/equipos/status/861' | jq`
Devuelve el estado del equipo con `idGRD` 861.

## TODO
- [ ] Habilitar seguridad
- [x] Solicitar más o menos registros
- [x] Hacer solicitudes para fechas especificas
- [x] Incluir los endpoints en el dominio de Technodomus.
