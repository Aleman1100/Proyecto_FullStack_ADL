const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: '',
    database: 'agendasamus',
    port: 5432
});

async function nuevoMensaje(contenido, seccion, multimedia, autor){
    try{
        const result = await pool.query(
            `INSERT INTO mensajes (contenido, seccion, multimedia, autor, visible) 
            values ($1,$2,$3,$4,false) RETURNING *;`,
            [contenido, seccion, multimedia, autor]
        );
        return result.rows;
    }   catch(e)
    {
        return e;
    }
}

async function getMensajes() {
    try {
        const result = await pool.query(`SELECT * FROM mensajes`);
        return result.rows;
    }   catch(e) {
        return e;
    }
}

async function editMensajes(id, newContenido){
    try {
        const res = await pool.query(
            `UPDATE mensajes SET contenido = $2
            WHERE id = $1 RETURNING*;`,
            [id, newContenido]
        );
        return res.rows;
    } catch (e) {
        console.log(e)
    }
}

async function validarMensajes(id, visible){
    try {
        const res = await pool.query(
            `UPDATE mensajes SET visible = $2
            WHERE id = $1 RETURNING*;`,
            [id, visible]
        );
        return res.rows;
    } catch (e) {
        console.log(e)
    }
}

async function deleteMensajes(id) {
    try {
        const result = await pool.query(
            `DELETE FROM mensajes WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rowCount;
    }   catch (e) {
        return e
    }
}

module.exports = {
    nuevoMensaje,
    getMensajes,
    editMensajes,
    validarMensajes,
    deleteMensajes,
}