"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
const pool = mysql2_1.default.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST
}).promise();
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Servidor iniciado en el puerto ${port}`);
});
app.use(express_1.default.json());
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ status: "API trazadomus" });
}));
app.get("/ciclos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { size } = req.query;
    const limit = Number(size) || 50;
    const { startDate, endDate } = req.query;
    const { query, parameters } = queryCiclos(0, limit, !!(startDate && endDate), startDate === null || startDate === void 0 ? void 0 : startDate.toString(), endDate === null || endDate === void 0 ? void 0 : endDate.toString());
    try {
        const [results] = yield pool.query(query, parameters);
        if (!results[0]) {
            res.json({ status: "No hay datos" });
        }
        else {
            res.json(results);
        }
    }
    catch (error) {
        res.status(500).json({ error: "Error en la base de datos", message: error.message });
    }
}));
app.get("/equipos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `select
    equipos.id as id,
    equipos.grdid as idGRD,
    c_ubicacion.strnombre as ubicacion
  from equipos
  left join c_equipo_ubicacion ON c_equipo_ubicacion.idequipo = equipos.id
  left join c_ubicacion on c_ubicacion.id  = c_equipo_ubicacion.idubicacion;`;
    try {
        const [results] = yield pool.query(query);
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: "Error en la base de datos", message: error.message });
    }
}));
app.get("/ciclos/:idGRD", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.idGRD);
    const { size } = req.query;
    const limit = Number(size) || 50;
    const { start, end } = req.query;
    const { query, parameters } = queryCiclos(id, limit, !!(start && end), start === null || start === void 0 ? void 0 : start.toString(), end === null || end === void 0 ? void 0 : end.toString());
    try {
        const [results] = yield pool.query(query, parameters);
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: "Error en la base de datos", message: error.message });
    }
}));
app.get("/equipos/status/:idGRD?", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idGRD = req.params.idGRD;
    let query = `
    SELECT
      e.id as idEquipo,
      e.grdid as idGRD,
      cu.strnombre as ubicacion,
      e.numciclos as ciclosTotales,
      e.numfallos as ciclosFallidos,
      e.numexitos as ciclosExitosos,
      e.strModo as modoCiclo,
      c.datefecha as ultimaFechaCiclo
    FROM equipos e
    LEFT JOIN c_equipo_ubicacion ceu ON ceu.idequipo = e.id
    LEFT JOIN c_ubicacion cu ON cu.id = ceu.idubicacion
    LEFT JOIN ciclos2 c ON c.id = (SELECT MAX(id) FROM ciclos2 WHERE grdid = e.grdid)
    WHERE e.numactivo = 1
  `;
    const parameters = [];
    if (idGRD) {
        query += ` AND e.grdid = ?`;
        parameters.push(idGRD);
    }
    try {
        const [results] = yield pool.query(query, parameters);
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: "Error en la base de datos", message: error.message });
    }
}));
function queryCiclos(idGRD = 0, max = 20, datesQuery = false, start, end) {
    const parameters = [];
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
}
;
//# sourceMappingURL=index.js.map