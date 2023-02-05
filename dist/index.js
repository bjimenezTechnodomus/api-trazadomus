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
const mysql_1 = __importDefault(require("mysql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Servidor iniciado en el puerto ${port}`);
});
app.use(express_1.default.json());
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ status: "API trazadomus en línea" });
}));
app.get("/ciclos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = queryCiclos(0, 50);
    pool.query(query, (error, results) => {
        if (error)
            throw error;
        if (!results[0]) {
            res.json({ status: "No hay datos" });
        }
        else {
            res.json(results);
        }
    });
}));
app.get("/equipos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `select
    equipos.grdid as idGRD,
    c_ubicacion.strnombre as ubicacion
  from equipos
  left join c_equipo_ubicacion ON c_equipo_ubicacion.idequipo = equipos.id
  left join c_ubicacion on c_ubicacion.id  = c_equipo_ubicacion.idubicacion;`;
    pool.query(query, (error, results) => {
        if (error) {
            res.json(error);
            throw error;
        }
        else {
            res.json(results);
        }
    });
}));
app.get("/equipos/:idGRD", (req, res) => {
    const id = Number(req.params.idGRD);
    const query = queryCiclos(id);
    pool.query(query, (error, results) => {
        if (error) {
            res.json(error);
            throw error;
        }
        else {
            res.json(results);
        }
        ;
    });
});
const pool = mysql_1.default.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST
});
function queryCiclos(idGRD = 0, max = 20) {
    const query = `SELECT
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
    if (idGRD) {
        return `${query}
      WHERE grdid = ${idGRD}
      ORDER BY datefecha DESC
      LIMIT ${max}`;
    }
    ;
    return `${query}
    ORDER BY datefecha DESC
    LIMIT ${max}`;
}
;
//# sourceMappingURL=index.js.map