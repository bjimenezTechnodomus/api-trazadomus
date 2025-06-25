import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import { RowDataPacket } from "mysql2";
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST
}).promise();

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Servidor iniciado en el puerto ${port}`);
});
app.use(express.json());

app.get('/', async (req, res) => {
  res.json({status: "API trazadomus"});
});

app.get("/ciclos", async (req, res) => {
  const { size } = req.query;
  const limit:number = Number(size) || 50;
  const { startDate, endDate } = req.query;
  const { query, parameters } = queryCiclos(0, limit, !!(startDate && endDate), startDate?.toString(), endDate?.toString());
  try {
    const [results] = await pool.query<RowDataPacket[]>(query, parameters);
    if(!results[0]) {
      res.json({status: "No hay datos"});
    } else {
      res.json(results);
    }
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos", message: error.message });
  }
});

app.get("/equipos", async(req, res) => {
  const query =
  `select
    equipos.id as id,
    equipos.grdid as idGRD,
    c_ubicacion.strnombre as ubicacion
  from equipos
  left join c_equipo_ubicacion ON c_equipo_ubicacion.idequipo = equipos.id
  left join c_ubicacion on c_ubicacion.id  = c_equipo_ubicacion.idubicacion;`;
  try {
    const [results] = await pool.query<RowDataPacket[]>(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos", message: error.message });
  }
});

app.get("/ciclos/:idGRD", async (req, res) => {
  const id:number = Number(req.params.idGRD);
  const { size } = req.query;
  const limit:number = Number(size)||50;
  const { start, end } = req.query;

  const { query, parameters } = queryCiclos(id, limit, !!(start && end), start?.toString(), end?.toString());

  try {
    const [results] = await pool.query<RowDataPacket[]>(query, parameters);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos", message: error.message });
  }
});

app.get("/equipos/status/:idGRD?", async (req, res) => {
  const idGRD = req.params.idGRD;
  let query = `
    SELECT
      r.date as ultimaConexion,
      e.grdid as idGRD,
      cu.strnombre as ubicacion,
      ceu.numactivo as activo
    FROM (((equipos e
      JOIN c_equipo_ubicacion ceu ON ((ceu.idequipo = e.id)))
      JOIN c_ubicacion cu ON ((cu.id = ceu.idubicacion)))
      LEFT JOIN reports r ON ((r.grd_id = e.grdid)))
    WHERE ceu.numactivo = 1 AND r.date IS NOT NULL
  `;

  const parameters = [];
  if (idGRD) {
    query += ` AND e.grdid = ?`;
    parameters.push(idGRD);
  }

  try {
    const [results] = await pool.query<RowDataPacket[]>(query, parameters);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Error en la base de datos", message: error.message });
  }
});

function queryCiclos(idGRD = 0, max = 20, datesQuery = false, start?: string, end?: string) {
  const parameters: any[] = [];
  const baseQuery = `SELECT
      id AS idCiclo,
      grdid AS idGRD,
      strubicacion AS Ubicación,
      datefecha AS FechaHora,
      p17 AS "NodeRegistro",
      CAST(p18 AS DATE) AS "FechaEsterilización",
      TIME(p19) AS "HoraEsterilización",
      p20 AS "CiclosTotales",
      p21 AS "CiclosFallidos",
      p22 AS "CiclosExitosos",
      p23 AS "ModoCiclo",
      p1 AS "CodigoError",
      SEC_TO_TIME(p3) AS "TiempoTotalCiclo",
      SEC_TO_TIME(p15) AS "1Inyección",
      SEC_TO_TIME(p14) AS "1Difusión",
      SEC_TO_TIME(p13) AS "1Plasma",
      SEC_TO_TIME(p12) AS "2Inyección",
      SEC_TO_TIME(p11) AS "2Difusión",
      SEC_TO_TIME(p10) AS "2Plasma",
      SEC_TO_TIME(p9) AS "TiempoAereación",
      SEC_TO_TIME(p16) AS "TiempoVaciado",
      p4 AS "ConcentraciónH2O2",
      FORMAT(p5/10,2) AS "TMaxPlasma",
      FORMAT(p6/10,2) AS "TMinPlasma",
      p7 AS "PMaxPlasma",
      p8 AS "PMinPlasma",
      p25 AS "Exito",
      numparomanual AS "ParoManual",
      numconsumo AS "Facturable"
      FROM ciclos2`;

  let whereClause = "";
  const whereConditions = [];

  if (idGRD) {
    whereConditions.push(`grdid = ?`);
    parameters.push(idGRD);
  }

  if (datesQuery && start && end) {
    whereConditions.push(`datefecha BETWEEN ? AND ?`);
    parameters.push(start, end);
  }

  if (whereConditions.length > 0) {
    whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
  }

  const orderByClause = " ORDER BY datefecha DESC";
  let limitClause = "";
  if (max > 0) {
      limitClause = ` LIMIT ?`;
      parameters.push(max);
  }

  return {
    query: `${baseQuery}${whereClause}${orderByClause}${limitClause}`,
    parameters
  };
};
